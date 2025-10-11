// Book repository for CRUD operations

import { STORES } from "../keys"
import type { Book } from "../types"
import { getAllFromStore, getFromStore, putInStore, deleteFromStore } from "./idb"

export async function getAllBooks(): Promise<Book[]> {
  const books = await getAllFromStore<Book>(STORES.BOOKS)
  return books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
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
