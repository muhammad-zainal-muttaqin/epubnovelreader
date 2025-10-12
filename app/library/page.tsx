"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getBooksByFolder, getAllBooks, getBook, type SortBy } from "@/lib/db/books"
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
import { Loader2, BookOpen, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortByLoaded, setSortByLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)
  const [moveBookOpen, setMoveBookOpen] = useState(false)
  const [movingBook, setMovingBook] = useState<Book | null>(null)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    
    // Load sorting preference from localStorage after mount
    const saved = localStorage.getItem("library-sort-by")
    if (saved && ["name", "addedAt", "lastReadAt", "progress"].includes(saved)) {
      setSortBy(saved as SortBy)
    }
    setSortByLoaded(true)
  }, [])

  // Save sorting preference to localStorage
  useEffect(() => {
    if (sortByLoaded) {
      localStorage.setItem("library-sort-by", sortBy)
    }
  }, [sortBy, sortByLoaded])

  // Reload data when sortBy or currentFolderId changes
  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [sortBy, currentFolderId, mounted])

  const loadData = async () => {
    try {
      // Determine folder sorting based on current sortBy
      const folderSortBy = sortBy === "name" ? "name" : "createdAt"
      
      const [allFolders, displayBooks, allBooksData] = await Promise.all([
        getAllFolders(folderSortBy),
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

  // Sync currentFolderId with URL query param `folder`
  useEffect(() => {
    const folderSlug = searchParams.get("folder")
    if (folderSlug) {
      // find folder by slug and set id
      ;(async () => {
        const f = await (await import("@/lib/db/folders")).getFolderBySlug(folderSlug)
        if (f) {
          setCurrentFolderId(f.id)
        } else {
          // Invalid folder slug, redirect to library root
          router.replace("/library")
        }
      })()
    } else {
      setCurrentFolderId(null)
    }
  }, [searchParams])

  const handleDeleteBook = async (bookId: string) => {
    setIsLoading(true)
    
    try {
      await deleteBook(bookId)
      await deleteChaptersByBook(bookId)
      await loadData()
      
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
      await loadData()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async (name: string) => {
    const isEditing = !!editingFolder
    const folderId = editingFolder?.id

    setCreateFolderOpen(false)
    setEditingFolder(null)

    try {
      if (isEditing && folderId) {
        await updateFolder(folderId, { name })
        // reload folders to get updated slug
        await loadData()
        toast({
          title: "Folder renamed",
          description: `Folder renamed to "${name}"`,
        })
        // if we're viewing this folder, update URL to use new slug
        if (currentFolderId === folderId) {
          const updated = (await import("@/lib/db/folders")).getFolder(folderId)
          const f = await updated
          if (f?.slug) router.push(`/library?folder=${encodeURIComponent(f.slug)}`, { scroll: false })
        }
      } else {
        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name,
          createdAt: Date.now(),
          sortOrder: folders.length,
        }
        await saveFolder(newFolder)
        // reload to include slug
        await loadData()
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

        setIsLoading(true)
        
        for (const book of booksInFolder) {
          await updateBook(book.id, { folderId: undefined })
        }
      } else {
        setIsLoading(true)
      }

      await deleteFolderDb(folderId)
      
      if (currentFolderId === folderId) {
        setCurrentFolderId(null)
      }

      await loadData()

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
      await loadData()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setEditingFolder({ id: folderId, name: currentName })
    // blur active element and delay opening to avoid popover focus/aria-hidden conflicts
    if (typeof window !== "undefined") {
      try { document.activeElement instanceof HTMLElement && document.activeElement.blur() } catch {}
    }
    setTimeout(() => setCreateFolderOpen(true), 80)
  }

  const handleOpenFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    setCurrentFolderId(folderId)
    if (folder?.slug) {
      router.push(`/library?folder=${encodeURIComponent(folder.slug)}`, { scroll: false })
    } else {
      router.push(`/library`, { scroll: false })
    }
  }

  const handleBackToRoot = () => {
    setCurrentFolderId(null)
    router.push(`/library`, { scroll: false })
  }

  const handleMoveBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId) || allBooks.find((b) => b.id === bookId)
    if (book) {
      setMovingBook(book)
      setMoveBookOpen(true)
      return
    }

    // If not found in memory, try to fetch from DB (covers just-uploaded-but-not-yet-in-state race)
    ;(async () => {
      try {
        const bookFromDb = await getBook(bookId)
        if (bookFromDb) {
          setMovingBook(bookFromDb)
          setMoveBookOpen(true)
        } else {
          console.warn("Book not found for move:", bookId)
          toast({
            title: "Book not found",
            description: "Please refresh the page and try again",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching book for move:", err)
        toast({
          title: "Error",
          description: "Failed to load book",
          variant: "destructive",
        })
      }
    })()
  }

  const handleMoveBookSubmit = async (folderId: string | null) => {
    if (!movingBook) return

    const bookTitle = movingBook.title
    const bookId = movingBook.id

    // Close dialog first and allow UI to settle before heavy async work
    if (typeof window !== "undefined") {
      try {
        const active = document.activeElement as HTMLElement | null
        if (active && typeof active.blur === "function") active.blur()
      } catch (e) {
        console.warn("blur failed", e)
      }
    }
    setMoveBookOpen(false)
    setMovingBook(null)

    try {
      // wait a bit to let the dialog overlay/animation finish so it doesn't block clicks
      await new Promise((res) => setTimeout(res, 300))
      setIsLoading(true)

      const oldFolderId = movingBook.folderId || null

      await updateBook(bookId, { folderId: folderId || undefined })

      // Optimistically update local state to avoid heavy reload blocking the UI
      setAllBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, folderId: folderId || undefined } : b))
      )

      if (currentFolderId === null) {
        // we're viewing root (no folder)
        if (folderId) {
          // moved from root into a folder -> remove from displayed books
          setBooks((prev) => prev.filter((b) => b.id !== bookId))
        } else {
          // root->root or update metadata
          setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, folderId: undefined } : b)))
        }
      } else {
        // viewing a specific folder
        if (folderId === currentFolderId) {
          // moved into current folder -> add/update
          setBooks((prev) => {
            const exists = prev.some((b) => b.id === bookId)
            if (exists) return prev.map((b) => (b.id === bookId ? { ...b, folderId: folderId || undefined } : b))
            const book = allBooks.find((b) => b.id === bookId)
            return book ? [ ...prev, { ...book, folderId: folderId || undefined } ] : prev
          })
        } else {
          // moved out of current folder -> remove
          setBooks((prev) => prev.filter((b) => b.id !== bookId))
        }
      }

      // reload in background to ensure consistency, but don't await to keep UI responsive
      loadData().catch((e) => console.error("Background reload failed:", e))

      toast({
        title: "Book moved",
        description: `"${bookTitle}" has been moved`,
      })
    } catch (error) {
      console.error("Error moving book:", error)
      toast({
        title: "Move failed",
        description: "Failed to move book",
        variant: "destructive",
      })
      // attempt to reload to recover
      try { await loadData() } catch (_) {}
    } finally {
      setIsLoading(false)
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
          onHomeClick={() => router.push("/")}
          onCreateFolder={() => {
            setEditingFolder(null)
            setCreateFolderOpen(true)
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
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
            <UploadButton onUploadComplete={loadData} currentFolderId={currentFolderId} />
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
          <UploadButton onUploadComplete={loadData} className="h-14 w-14 rounded-full shadow-lg p-0" currentFolderId={currentFolderId}>
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
