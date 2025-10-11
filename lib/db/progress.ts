// Progress repository for tracking reading progress

import { STORES } from "../keys"
import type { Progress } from "../types"
import { getFromStore, putInStore } from "./idb"

export async function getProgress(bookId: string): Promise<Progress | undefined> {
  return getFromStore<Progress>(STORES.PROGRESS, bookId)
}

export async function saveProgress(progress: Progress): Promise<void> {
  await putInStore(STORES.PROGRESS, progress)
}

export async function updateProgress(bookId: string, updates: Partial<Progress>): Promise<void> {
  const existing = await getProgress(bookId)
  const progress: Progress = {
    bookId,
    chapterId: existing?.chapterId || "",
    chapterIndex: existing?.chapterIndex || 0,
    scrollPosition: existing?.scrollPosition || 0,
    percentage: existing?.percentage || 0,
    lastReadAt: Date.now(),
    ...updates,
  }
  await saveProgress(progress)
}
