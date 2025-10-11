// Chapter repository for CRUD operations

import { STORES } from "../keys"
import type { Chapter } from "../types"
import { getFromStore, putInStore, deleteFromStore, getByIndex } from "./idb"

export async function getChaptersByBook(bookId: string): Promise<Chapter[]> {
  const chapters = await getByIndex<Chapter>(STORES.CHAPTERS, "bookId", bookId)
  return chapters.sort((a, b) => a.index - b.index)
}

export async function getChapter(chapterId: string): Promise<Chapter | undefined> {
  return getFromStore<Chapter>(STORES.CHAPTERS, chapterId)
}

export async function getChapterByIndex(bookId: string, index: number): Promise<Chapter | undefined> {
  const chapters = await getByIndex<Chapter>(STORES.CHAPTERS, "bookId_index", [bookId, index] as any)
  return chapters[0]
}

export async function saveChapter(chapter: Chapter): Promise<void> {
  await putInStore(STORES.CHAPTERS, chapter)
}

export async function saveChapters(chapters: Chapter[]): Promise<void> {
  for (const chapter of chapters) {
    await saveChapter(chapter)
  }
}

export async function deleteChaptersByBook(bookId: string): Promise<void> {
  const chapters = await getChaptersByBook(bookId)
  for (const chapter of chapters) {
    await deleteFromStore(STORES.CHAPTERS, chapter.id)
  }
}
