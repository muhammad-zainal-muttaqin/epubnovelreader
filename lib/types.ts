// Core types

export interface Book {
  id: string
  title: string
  author: string
  cover?: string // base64 or blob URL
  language?: string
  publisher?: string
  description?: string
  addedAt: number
  lastReadAt?: number
  totalChapters: number
  currentChapter?: number
  progress: number // 0-100
  folderId?: string // folder relation
}

export interface Folder {
  id: string
  name: string
  slug?: string
  createdAt: number
  sortOrder: number
}

export interface Chapter {
  id: string
  bookId: string
  index: number
  title: string
  content: string // sanitized HTML
  href: string // original href from spine
  tocChapterId?: string // ID of the TOC chapter this spine item belongs to
}

export interface TOCChapter {
  id: string
  title: string
  startIndex: number // first spine item index
  endIndex: number // last spine item index (inclusive)
  href: string // original TOC href
}

export interface ManifestItem {
  id: string
  href: string
  mediaType: string
  properties?: string
}

export interface SpineItem {
  idref: string
  linear?: string
}

export interface EPUBMetadata {
  title: string
  creator: string
  language?: string
  publisher?: string
  description?: string
  cover?: string
}

export interface Progress {
  bookId: string
  chapterId: string
  chapterIndex: number
  scrollPosition: number
  percentage: number
  lastReadAt: number
}

export interface ReaderSettings {
  fontSize: number // 14-24px
  theme: "light" | "dark"
  fontFamily: "sans" | "serif" | "mono" | "merriweather" | "open-sans" | "literata" | "garamond" | "opendyslexic"
  lineHeight: number // 1.4-2.0
  maxWidth: number // 600-800px
  textAlign: "left" | "center" | "right" | "justify"
}
