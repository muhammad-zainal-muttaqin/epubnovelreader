"use client"

import { Button } from "@/components/ui/button"
import { Home, ChevronRight, FolderPlus, ArrowUpDown, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { SortBy } from "@/lib/db/books"

interface LibraryHeaderProps {
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

export function LibraryHeader({
  currentFolderName,
  bookCount,
  onBackToRoot,
  onHomeClick,
  onCreateFolder,
  sortBy,
  onSortChange,
}: LibraryHeaderProps) {
  return (
    <div className="container mx-auto max-w-5xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onHomeClick} 
          className="h-9 w-9"
          title="Back to Home"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        {currentFolderName && onBackToRoot && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBackToRoot} 
            className="h-9 w-9"
            title="Back to Library Root"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-baseline gap-2">
          {currentFolderName ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Library</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-xl font-semibold text-foreground">{currentFolderName}</span>
            </div>
          ) : (
            <h1 className="text-xl font-semibold">Library</h1>
          )}
          <span className="text-sm text-muted-foreground">
            {bookCount} {bookCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange("name")}>
              {sortLabels.name}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("addedAt")}>
              {sortLabels.addedAt}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("lastReadAt")}>
              {sortLabels.lastReadAt}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("progress")}>
              {sortLabels.progress}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!currentFolderName && (
          <Button variant="outline" size="sm" onClick={onCreateFolder} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Folder</span>
          </Button>
        )}
      </div>
    </div>
  )
}

