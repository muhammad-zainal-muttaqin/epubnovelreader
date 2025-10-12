"use client"

import { useEffect, useState } from "react"
import { getBooksByFolder, getAllBooks, type SortBy } from "@/lib/db/books"
import { deleteBook, updateBook } from "@/lib/db/books"
import { deleteChaptersByBook } from "@/lib/db/chapters"
import { getAllFolders, saveFolder, deleteFolder as deleteFolderDb, updateFolder } from "@/lib/db/folders"
import type { Book, Folder } from "@/lib/types"
import { UploadButton } from "@/components/library/upload-button"
import { BookCard } from "@/components/library/book-card"
import { FolderCard } from "@/components/library/folder-card"
import { CreateFolderDialog } from "@/components/library/create-folder-dialog"
import { MoveBookDialog } from "@/components/library/move-book-dialog"
import { LibraryHeader } from "@/components/library/library-header"
import { Loader2, Moon, Sun, BookOpen, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>("lastReadAt")
  const [isLoading, setIsLoading] = useState(true)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)
  const [moveBookOpen, setMoveBookOpen] = useState(false)
  const [movingBook, setMovingBook] = useState<Book | null>(null)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadData = async () => {
    try {
      const [allFolders, displayBooks, allBooksData] = await Promise.all([
        getAllFolders(),
        getBooksByFolder(currentFolderId, sortBy),
        getAllBooks("name")
      ])
      setFolders(allFolders)
      setBooks(displayBooks)
      setAllBooks(allBooksData)
    } catch (error) {
      console.error("Error loading library:", error)
      toast({
        title: "Error loading library",
        description: "Failed to load your library",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentFolderId, sortBy])

  const handleDeleteBook = async (bookId: string) => {
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

  const handleCreateFolder = async (name: string) => {
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, { name })
        setFolders((prev) =>
          prev.map((f) => (f.id === editingFolder.id ? { ...f, name } : f))
        )
        toast({
          title: "Folder renamed",
          description: `Folder renamed to "${name}"`,
        })
        setEditingFolder(null)
      } else {
        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name,
          createdAt: Date.now(),
          sortOrder: folders.length,
        }
        await saveFolder(newFolder)
        setFolders((prev) => [...prev, newFolder])
        toast({
          title: "Folder created",
          description: `Folder "${name}" has been created`,
        })
      }
    } catch (error) {
      console.error("Error with folder:", error)
      toast({
        title: "Operation failed",
        description: "Failed to save folder",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const booksInFolder = await getBooksByFolder(folderId)
      
      if (booksInFolder.length > 0) {
        const shouldDelete = confirm(
          `This folder contains ${booksInFolder.length} book(s). Delete folder and move books to root?`
        )
        if (!shouldDelete) return

        for (const book of booksInFolder) {
          await updateBook(book.id, { folderId: undefined })
        }
      }

      await deleteFolderDb(folderId)
      setFolders((prev) => prev.filter((f) => f.id !== folderId))
      
      if (currentFolderId === folderId) {
        setCurrentFolderId(null)
      }

      toast({
        title: "Folder deleted",
        description: "Folder has been removed",
      })
    } catch (error) {
      console.error("Error deleting folder:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setEditingFolder({ id: folderId, name: currentName })
    setCreateFolderOpen(true)
  }

  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId)
  }

  const handleBackToRoot = () => {
    setCurrentFolderId(null)
  }

  const handleMoveBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    if (book) {
      setMovingBook(book)
      setMoveBookOpen(true)
    }
  }

  const handleMoveBookSubmit = async (folderId: string | null) => {
    if (!movingBook) return

    try {
      await updateBook(movingBook.id, { folderId: folderId || undefined })
      
      toast({
        title: "Book moved",
        description: `"${movingBook.title}" has been moved`,
      })
      
      setMovingBook(null)
      await loadData()
    } catch (error) {
      console.error("Error moving book:", error)
      toast({
        title: "Move failed",
        description: "Failed to move book",
        variant: "destructive",
      })
    }
  }

  const getFolderBookCovers = (folderId: string): string[] => {
    const folderBooks = allBooks.filter((b) => b.folderId === folderId)
    return folderBooks
      .filter((b) => b.cover)
      .slice(0, 4)
      .map((b) => b.cover!)
  }

  const getFolderBookCount = (folderId: string): number => {
    return allBooks.filter((b) => b.folderId === folderId).length
  }

  const currentFolder = currentFolderId ? folders.find((f) => f.id === currentFolderId) : null
  const displayedFolders = currentFolderId ? [] : folders
  const displayedBooks = currentFolderId 
    ? books.filter((b) => b.folderId === currentFolderId)
    : books.filter((b) => !b.folderId)
  
  const totalItems = displayedFolders.length + displayedBooks.length

  return (
    <div className="min-h-screen bg-background scrollbar-hide overflow-y-auto">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
        <LibraryHeader
          currentFolderName={currentFolder?.name}
          bookCount={totalItems}
          onBackToRoot={currentFolderId ? handleBackToRoot : undefined}
          onCreateFolder={() => {
            setEditingFolder(null)
            setCreateFolderOpen(true)
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <div className="container mx-auto max-w-5xl flex items-center justify-end mt-2">
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
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted/40 p-6 mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {currentFolderId ? "No books in this folder" : "No books yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {currentFolderId 
                ? "Move some books to this folder or upload new ones."
                : "Upload your first EPUB to start your library."}
            </p>
            <UploadButton onUploadComplete={loadData} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 pb-20">
            {displayedFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                bookCount={getFolderBookCount(folder.id)}
                bookCovers={getFolderBookCovers(folder.id)}
                onClick={() => handleOpenFolder(folder.id)}
                onRename={() => handleRenameFolder(folder.id, folder.name)}
                onDelete={() => handleDeleteFolder(folder.id)}
              />
            ))}
            {displayedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onDelete={handleDeleteBook}
                onMove={handleMoveBook}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && totalItems > 0 && (
        <div className="fixed bottom-8 right-6 z-50 pb-[env(safe-area-inset-bottom)]">
          <UploadButton onUploadComplete={loadData} className="h-14 w-14 rounded-full shadow-lg p-0">
            <Upload className="h-6 w-6" />
          </UploadButton>
        </div>
      )}

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={handleCreateFolder}
        existingFolderNames={folders.map((f) => f.name)}
        editingFolder={editingFolder}
      />

      <MoveBookDialog
        open={moveBookOpen}
        onOpenChange={setMoveBookOpen}
        onMove={handleMoveBookSubmit}
        folders={folders}
        currentFolderId={movingBook?.folderId}
        bookTitle={movingBook?.title || ""}
      />
    </div>
  )
}
