"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
import { RenameBookDialog } from "@/components/library/rename-book-dialog"
import { LibraryHeader } from "@/components/library/library-header"
import { Loader2, BookOpen, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type LibraryFilter = "all" | "in-progress" | "finished" | "unread"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortByLoaded, setSortByLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFolderLoading, setIsFolderLoading] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)
  const [moveBookOpen, setMoveBookOpen] = useState(false)
  const [movingBook, setMovingBook] = useState<Book | null>(null)
  const [renameBookOpen, setRenameBookOpen] = useState(false)
  const [renamingBook, setRenamingBook] = useState<Book | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    setMounted(true)
    
    const saved = localStorage.getItem("library-sort-by")
    if (saved && ["name", "addedAt", "lastReadAt", "progress"].includes(saved)) {
      setSortBy(saved as SortBy)
    }
    setSortByLoaded(true)
  }, [])

  useEffect(() => {
    if (sortByLoaded) {
      localStorage.setItem("library-sort-by", sortBy)
    }
  }, [sortBy, sortByLoaded])

  const loadData = useCallback(async () => {
    if (loadPromiseRef.current) {
      return loadPromiseRef.current
    }

    const promise = (async () => {
      try {
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
        loadPromiseRef.current = null
      }
    })()

    loadPromiseRef.current = promise
    return promise
  }, [sortBy, currentFolderId, toast])

  const scheduleLoadData = useCallback(() => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
    loadTimeoutRef.current = setTimeout(() => {
      loadData()
    }, 120)
  }, [loadData])

  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      scheduleLoadData()
    }
  }, [sortBy, currentFolderId, mounted, scheduleLoadData])

  useEffect(() => {
    const folderSlug = searchParams.get("folder")
    if (folderSlug) {
      ;(async () => {
        setIsFolderLoading(true)
        try {
          const f = await (await import("@/lib/db/folders")).getFolderBySlug(folderSlug)
          if (f) {
            setCurrentFolderId(f.id)
          } else {
            router.replace("/library")
          }
        } finally {
          setIsFolderLoading(false)
        }
      })()
    } else {
      setCurrentFolderId(null)
      setIsFolderLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    setSearchTerm("")
    setFilter("all")
  }, [currentFolderId])

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
        await loadData()
        toast({
          title: "Folder renamed",
          description: `Folder renamed to "${name}"`,
        })
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
    if (typeof window !== "undefined") {
      try { document.activeElement instanceof HTMLElement && document.activeElement.blur() } catch {}
    }
    setTimeout(() => setCreateFolderOpen(true), 80)
  }

  const handleOpenFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    setIsFolderLoading(true)
    setCurrentFolderId(folderId)
    if (folder?.slug) {
      router.push(`/library?folder=${encodeURIComponent(folder.slug)}`, { scroll: false })
    } else {
      router.push(`/library`, { scroll: false })
    }
  }

  const handleBackToRoot = () => {
    setIsFolderLoading(true)
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
      await new Promise((res) => setTimeout(res, 300))
      setIsLoading(true)

      const oldFolderId = movingBook.folderId || null

      await updateBook(bookId, { folderId: folderId || undefined })

      setAllBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, folderId: folderId || undefined } : b))
      )

      if (currentFolderId === null) {
        if (folderId) {
          setBooks((prev) => prev.filter((b) => b.id !== bookId))
        } else {
          setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, folderId: undefined } : b)))
        }
      } else {
        if (folderId === currentFolderId) {
          setBooks((prev) => {
            const exists = prev.some((b) => b.id === bookId)
            if (exists) return prev.map((b) => (b.id === bookId ? { ...b, folderId: folderId || undefined } : b))
            const book = allBooks.find((b) => b.id === bookId)
            return book ? [ ...prev, { ...book, folderId: folderId || undefined } ] : prev
          })
        } else {
          setBooks((prev) => prev.filter((b) => b.id !== bookId))
        }
      }

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
      try { await loadData() } catch (_) {}
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenameBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId) || allBooks.find((b) => b.id === bookId)
    if (book) {
      setRenamingBook(book)
      setRenameBookOpen(true)
    }
  }

  const handleRenameBookSubmit = async (title: string, author: string) => {
    if (!renamingBook) return

    const bookId = renamingBook.id
    
    if (typeof window !== "undefined") {
      try { document.activeElement instanceof HTMLElement && document.activeElement.blur() } catch {}
    }
    setRenameBookOpen(false)
    setRenamingBook(null)

    try {
      await new Promise((res) => setTimeout(res, 300))
      setIsLoading(true)

      await updateBook(bookId, { title, author })
      
      // Update local state
      setAllBooks((prev) => 
        prev.map((b) => (b.id === bookId ? { ...b, title, author } : b))
      )
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, title, author } : b))
      )

      await loadData()
      
      toast({
        title: "Book updated",
        description: "Book details have been saved",
      })
    } catch (error) {
      console.error("Error renaming book:", error)
      toast({
        title: "Update failed",
        description: "Failed to update book details",
        variant: "destructive",
      })
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

  const libraryStats = {
    totalBooks: allBooks.length,
    inProgress: allBooks.filter((b) => b.progress > 0 && b.progress < 99.5).length,
    finished: allBooks.filter((b) => b.progress >= 99.5).length,
    folders: folders.length,
  }

  const lastOpenedBook =
    [...allBooks]
      .filter((b) => typeof b.lastReadAt === "number")
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))[0] || null

  const resumeBook = lastOpenedBook || displayedBooks[0] || null

  const matchesFilter = (book: Book) => {
    switch (filter) {
      case "in-progress":
        return book.progress > 0 && book.progress < 99.5
      case "finished":
        return book.progress >= 99.5
      case "unread":
        return !book.progress || book.progress < 1
      case "all":
      default:
        return true
    }
  }

  const searchLower = searchTerm.trim().toLowerCase()
  const filteredFolders = displayedFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchLower),
  )
  const filteredBooks = displayedBooks.filter(
    (book) =>
      matchesFilter(book) &&
      (book.title.toLowerCase().includes(searchLower) ||
        (book.author || "").toLowerCase().includes(searchLower)),
  )

  const visibleItemCount = filteredFolders.length + filteredBooks.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-y-auto overflow-x-hidden scrollbar-hide dark:from-[#070b12] dark:via-[#0a0f18] dark:to-[#0d111b]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/15" />
      </div>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200/70 px-3 py-3 sm:px-4 dark:bg-[#0a0f18]/80 dark:border-white/10">
        <LibraryHeader
          currentFolderName={currentFolder?.name}
          bookCount={visibleItemCount}
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

      <div className="container mx-auto w-full max-w-4xl px-3 pb-16 pt-4 sm:max-w-5xl sm:px-4">
        {isLoading || isFolderLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-slate-200/70 bg-white/90 shadow-sm dark:border-primary/20 dark:bg-card/80">
                <CardContent className="p-4 space-y-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Continue</p>
                      <p className="text-sm font-semibold">Quick resume</p>
                    </div>
                    <Badge variant="secondary" className="border-primary/30 bg-primary/10 text-primary">
                      {currentFolder ? "This folder" : "Library"}
                    </Badge>
                  </div>
                  {resumeBook ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                      <div className="relative h-20 w-16 overflow-hidden rounded-md bg-muted sm:h-16 sm:w-12">
                        {resumeBook.cover ? (
                          <img src={resumeBook.cover} alt={resumeBook.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="line-clamp-2 font-semibold leading-snug">{resumeBook.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{resumeBook.author || "Unknown author"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {resumeBook.progress > 0 ? `${Math.round(resumeBook.progress)}% read` : "Not started yet"}
                        </p>
                      </div>
                      <div className="flex w-full justify-start sm:w-auto sm:justify-end">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/reader/${resumeBook.id}/${resumeBook.currentChapter || 0}`)}
                          className="w-full sm:w-auto"
                        >
                          <BookOpen className="mr-1.5 h-4 w-4" />
                          {resumeBook.progress > 0 ? "Continue" : "Start"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-muted/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                      Upload your first EPUB to see it here.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 shadow-sm dark:bg-card/80 dark:border-white/10 border border-slate-200/70">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Library at a glance</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{libraryStats.totalBooks}</p>
                      <p className="text-xs text-muted-foreground">Books</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{libraryStats.folders}</p>
                      <p className="text-xs text-muted-foreground">Folders</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{libraryStats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{libraryStats.finished}</p>
                      <p className="text-xs text-muted-foreground">Finished</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 shadow-sm dark:bg-card/80 dark:border-white/10 border border-slate-200/70">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Context</p>
                  <div className="flex flex-col gap-3 rounded-xl border border-muted/60 bg-muted/30 p-3 sm:flex-row sm:items-start">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {currentFolder ? currentFolder.name : "All folders"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentFolder
                          ? "Browsing a specific folder. Move books to keep this space tidy."
                          : "You can create folders to group arcs, genres, or series."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
                    <Upload className="h-4 w-4" />
                    <span>Drag & drop EPUBs or use the upload button to keep everything local.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-3xl border bg-white/90 p-4 shadow-sm dark:bg-card/70 dark:border-white/10 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {[
                    { key: "all", label: "All" },
                    { key: "in-progress", label: "In progress" },
                    { key: "finished", label: "Finished" },
                    { key: "unread", label: "Unread" },
                  ].map((option) => (
                    <Button
                      key={option.key}
                      size="sm"
                      variant={filter === option.key ? "default" : "outline"}
                      onClick={() => setFilter(option.key as LibraryFilter)}
                      className="rounded-full px-4"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                  <Input
                    placeholder="Search by title or author"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full min-w-[200px]"
                  />
                  <UploadButton
                    onUploadComplete={loadData}
                    className="h-10 w-full justify-center sm:w-auto"
                    currentFolderId={currentFolderId}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Add EPUB
                    </div>
                  </UploadButton>
                </div>
              </div>

              {visibleItemCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted/40 p-6">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {searchTerm
                      ? `No matches for "${searchTerm}"`
                      : currentFolderId
                        ? "No books in this folder"
                        : "No books yet"}
                  </h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {searchTerm
                      ? "Try another title, author, or clear the filter."
                      : "Upload an EPUB to start reading or move books into this folder."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <UploadButton onUploadComplete={loadData} currentFolderId={currentFolderId} />
                    {(searchTerm || filter !== "all") && (
                      <Button variant="ghost" onClick={() => { setSearchTerm(""); setFilter("all") }}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 pt-2 sm:grid-cols-1 md:grid-cols-2">
                  {filteredFolders.map((folder) => (
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
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onMove={handleMoveBook}
                      onRename={handleRenameBook}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isLoading && !isFolderLoading && (books.length > 0 || folders.length > 0) && (
        <div className="fixed bottom-8 right-6 z-50 pb-[env(safe-area-inset-bottom)]">
          <UploadButton onUploadComplete={loadData} className="h-14 w-14 rounded-full p-0 shadow-lg" currentFolderId={currentFolderId}>
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

      <RenameBookDialog
        open={renameBookOpen}
        onOpenChange={setRenameBookOpen}
        onSubmit={handleRenameBookSubmit}
        initialTitle={renamingBook?.title || ""}
        initialAuthor={renamingBook?.author || ""}
      />
    </div>
  )
}
