"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Type, Moon, Sun, List, ArrowUp } from 'lucide-react'

interface ReaderFooterProps {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  onFontDecrease: () => void
  onFontIncrease: () => void
  onThemeToggle: (event?: React.MouseEvent<HTMLElement>) => void
  onChapterListToggle: () => void
  onBackToTop: () => void
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
  onBackToTop,
  theme,
}: ReaderFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 smooth-transition">
      <div className="container mx-auto max-w-5xl px-4 py-3">
        {/* Mobile toolbar: equal spacing using grid */}
        <div className="sm:hidden grid grid-cols-7 items-center gap-0">
          <Button variant="ghost" size="sm" onClick={onChapterListToggle} className="h-9 w-10 justify-center">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onFontDecrease} className="h-9 w-10 justify-center">
            <Type className="h-3.5 w-3.5" />
            <span className="text-xs">−</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onFontIncrease} className="h-9 w-10 justify-center">
            <Type className="h-4 w-4" />
            <span className="text-xs">+</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => onThemeToggle(e)} className="h-9 w-10 justify-center">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onBackToTop} className="h-9 w-10 justify-center">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev} className="h-9 w-10 justify-center">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext} disabled={!hasNext} className="h-9 w-10 justify-center">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop/tablet toolbar */}
        <div className="hidden sm:flex items-center justify-between gap-2">
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
            <Button variant="ghost" size="sm" onClick={(e) => onThemeToggle(e)}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>

          {/* Back to Top */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBackToTop}>
              <ArrowUp className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Top</span>
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
