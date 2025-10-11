"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Search, Check } from "lucide-react"
import type { Chapter, TOCChapter } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChapterSidebarProps {
  chapters: Chapter[]
  currentChapterIndex: number
  onChapterSelect: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  tocChapters?: TOCChapter[]
}

export function ChapterSidebar({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  open,
  onOpenChange,
  tocChapters,
}: ChapterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // If TOC chapters exist, use them. Otherwise show all chapters
  console.log("[ChapterSidebar] tocChapters:", tocChapters?.length || 0, "chapters:", chapters.length)
  
  const chaptersToShow = tocChapters && tocChapters.length > 0 ? tocChapters : chapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    startIndex: ch.index,
    endIndex: ch.index,
    href: ch.href
  }))
  
  console.log("[ChapterSidebar] Showing:", chaptersToShow.length, "items")

  const filteredChapters = chaptersToShow.filter((chapter) => 
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (index: number) => {
    onChapterSelect(index)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 scrollbar-hide">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Chapters</SheetTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] scrollbar-hide">
          <div className="p-2">
            {filteredChapters.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No chapters found</div>
            ) : (
              filteredChapters.map((chapter) => {
                // Check if current chapter index falls within this TOC chapter's range
                const isActive = currentChapterIndex >= chapter.startIndex && currentChapterIndex <= chapter.endIndex
                
                return (
                  <Button
                    key={chapter.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal mb-1 h-auto py-3 px-3",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(chapter.startIndex)}
                    title={chapter.title}
                  >
                    <div className="flex w-full items-start gap-2">
                      <span className="flex-1 text-sm leading-relaxed break-words whitespace-normal line-clamp-3">
                        {chapter.title}
                      </span>
                      {isActive && <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />}
                    </div>
                  </Button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
