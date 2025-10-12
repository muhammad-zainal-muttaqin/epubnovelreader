// Storage keys

export const STORAGE_VERSION = "1.0.0"

export const STORAGE_KEYS = {
  READER_SETTINGS: "novel-reader-settings",
  CURRENT_BOOK: "novel-reader-current-book",
  CURRENT_CHAPTER: "novel-reader-current-chapter",
} as const

export const DB_NAME = "NovelReaderDB"
export const DB_VERSION = 3

export const STORES = {
  BOOKS: "books",
  CHAPTERS: "chapters",
  PROGRESS: "progress",
  FOLDERS: "folders",
} as const

export const DEFAULT_SETTINGS: import("./types").ReaderSettings = {
  fontSize: 18,
  theme: "dark",
  fontFamily: "garamond",
  lineHeight: 1.7,
  maxWidth: 700,
  textAlign: "justify",
}
