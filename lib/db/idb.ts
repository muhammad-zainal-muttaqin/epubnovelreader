// IndexedDB wrapper

import { DB_NAME, DB_VERSION, STORES } from "../keys"

let dbInstance: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion

      // Books store
      if (!db.objectStoreNames.contains(STORES.BOOKS)) {
        const bookStore = db.createObjectStore(STORES.BOOKS, { keyPath: "id" })
        bookStore.createIndex("addedAt", "addedAt", { unique: false })
        bookStore.createIndex("lastReadAt", "lastReadAt", { unique: false })
        bookStore.createIndex("folderId", "folderId", { unique: false })
      } else if (oldVersion < 2) {
        // Migration: add folderId index
        const transaction = (event.target as IDBOpenDBRequest).transaction
        if (transaction) {
          const bookStore = transaction.objectStore(STORES.BOOKS)
          if (!bookStore.indexNames.contains("folderId")) {
            bookStore.createIndex("folderId", "folderId", { unique: false })
          }
        }
      }

      // Chapters store
      if (!db.objectStoreNames.contains(STORES.CHAPTERS)) {
        const chapterStore = db.createObjectStore(STORES.CHAPTERS, {
          keyPath: "id",
        })
        chapterStore.createIndex("bookId", "bookId", { unique: false })
        chapterStore.createIndex("bookId_index", ["bookId", "index"], {
          unique: true,
        })
      }

      // Progress store
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.PROGRESS, {
          keyPath: "bookId",
        })
        progressStore.createIndex("lastReadAt", "lastReadAt", { unique: false })
      }

      // Folders store
      if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
        const folderStore = db.createObjectStore(STORES.FOLDERS, { keyPath: "id" })
        folderStore.createIndex("createdAt", "createdAt", { unique: false })
        folderStore.createIndex("sortOrder", "sortOrder", { unique: false })
        folderStore.createIndex("slug", "slug", { unique: true })
      } else if (oldVersion < 3) {
        // migration: add slug index
        const transaction = (event.target as IDBOpenDBRequest).transaction
        if (transaction) {
          const folderStore = transaction.objectStore(STORES.FOLDERS)
          if (!folderStore.indexNames.contains("slug")) {
            folderStore.createIndex("slug", "slug", { unique: true })
          }
        }
      }
    }
  })
}

export async function getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
  const db = await initDB()
  const transaction = db.transaction(storeName, mode)
  return transaction.objectStore(storeName)
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const store = await getStore(storeName, "readonly")
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getFromStore<T>(storeName: string, key: string): Promise<T | undefined> {
  const store = await getStore(storeName, "readonly")
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function putInStore<T>(storeName: string, value: T): Promise<void> {
  const store = await getStore(storeName, "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.put(value)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const store = await getStore(storeName, "readwrite")
  return new Promise((resolve, reject) => {
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getByIndex<T>(storeName: string, indexName: string, key: string | string[]): Promise<T[]> {
  const store = await getStore(storeName, "readonly")
  const index = store.index(indexName)
  return new Promise((resolve, reject) => {
    const request = index.getAll(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
