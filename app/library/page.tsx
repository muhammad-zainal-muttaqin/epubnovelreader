"use client"

import { useEffect, useState } from "react"
import { getAllBooks } from "@/lib/db/books"
import { deleteBook } from "@/lib/db/books"
import { deleteChaptersByBook } from "@/lib/db/chapters"
import type { Book } from "@/lib/types"
import { UploadButton } from "@/components/library/upload-button"
import { BookCard } from "@/components/library/book-card"
import { EmptyState } from "@/components/library/empty-state"
import { Loader2, Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadBooks = async () => {
    try {
      const allBooks = await getAllBooks()
      setBooks(allBooks)
    } catch (error) {
      console.error("Error loading books:", error)
      toast({
        title: "Error loading library",
        description: "Failed to load your books",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const handleDelete = async (bookId: string) => {
    try {
      await deleteBook(bookId)
      await deleteChaptersByBook(bookId)
      setBooks((prev) => prev.filter((b) => b.id !== bookId))
      toast({
        title: "Book deleted",
        description: "The book has been removed from your library",
      })
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the book",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background scrollbar-hide overflow-y-auto">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <UploadButton onUploadComplete={loadBooks} />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : books.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
