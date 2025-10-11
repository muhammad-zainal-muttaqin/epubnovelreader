"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReaderHeaderProps {
  bookTitle: string
  chapterTitle: string
  progress: number
  onSettingsClick: () => void
}

export function ReaderHeader({ bookTitle, chapterTitle, progress, onSettingsClick }: ReaderHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/library")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-tight">{bookTitle}</h1>
            <p className="text-xs text-muted-foreground">{chapterTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">{Math.round(progress)}%</span>
          <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
