// Core types for Novel Reader application

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
}

export interface Chapter {
  id: string
  bookId: string
  index: number
  title: string
  content: string // sanitized HTML
  href: string // original href from spine
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
  fontFamily: "sans" | "serif" | "mono" | "merriweather" | "open-sans" | "literata" | "garamond"
  lineHeight: number // 1.4-2.0
  maxWidth: number // 600-800px
}
