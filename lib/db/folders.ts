// Folder repository

import { STORES } from "../keys"
import type { Folder } from "../types"
import { getAllFromStore, getFromStore, putInStore, deleteFromStore } from "./idb"

export async function getAllFolders(): Promise<Folder[]> {
  const folders = await getAllFromStore<Folder>(STORES.FOLDERS)
  return folders.sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getFolder(folderId: string): Promise<Folder | undefined> {
  return getFromStore<Folder>(STORES.FOLDERS, folderId)
}

export async function saveFolder(folder: Folder): Promise<void> {
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

