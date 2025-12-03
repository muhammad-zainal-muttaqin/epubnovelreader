"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { getBook, updateBook } from "@/lib/db/books"
import { getChaptersByBook } from "@/lib/db/chapters"
import { updateProgress } from "@/lib/db/progress"
import { getTranslation, saveTranslation } from "@/lib/db/translations"
import { splitHtmlIntoChunks } from "@/lib/html-utils"
import type { Book, Chapter, ReaderSettings, TOCChapter } from "@/lib/types"
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/keys"
import { ReaderHeader } from "@/components/reader/reader-header"
import { ReaderFooter } from "@/components/reader/reader-footer"
import { ChapterSidebar } from "@/components/reader/chapter-sidebar"
import { ChapterContent } from "@/components/reader/chapter-content"
import { ProgressBar } from "@/components/reader/progress-bar"
import { SettingsDialog } from "@/components/reader/settings-dialog"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "sonner"

type ReaderCacheEntry = {
  book: Book
  chapters: Chapter[]
  tocChapters: TOCChapter[]
}

const readerCache = new Map<string, ReaderCacheEntry>()

export default function ReaderPage() {
  const params = useParams()
  const bookId = params.bookId as string
  const chapterId = params.chapterId as string
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const cachedData = readerCache.get(bookId)
  const initialChapterFromParam = Number.parseInt(chapterId)
  const [book, setBook] = useState<Book | null>(cachedData?.book ?? null)
  const [chapters, setChapters] = useState<Chapter[]>(cachedData?.chapters ?? [])
  const [tocChapters, setTocChapters] = useState<TOCChapter[]>(cachedData?.tocChapters ?? [])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    if (!Number.isNaN(initialChapterFromParam)) return initialChapterFromParam
    if (cachedData?.book?.currentChapter != null) return cachedData.book.currentChapter
    return 0
  })
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return DEFAULT_SETTINGS
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("")
  const [pendingChunks, setPendingChunks] = useState(0)
  const skeletonCacheRef = useRef<Map<string, string[]>>(new Map())
    const buildSkeletonForChunk = useCallback(
    (htmlChunk: string, seed: number, fontSize = settings.fontSize, maxWidth = settings.maxWidth) => {
      const charsPerLine = Math.max(16, Math.floor(maxWidth / Math.max(fontSize * 0.55, 6)))

      const textOnly = htmlChunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      const words = textOnly.length ? textOnly.split(" ") : [" "]

      const linesCollected: string[] = []
      let current = ""
      for (const word of words) {
        if (!current.length) {
          current = word
          continue
        }
        if ((current + " " + word).length > charsPerLine) {
          linesCollected.push(current)
          current = word
        } else {
          current += " " + word
        }
      }
      if (current.length) linesCollected.push(current)
      if (!linesCollected.length) linesCollected.push(" ")

      const rand = (i: number) => {
        const n = Math.sin(seed * 999 + i * 17) * 10000
        return n - Math.floor(n)
      }

      const lines = linesCollected.map((line, idx) => {
        const baseWidth = Math.min(100, Math.max(35, (line.length / charsPerLine) * 100))
        const jitter = (rand(idx) - 0.5) * 8
        const width = Math.max(32, Math.min(100, baseWidth + jitter))
        return `<div class="h-4 rounded bg-muted" style="width:${width}%"></div>`
      })

      return `
        <div class="space-y-2 animate-pulse my-4">
          ${lines.join("")}
        </div>
      `
    },
    [settings.fontSize, settings.maxWidth],
  )

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookData = await getBook(bookId)
        if (!bookData) {
          router.push("/library")
          return
        }

        const chaptersData = await getChaptersByBook(bookId)
        if (chaptersData.length === 0) {
          router.push("/library")
          return
        }

        setBook(bookData)
        setChapters(chaptersData)

        const chapterIndex = Number.parseInt(chapterId)
        if (chapterIndex >= 0 && chapterIndex < chaptersData.length) {
          setCurrentChapterIndex(chapterIndex)
        } else {
          setCurrentChapterIndex(0)
        }
        
        const savedTOCChapters = localStorage.getItem(`toc-chapters-${bookId}`)
        if (savedTOCChapters) {
          try {
            const parsed = JSON.parse(savedTOCChapters)
            setTocChapters(parsed)
            readerCache.set(bookId, { book: bookData, chapters: chaptersData, tocChapters: parsed })
          } catch {
            setTocChapters([])
            readerCache.set(bookId, { book: bookData, chapters: chaptersData, tocChapters: [] })
          }
        } else {
          setTocChapters([])
          readerCache.set(bookId, { book: bookData, chapters: chaptersData, tocChapters: [] })
        }
      } catch (error) {
        console.error("Error loading reader data:", error)
        router.push("/library")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [bookId, router])

  useEffect(() => {
    const loadChapterContent = async () => {
      const chapterIndex = Number.parseInt(chapterId)
      if (!isNaN(chapterIndex) && chapterIndex >= 0 && chapters.length > 0 && chapterIndex < chapters.length) {
        setCurrentChapterIndex(chapterIndex)
        setScrollProgress(0)
        
        const targetLang = settings.targetLanguage
        if (targetLang && targetLang !== "original") {
          const chapter = chapters[chapterIndex]
          const cached = await getTranslation(chapter.id, targetLang)
          if (cached) {
            setTranslatedContent(cached.content)
            setCurrentLanguage(targetLang)
          } else {
            setTranslatedContent(null)
            setCurrentLanguage("")
          }
        } else {
          setTranslatedContent(null)
          setCurrentLanguage("")
        }
      }
    }
    loadChapterContent()
  }, [chapterId, chapters.length])

  useEffect(() => {
    if (!chapters.length) return
    if (!("prefetch" in router) || typeof router.prefetch !== "function") return

    const targets = new Set<number>()
    for (let offset = 1; offset <= 3; offset++) {
      const nextIndex = currentChapterIndex + offset
      const prevIndex = currentChapterIndex - offset

      if (nextIndex < chapters.length) targets.add(nextIndex)
      if (prevIndex >= 0) targets.add(prevIndex)
    }

    targets.forEach((index) => {
      router.prefetch(`/reader/${bookId}/${index}`)
    })
  }, [bookId, chapters.length, currentChapterIndex, router])

  useEffect(() => {
    if (!book || chapters.length === 0) return

    const saveProgressData = async () => {
      const currentChapter = chapters[currentChapterIndex]
      if (!currentChapter) return

      const overallProgress = Math.min(((currentChapterIndex + scrollProgress / 100) / chapters.length) * 100, 100)

      await updateProgress(book.id, {
        chapterId: currentChapter.id,
        chapterIndex: currentChapterIndex,
        scrollPosition: scrollProgress,
        percentage: overallProgress,
      })

      await updateBook(book.id, {
        currentChapter: currentChapterIndex,
        progress: overallProgress,
        lastReadAt: Date.now(),
      })
    }

    const timer = setTimeout(saveProgressData, 1000)
    return () => clearTimeout(timer)
  }, [book, chapters, currentChapterIndex, scrollProgress])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          handlePrevChapter()
          break
        case "ArrowRight":
          e.preventDefault()
          handleNextChapter()
          break
        case "[":
          e.preventDefault()
          handleFontDecrease()
          break
        case "]":
          e.preventDefault()
          handleFontIncrease()
          break
        case "t":
          e.preventDefault()
          handleThemeToggle()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentChapterIndex, chapters.length, settings])

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const newIndex = currentChapterIndex - 1
      setCurrentChapterIndex(newIndex)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${newIndex}`)
    }
  }, [currentChapterIndex, bookId, router])

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      const newIndex = currentChapterIndex + 1
      setCurrentChapterIndex(newIndex)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${newIndex}`)
    }
  }, [currentChapterIndex, chapters.length, bookId, router])

  const handleChapterSelect = useCallback(
    (index: number) => {
      setCurrentChapterIndex(index)
      setScrollProgress(0)
      router.push(`/reader/${bookId}/${index}`)
    },
    [bookId, router],
  )

  const handleFontDecrease = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(14, prev.fontSize - 1),
    }))
  }, [])

  const handleFontIncrease = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(24, prev.fontSize + 1),
    }))
  }, [])

  const handleThemeToggle = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    const newTheme = theme === "light" ? "dark" : "light"
    
    if (event) {
      const { toggleThemeWithTransition } = require("@/lib/theme-transition")
      toggleThemeWithTransition(event, setTheme, theme)
    } else {
      setTheme(newTheme)
    }
    
    setSettings((prev) => ({
      ...prev,
      theme: newTheme as "light" | "dark",
    }))
  }, [theme, setTheme])

  const handleSettingsChange = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const currentChapter = chapters[currentChapterIndex]
  const overallProgress = Math.min(((currentChapterIndex + scrollProgress / 100) / chapters.length) * 100, 100)

  let displayChapterTitle = currentChapter?.title || ""
  if (tocChapters && tocChapters.length > 0) {
    const tocGroup = tocChapters.find(
      (tc) => currentChapterIndex >= tc.startIndex && currentChapterIndex <= tc.endIndex,
    )
    if (tocGroup) {
      displayChapterTitle = tocGroup.title
    }
  }

  const handleTranslate = useCallback(async (targetLang: string, force: boolean = false) => {
    const currentChapter = chapters[currentChapterIndex]
    if (!currentChapter) return

    if (targetLang === "original") {
      setTranslatedContent(null)
      setCurrentLanguage("")
      setPendingChunks(0)
      setSettings((prev) => ({ ...prev, targetLanguage: "" }))
      return
    }

    if (!force && currentLanguage === targetLang && translatedContent) return
    
    setSettings((prev) => ({ ...prev, targetLanguage: targetLang }))

    if (!force) {
      const cached = await getTranslation(currentChapter.id, targetLang)
      if (cached) {
        setTranslatedContent(cached.content)
        setCurrentLanguage(targetLang)
        setPendingChunks(0)
        toast.success(`Loaded translation from cache`)
        return
      }
    }

    if (!settings.apiKey) {
      setSettingsOpen(true)
      toast.error("API Key Required", { description: "Please enter your Gemini API Key in settings." })
      return
    }

    setIsTranslating(true)
    setPendingChunks(0)
    setCurrentLanguage(targetLang)

    let hasTranslated = false

    try {
      const imgTags: string[] = []
      const contentWithPlaceholders = currentChapter.content.replace(/<img[^>]*>/g, (match) => {
        imgTags.push(match)
        return `__IMG_PLACEHOLDER_${imgTags.length - 1}__`
      })

      const chunks = splitHtmlIntoChunks(contentWithPlaceholders, 1200)
      setPendingChunks(chunks.length)

      const skeletonKey = `${currentChapter.id}-${targetLang}-${contentWithPlaceholders.length}-${chunks.length}-${chunks.map((c) => c.length).join(",")}`
      let skeletons = skeletonCacheRef.current.get(skeletonKey)
      if (!skeletons) {
        skeletons = chunks.map((chunk, idx) => buildSkeletonForChunk(chunk, idx))
        skeletonCacheRef.current.set(skeletonKey, skeletons)
      }
      const translatedParts: string[] = Array(chunks.length).fill("")

      if (skeletons.length > 0) {
        setTranslatedContent(skeletons.join(""))
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        try {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-google-api-key": settings.apiKey,
            },
            body: JSON.stringify({
              text: chunk,
              targetLang,
              bookTitle: book?.title || "",
              chapterTitle: displayChapterTitle,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Translation failed")
          }

          let chunkTranslated = data.translatedText
          
          imgTags.forEach((tag, index) => {
            const placeholderRegex = new RegExp(`__\\s*IMG_PLACEHOLDER_${index}\\s*__`, "gi")
            chunkTranslated = chunkTranslated.replace(placeholderRegex, tag)
          })

          translatedParts[i] = chunkTranslated
          hasTranslated = true

          const remaining = Math.max(chunks.length - i - 1, 0)
          setTranslatedContent(
            translatedParts
              .map((part, idx) => part || skeletons[idx])
              .join(""),
          )
          setPendingChunks(remaining)
          
        } catch (chunkError) {
          console.error(`Error translating chunk ${i}:`, chunkError)
          let chunkOriginal = chunk
          imgTags.forEach((tag, index) => {
            const placeholderRegex = new RegExp(`__\\s*IMG_PLACEHOLDER_${index}\\s*__`, "gi")
            chunkOriginal = chunkOriginal.replace(placeholderRegex, tag)
          })
          translatedParts[i] = chunkOriginal 
          hasTranslated = true
          const remaining = Math.max(chunks.length - i - 1, 0)
          setTranslatedContent(
            translatedParts
              .map((part, idx) => part || skeletons[idx])
              .join(""),
          )
          toast.error(`Part of translation failed, showing original for that section.`)
          setPendingChunks(remaining)
        }
      }

      const finalContent = translatedParts.join("")

      await saveTranslation({
        id: `${currentChapter.id}-${targetLang}`,
        chapterId: currentChapter.id,
        language: targetLang,
        content: finalContent,
        translatedAt: Date.now(),
      })

      toast.success(`Translation complete`)
      setTranslatedContent(finalContent)
      setPendingChunks(0)
    } catch (error: any) {
      console.error("Translation error:", error)
      toast.error("Translation Failed", { description: error.message })
      if (!hasTranslated) {
        setTranslatedContent(null)
        setCurrentLanguage("")
      }
    } finally {
      setIsTranslating(false)
    }
  }, [chapters, currentChapterIndex, settings.apiKey, currentLanguage, translatedContent, book?.title, displayChapterTitle, buildSkeletonForChunk])

  const handleBackToTop = useCallback(() => {
    const selectors = [
      '[data-chapter-content]',
      '.overflow-y-auto',
      'div[class*="overflow-y-auto"]'
    ]
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element && element.scrollHeight > element.clientHeight) {
        const originalScrollBehavior = element.style.scrollBehavior
        element.style.scrollBehavior = 'auto'
        
        const startPosition = element.scrollTop
        const distance = startPosition
        const duration = Math.min(800, Math.max(300, distance * 0.5))
        let startTime: number | null = null

        const easeInOutCubic = (t: number): number => {
          return t < 0.5 
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime
          const timeElapsed = currentTime - startTime
          const progress = Math.min(timeElapsed / duration, 1)
          
          const easedProgress = easeInOutCubic(progress)
          element.scrollTop = startPosition - (distance * easedProgress)
          
          if (progress < 1) {
            requestAnimationFrame(animation)
          } else {
            element.style.scrollBehavior = originalScrollBehavior
          }
        }
        
        requestAnimationFrame(animation)
        return
      }
    }
    
    const startPosition = window.pageYOffset
    const distance = startPosition
    const duration = Math.min(800, Math.max(300, distance * 0.5))
    let startTime: number | null = null

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      const easedProgress = easeInOutCubic(progress)
      window.scrollTo(0, startPosition - (distance * easedProgress))
      
      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }
    
    requestAnimationFrame(animation)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!book || chapters.length === 0) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-[#f9f7f1] text-foreground dark:bg-gradient-to-br dark:from-[#070b12] dark:via-[#0a0f18] dark:to-[#0d111b]">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-400/5 blur-3xl dark:bg-emerald-500/10" />
      </div>
      
      <div className="relative z-10 flex h-full flex-col">
        <ProgressBar progress={overallProgress} />

        <ReaderHeader
          bookTitle={book.title}
          chapterTitle={displayChapterTitle}
          progress={overallProgress}
          onSettingsClick={() => setSettingsOpen(true)}
          bookFolderId={book.folderId}
          apiKey={settings.apiKey}
          isTranslating={isTranslating}
          currentLanguage={currentLanguage}
          onTranslate={handleTranslate}
        />

        <main className="flex-1">
          <ChapterContent
            content={translatedContent || currentChapter.content}
            fontSize={settings.fontSize}
            fontFamily={settings.fontFamily}
            lineHeight={settings.lineHeight}
            maxWidth={settings.maxWidth}
            textAlign={settings.textAlign}
            onScroll={setScrollProgress}
            isTranslating={isTranslating}
            pendingChunks={pendingChunks}
          />
        </main>

        <ReaderFooter
          hasPrev={currentChapterIndex > 0}
          hasNext={currentChapterIndex < chapters.length - 1}
          onPrev={handlePrevChapter}
          onNext={handleNextChapter}
          onFontDecrease={handleFontDecrease}
          onFontIncrease={handleFontIncrease}
          onThemeToggle={handleThemeToggle}
          onChapterListToggle={() => setSidebarOpen(true)}
          onBackToTop={handleBackToTop}
          theme={(theme as "light" | "dark") || "light"}
        />
      </div>

      <ChapterSidebar
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterSelect={handleChapterSelect}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        tocChapters={tocChapters}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <Toaster />
    </div>
  )
}
