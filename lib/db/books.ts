// Book repository

import { STORES } from "../keys"
import type { Book } from "../types"
import { getAllFromStore, getFromStore, putInStore, deleteFromStore, getByIndex } from "./idb"

export type SortBy = "name" | "addedAt" | "lastReadAt" | "progress"

export async function getAllBooks(sortBy: SortBy = "lastReadAt"): Promise<Book[]> {
  const books = await getAllFromStore<Book>(STORES.BOOKS)
  
  switch (sortBy) {
    case "name":
      return books.sort((a, b) => a.title.localeCompare(b.title))
    case "addedAt":
      return books.sort((a, b) => b.addedAt - a.addedAt)
    case "progress":
      return books.sort((a, b) => b.progress - a.progress)
    case "lastReadAt":
    default:
      return books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
  }
}

export async function getBooksByFolder(folderId: string | null, sortBy: SortBy = "lastReadAt"): Promise<Book[]> {
  if (folderId === null) {
    return getBooksWithoutFolder(sortBy)
  }
  
  const books = await getByIndex<Book>(STORES.BOOKS, "folderId", folderId)
  
  switch (sortBy) {
    case "name":
      return books.sort((a, b) => a.title.localeCompare(b.title))
    case "addedAt":
      return books.sort((a, b) => b.addedAt - a.addedAt)
    case "progress":
      return books.sort((a, b) => b.progress - a.progress)
    case "lastReadAt":
    default:
      return books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
  }
}

export async function getBooksWithoutFolder(sortBy: SortBy = "lastReadAt"): Promise<Book[]> {
  const allBooks = await getAllFromStore<Book>(STORES.BOOKS)
  const books = allBooks.filter(book => !book.folderId)
  
  switch (sortBy) {
    case "name":
      return books.sort((a, b) => a.title.localeCompare(b.title))
    case "addedAt":
      return books.sort((a, b) => b.addedAt - a.addedAt)
    case "progress":
      return books.sort((a, b) => b.progress - a.progress)
    case "lastReadAt":
    default:
      return books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
  }
}

export async function getBook(bookId: string): Promise<Book | undefined> {
  return getFromStore<Book>(STORES.BOOKS, bookId)
}

export async function saveBook(book: Book): Promise<void> {
  await putInStore(STORES.BOOKS, book)
}

export async function updateBook(bookId: string, updates: Partial<Book>): Promise<void> {
  const book = await getBook(bookId)
  if (!book) throw new Error("Book not found")

  const updatedBook = { ...book, ...updates }
  await saveBook(updatedBook)
}

export async function deleteBook(bookId: string): Promise<void> {
  await deleteFromStore(STORES.BOOKS, bookId)
}
