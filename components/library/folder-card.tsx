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
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      onDelete()
    }
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRename()
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={onClick} role="button">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {bookCovers.length > 0 ? (
              <div className="grid h-full w-full grid-cols-2 gap-0.5">
                {bookCovers.slice(0, 4).map((cover, idx) => (
                  <div key={idx} className="relative overflow-hidden bg-muted">
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {bookCovers.length < 4 &&
                  Array.from({ length: 4 - bookCovers.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-muted/50 flex items-center justify-center">
                      <Folder className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  ))}
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
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTimeout(handleRename, 50); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setTimeout(handleDelete, 50); }} className="text-destructive">
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

