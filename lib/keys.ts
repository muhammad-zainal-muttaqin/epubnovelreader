// Storage keys and versioning for localStorage and IndexedDB

export const STORAGE_VERSION = "1.0.0"

export const STORAGE_KEYS = {
  READER_SETTINGS: "novel-reader-settings",
  CURRENT_BOOK: "novel-reader-current-book",
  CURRENT_CHAPTER: "novel-reader-current-chapter",
} as const

export const DB_NAME = "NovelReaderDB"
export const DB_VERSION = 1

export const STORES = {
  BOOKS: "books",
  CHAPTERS: "chapters",
  PROGRESS: "progress",
} as const

export const DEFAULT_SETTINGS: import("./types").ReaderSettings = {
  fontSize: 18,
  theme: "light",
  fontFamily: "serif",
  lineHeight: 1.7,
  maxWidth: 700,
}
