"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Home, ArrowLeft, FolderPlus, ArrowUpDown, Menu } from "lucide-react"
import type { SortBy } from "@/lib/db/books"

interface MobileMenuProps {
  currentFolderName?: string
  bookCount: number
  onBackToRoot?: () => void
  onHomeClick: () => void
  onCreateFolder: () => void
  sortBy: SortBy
  onSortChange: (sortBy: SortBy) => void
}

const sortLabels: Record<SortBy, string> = {
  name: "Name (A-Z)",
  addedAt: "Date Added",
  lastReadAt: "Last Read",
  progress: "Progress",
}

export function MobileMenu({
  currentFolderName,
  bookCount,
  onBackToRoot,
  onHomeClick,
  onCreateFolder,
  sortBy,
  onSortChange,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const handleSortChange = (newSortBy: SortBy) => {
    onSortChange(newSortBy)
    setOpen(false)
  }

  const handleCreateFolder = () => {
    onCreateFolder()
    setOpen(false)
  }

  const handleBackToRoot = () => {
    onBackToRoot?.()
    setOpen(false)
  }

  const handleHomeClick = () => {
    onHomeClick()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>
            {currentFolderName ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Library</span>
                <span className="text-xs">›</span>
                <span className="text-lg">{currentFolderName}</span>
              </div>
            ) : (
              "Library"
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="text-sm text-muted-foreground">
            {bookCount} {bookCount === 1 ? "item" : "items"}
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleHomeClick}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>

            {currentFolderName && onBackToRoot && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleBackToRoot}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            )}

            {!currentFolderName && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="h-4 w-4" />
                New Folder
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Sort by</div>
            {Object.entries(sortLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleSortChange(key as SortBy)}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
