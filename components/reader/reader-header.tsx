"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFolder } from '@/lib/db/folders'
import { useEffect, useState } from 'react'

interface ReaderHeaderProps {
  bookTitle: string
  chapterTitle: string
  progress: number
  onSettingsClick: () => void
  bookFolderId?: string
}

export function ReaderHeader({ bookTitle, chapterTitle, progress, onSettingsClick, bookFolderId }: ReaderHeaderProps) {
  const router = useRouter()
  const [folderSlug, setFolderSlug] = useState<string | null>(null)

  // Load folder slug when bookFolderId changes
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
      // Navigate back to the specific folder using slug
      router.push(`/library?folder=${folderSlug}`)
    } else {
      // Navigate back to library root
      router.push("/library")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 smooth-transition">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-tight">{bookTitle}</h1>
            <p className="text-xs text-muted-foreground">{chapterTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">{Math.round(progress)}%</span>
          <Button variant="ghost" size="icon" onClick={onSettingsClick} className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
