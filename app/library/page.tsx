"use client"

import { useEffect, useState } from "react"
import { getAllBooks } from "@/lib/db/books"
import { deleteBook } from "@/lib/db/books"
import { deleteChaptersByBook } from "@/lib/db/chapters"
import type { Book } from "@/lib/types"
import { UploadButton } from "@/components/library/upload-button"
import { BookCard } from "@/components/library/book-card"
import { EmptyState } from "@/components/library/empty-state"
import { Loader2, Moon, Sun, Home, BookOpen, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/")} className="h-9 w-9">
              <Home className="h-4 w-4" />
            </Button>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold">Library</h1>
              <span className="text-sm text-muted-foreground">
                {books.length} {books.length === 1 ? "book" : "books"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-4">
        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted/40 p-6 mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No books yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Upload your first EPUB to start your library.
            </p>
            <UploadButton onUploadComplete={loadBooks} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 pb-20">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* FAB for non-empty state */}
      {!isLoading && books.length > 0 && (
        <div className="fixed bottom-8 right-6 z-50 pb-[env(safe-area-inset-bottom)]">
          <UploadButton onUploadComplete={loadBooks} className="h-14 w-14 rounded-full shadow-lg p-0">
            <Upload className="h-6 w-6" />
          </UploadButton>
        </div>
      )}
    </div>
  )
}
