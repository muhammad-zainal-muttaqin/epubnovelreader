// Folder repository

import { STORES } from "../keys"
import type { Folder } from "../types"
import { getAllFromStore, getFromStore, putInStore, deleteFromStore, getStore } from "./idb"

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

async function ensureUniqueSlug(name: string, existingId?: string) {
  const base = generateSlug(name)
  let slug = base
  const store = await getStore(STORES.FOLDERS, "readonly")
  let i = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const index = store.index("slug")
      const request = index.get(slug)
      // wrap in promise to await
      const existing: any = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(undefined)
      })

      if (!existing || (existingId && existing.id === existingId)) {
        return slug
      }
    } catch (e) {
      // if index doesn't exist, just return base
      return slug
    }

    i += 1
    slug = `${base}-${i}`
  }
}

export async function getAllFolders(sortBy: "name" | "createdAt" = "name"): Promise<Folder[]> {
  const folders = await getAllFromStore<Folder>(STORES.FOLDERS)
  
  switch (sortBy) {
    case "name":
      return folders.sort((a, b) => a.name.localeCompare(b.name))
    case "createdAt":
      return folders.sort((a, b) => b.createdAt - a.createdAt)
    default:
      return folders.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

export async function getFolder(folderId: string): Promise<Folder | undefined> {
  return getFromStore<Folder>(STORES.FOLDERS, folderId)
}

export async function getFolderBySlug(slug: string): Promise<Folder | undefined> {
  const store = await getStore(STORES.FOLDERS, "readonly")
  return new Promise((resolve, reject) => {
    try {
      const index = store.index("slug")
      const request = index.get(slug)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    } catch (e) {
      reject(e)
    }
  })
}

export async function saveFolder(folder: Folder): Promise<void> {
  // ensure slug and uniqueness
  folder.slug = await ensureUniqueSlug(folder.name, folder.id)
  await putInStore(STORES.FOLDERS, folder)
}

export async function updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
  const folder = await getFolder(folderId)
  if (!folder) throw new Error("Folder not found")

  const updatedFolder = { ...folder, ...updates }
  await saveFolder(updatedFolder)
}

export async function deleteFolder(folderId: string): Promise<void> {
  await deleteFromStore(STORES.FOLDERS, folderId)
}

