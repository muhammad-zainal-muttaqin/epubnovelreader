"use client"

import { Button } from "@/components/ui/button"
import { Home, ChevronRight, FolderPlus, ArrowUpDown, ArrowLeft, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MobileMenu } from "./mobile-menu"
import { useTheme } from "next-themes"
import type { SortBy } from "@/lib/db/books"
import { toggleThemeWithTransition } from "@/lib/theme-transition"

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
  const { theme, setTheme } = useTheme()
  return (
    <div className="container mx-auto max-w-5xl flex items-center justify-between">
      {/* Mobile: Burger menu */}
      <div className="flex md:hidden items-center gap-2 flex-1">
        <MobileMenu
          currentFolderName={currentFolderName}
          bookCount={bookCount}
          onBackToRoot={onBackToRoot}
          onHomeClick={onHomeClick}
          onCreateFolder={onCreateFolder}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
        <div className="flex items-baseline gap-2">
          {currentFolderName ? (
            <div className="flex items-center gap-2 text-lg text-muted-foreground">
              <button 
                onClick={onBackToRoot}
                className="text-primary hover:text-primary/80 transition-colors cursor-pointer hover:underline"
                title="Back to Library Root"
              >
                Library
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-lg font-semibold text-foreground">{currentFolderName}</span>
            </div>
          ) : (
            <h1 className="text-lg font-semibold">Library</h1>
          )}
          <span className="text-xs text-muted-foreground">
            {bookCount} {bookCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Mobile: Theme toggle */}
      <div className="flex md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
          aria-label="Toggle theme"
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Desktop: Full layout */}
      <div className="hidden md:flex items-center gap-4 flex-1">
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
            <div className="flex items-center gap-2 text-xl text-muted-foreground">
              <button 
                onClick={onBackToRoot}
                className="text-primary hover:text-primary/80 transition-colors cursor-pointer hover:underline"
                title="Back to Library Root"
              >
                Library
              </button>
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

      {/* Desktop: Actions */}
      <div className="hidden md:flex items-center gap-2">
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

        <Button
          variant="outline"
          size="icon"
          onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
          aria-label="Toggle theme"
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </div>
  )
}

