"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Type, Moon, Sun, List } from 'lucide-react'

interface ReaderFooterProps {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  onFontDecrease: () => void
  onFontIncrease: () => void
  onThemeToggle: () => void
  onChapterListToggle: () => void
  theme: "light" | "dark"
}

export function ReaderFooter({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onFontDecrease,
  onFontIncrease,
  onThemeToggle,
  onChapterListToggle,
  theme,
}: ReaderFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onChapterListToggle}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onFontDecrease}>
              <Type className="h-3.5 w-3.5" />
              <span className="ml-0.5 text-xs">−</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onFontIncrease}>
              <Type className="h-4 w-4" />
              <span className="ml-0.5 text-xs">+</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onThemeToggle}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Prev</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext} disabled={!hasNext}>
              <span className="mr-1 hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
