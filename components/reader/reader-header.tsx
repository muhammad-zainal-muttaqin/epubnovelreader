"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Loader2, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFolder } from '@/lib/db/folders'
import { useEffect, useState, useRef } from 'react'
import { TranslateMenu } from "./translate-menu"
import { Badge } from "@/components/ui/badge"

interface ReaderHeaderProps {
  bookTitle: string
  chapterTitle: string
  progress: number
  onSettingsClick: () => void
  bookFolderId?: string
  apiKey?: string
  isTranslating: boolean
  currentLanguage: string
  onTranslate: (lang: string, force?: boolean) => void
}

export function ReaderHeader({ 
  bookTitle, 
  chapterTitle, 
  progress, 
  onSettingsClick, 
  bookFolderId,
  apiKey,
  isTranslating,
  currentLanguage,
  onTranslate
}: ReaderHeaderProps) {
  const router = useRouter()
  const [folderSlug, setFolderSlug] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Ignore negative scroll (iOS bounce)
      if (currentScrollY < 0) return

      // Always show at the very top
      if (currentScrollY < 10) {
        setIsVisible(true)
      } else {
        // Show when scrolling up, hide when scrolling down
        if (currentScrollY < lastScrollY.current) {
          setIsVisible(true)
        } else if (currentScrollY > lastScrollY.current) {
          setIsVisible(false)
        }
      }
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (bookFolderId) {
      getFolder(bookFolderId).then(folder => {
        if (folder?.slug) {
          setFolderSlug(folder.slug)
        }
      }).catch(console.error)
    } else {
      setFolderSlug(null)
    }
  }, [bookFolderId])

  const handleBackClick = () => {
    if (folderSlug) {
      router.push(`/library?folder=${folderSlug}`)
    } else {
      router.push("/library")
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block min-w-0 overflow-hidden">
            <h1 className="text-sm font-semibold leading-tight truncate">{bookTitle}</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{chapterTitle}</p>
              
              {isTranslating && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal animate-pulse gap-1 bg-primary/10 text-primary border-primary/20">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Translating...
                </Badge>
              )}
              
              {!isTranslating && currentLanguage && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <Globe className="h-2.5 w-2.5" />
                  {currentLanguage}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="hidden text-xs text-muted-foreground sm:inline mr-2">{Math.round(progress)}%</span>
          
          <div className="sm:hidden flex items-center mr-1">
             {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
             {!isTranslating && currentLanguage && <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
          </div>

          <TranslateMenu
            apiKey={apiKey}
            isTranslating={isTranslating}
            currentLanguage={currentLanguage}
            onTranslate={onTranslate}
            onOpenSettings={onSettingsClick}
          />

          <Button variant="ghost" size="icon" onClick={onSettingsClick} className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
