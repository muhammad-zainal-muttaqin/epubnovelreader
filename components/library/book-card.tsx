"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Trash2, MoreVertical, FolderInput } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Book } from "@/lib/types"
import { useRouter } from "next/navigation"

interface BookCardProps {
  book: Book
  onDelete: (bookId: string) => void
  onMove?: (bookId: string) => void
}

export function BookCard({ book, onDelete, onMove }: BookCardProps) {
  const router = useRouter()

  const handleRead = () => {
    const chapterIndex = book.currentChapter || 0
    console.log("[v0] Opening book:", book.id, "at chapter:", chapterIndex)
    router.push(`/reader/${book.id}/${chapterIndex}`)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete(book.id)
    }
  }

  const handleMove = () => {
    if (onMove) {
      onMove(book.id)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Cover */}
          <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {book.cover ? (
              <img src={book.cover || "/placeholder.svg"} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between overflow-hidden">
            <div className="overflow-hidden">
              <h3 className="break-words font-semibold leading-tight" title={book.title}>{book.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground truncate" title={book.author}>{book.author}</p>
              {book.description && (
                <p className="mt-2 line-clamp-2 text-pretty text-xs text-muted-foreground">{book.description}</p>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {/* Progress info */}
              <div className="text-xs text-muted-foreground">
                {book.progress > 0 ? (
                  <span>{Math.round(book.progress)}% complete</span>
                ) : (
                  <span>{book.totalChapters} chapters</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <Button size="sm" onClick={handleRead} className="flex-1 max-w-[120px]">
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  <span className="truncate">{book.progress > 0 ? "Continue" : "Read"}</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onMove && (
                      <DropdownMenuItem onClick={() => setTimeout(handleMove, 50)}>
                        <FolderInput className="mr-2 h-4 w-4" />
                        Move to Folder
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
