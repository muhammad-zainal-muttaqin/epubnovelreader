"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { getBook, updateBook } from "@/lib/db/books"
import { getChaptersByBook } from "@/lib/db/chapters"
import { updateProgress } from "@/lib/db/progress"
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

export default function ReaderPage() {
  const params = useParams()
  const bookId = params.bookId as string
  const chapterId = params.chapterId as string
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [tocChapters, setTocChapters] = useState<TOCChapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // Load settings immediately from localStorage on mount
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return DEFAULT_SETTINGS
  })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Load settings from localStorage once on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS)
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
      console.log("[v0] Settings loaded from localStorage")
    }
  }, [])

  // Load book and chapters (only when bookId changes)
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading reader data for book:", bookId)

        const bookData = await getBook(bookId)
        console.log("[v0] Book data loaded:", bookData)

        if (!bookData) {
          console.error("[v0] Book not found, redirecting to library")
          router.push("/library")
          return
        }

        const chaptersData = await getChaptersByBook(bookId)
        console.log("[v0] Chapters loaded:", chaptersData.length)

        if (chaptersData.length === 0) {
          console.error("[v0] No chapters found, redirecting to library")
          router.push("/library")
          return
        }

        setBook(bookData)
        setChapters(chaptersData)

        const chapterIndex = Number.parseInt(chapterId)
        console.log("[v0] Chapter index:", chapterIndex)

        if (chapterIndex >= 0 && chapterIndex < chaptersData.length) {
          setCurrentChapterIndex(chapterIndex)
          console.log("[v0] Current chapter set to:", chapterIndex)
        } else {
          console.warn("[v0] Invalid chapter index, using 0")
          setCurrentChapterIndex(0)
        }
        
        // Load TOC chapters from localStorage
        const savedTOCChapters = localStorage.getItem(`toc-chapters-${bookId}`)
        if (savedTOCChapters) {
          setTocChapters(JSON.parse(savedTOCChapters))
          console.log("[v0] TOC chapters loaded from localStorage")
        }
      } catch (error) {
        console.error("[v0] Error loading reader data:", error)
        router.push("/library")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [bookId, router]) // Removed chapterId from dependencies

  // Update chapter index when URL changes (without re-fetching data)
  useEffect(() => {
    const chapterIndex = Number.parseInt(chapterId)
    if (!isNaN(chapterIndex) && chapterIndex >= 0 && chapters.length > 0 && chapterIndex < chapters.length) {
      setCurrentChapterIndex(chapterIndex)
      setScrollProgress(0)
    }
  }, [chapterId, chapters.length])

  // Save progress periodically
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

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(settings))
  }, [settings])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
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

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    setSettings((prev) => ({
      ...prev,
      theme: newTheme as "light" | "dark",
    }))
  }, [theme, setTheme])

  const handleSettingsChange = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleBackToTop = useCallback(() => {
    // Try multiple selectors to find the scrollable content
    const selectors = [
      '[data-chapter-content]',
      '.overflow-y-auto',
      'div[class*="overflow-y-auto"]'
    ]
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        // Check if element is actually scrollable
        if (element.scrollHeight > element.clientHeight) {
          // Temporarily disable CSS smooth scrolling to prevent conflicts
          const originalScrollBehavior = element.style.scrollBehavior
          element.style.scrollBehavior = 'auto'
          
          // Custom smooth scroll with ease-out animation
          const startPosition = element.scrollTop
          const distance = startPosition
          const duration = Math.min(800, Math.max(300, distance * 0.5)) // Dynamic duration based on distance
          let startTime: number | null = null

          const easeInOutCubic = (t: number): number => {
            return t < 0.5 
              ? 4 * t * t * t  // Ease-in cubic
              : 1 - Math.pow(-2 * t + 2, 3) / 2  // Ease-out cubic
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
              // Restore original scroll behavior after animation completes
              element.style.scrollBehavior = originalScrollBehavior
            }
          }
          
          requestAnimationFrame(animation)
          console.log('[BackToTop] Custom smooth scroll started')
          return
        }
      }
    }
    
    // Fallback: scroll the window with custom animation
    const startPosition = window.pageYOffset
    const distance = startPosition
    const duration = Math.min(800, Math.max(300, distance * 0.5))
    let startTime: number | null = null

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 
        ? 4 * t * t * t  // Ease-in cubic
        : 1 - Math.pow(-2 * t + 2, 3) / 2  // Ease-out cubic
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
    console.log('[BackToTop] Fallback: custom window scroll')
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

  const currentChapter = chapters[currentChapterIndex]
  const overallProgress = Math.min(((currentChapterIndex + scrollProgress / 100) / chapters.length) * 100, 100)

  // Determine display title consistent with TOC grouping
  let displayChapterTitle = currentChapter?.title || ""
  if (tocChapters && tocChapters.length > 0) {
    const tocGroup = tocChapters.find(
      (tc) => currentChapterIndex >= tc.startIndex && currentChapterIndex <= tc.endIndex,
    )
    if (tocGroup) {
      displayChapterTitle = tocGroup.title
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <ProgressBar progress={overallProgress} />

      <ReaderHeader
        bookTitle={book.title}
        chapterTitle={displayChapterTitle}
        progress={overallProgress}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <main className="flex-1">
        <ChapterContent
          content={currentChapter.content}
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily}
          lineHeight={settings.lineHeight}
          maxWidth={settings.maxWidth}
          textAlign={settings.textAlign}
          onScroll={setScrollProgress}
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
