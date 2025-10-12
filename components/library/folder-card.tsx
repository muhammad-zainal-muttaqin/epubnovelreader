"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, MoreVertical, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Folder as FolderType, Book } from "@/lib/types"

interface FolderCardProps {
  folder: FolderType
  bookCount: number
  bookCovers: string[]
  onClick: () => void
  onRename: () => void
  onDelete: () => void
}

export function FolderCard({ folder, bookCount, bookCovers, onClick, onRename, onDelete }: FolderCardProps) {
  // actions triggered from menu are deferred to allow popover to close first

  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "flex items-center justify-center" // Single book - centered
      case 2:
        return "grid grid-cols-2" // Two books - side by side
      case 3:
        return "grid grid-cols-2" // Three books - 2x2 grid with one empty
      case 4:
      default:
        return "grid grid-cols-2" // Four books - 2x2 grid
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={onClick} role="button">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {bookCovers.length > 0 ? (
              <div className={`h-full w-full ${getGridClass(bookCovers.length)} gap-0.5`}>
                {bookCovers.length === 1 ? (
                  // Single book - full size
                  <div className="relative overflow-hidden bg-muted h-full w-full">
                    <img src={bookCovers[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : bookCovers.length === 2 ? (
                  // Two books - side by side
                  bookCovers.map((cover, idx) => (
                    <div key={idx} className="relative overflow-hidden bg-muted">
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))
                ) : bookCovers.length === 3 ? (
                  // Three books - 2x2 grid with one empty
                  <>
                    {bookCovers.map((cover, idx) => (
                      <div key={idx} className="relative overflow-hidden bg-muted">
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <div className="bg-muted/50 flex items-center justify-center">
                      <Folder className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  </>
                ) : (
                  // Four or more books - 2x2 grid
                  bookCovers.slice(0, 4).map((cover, idx) => (
                    <div key={idx} className="relative overflow-hidden bg-muted">
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Folder className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-hidden">
            <div className="overflow-hidden">
              <h3 className="break-words font-semibold leading-tight" title={folder.name}>
                {folder.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {bookCount} {bookCount === 1 ? "book" : "books"}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTimeout(() => onRename(), 50); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTimeout(() => { if (confirm(`Are you sure you want to delete "${folder.name}"?`)) onDelete(); }, 50); }} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

