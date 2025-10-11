import JSZip from "jszip"
import type { Book, Chapter } from "@/lib/types"
import { sanitizeHtml } from "./sanitizeHtml"

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Normalize path: remove leading ./ and multiple slashes
function normalizePath(path: string): string {
  return path.replace(/^\.\//, "").replace(/\/+/g, "/")
}

// Resolve relative path
function resolvePath(basePath: string, relativePath: string): string {
  const base = basePath.split("/").slice(0, -1)
  const relative = relativePath.split("/")

  for (const part of relative) {
    if (part === "..") {
      base.pop()
    } else if (part !== "." && part !== "") {
      base.push(part)
    }
  }

  return base.join("/")
}

// Extract all images from EPUB
async function extractImages(zip: JSZip, opfContent: string, basePath: string): Promise<Map<string, string>> {
  console.log("[v0] === Starting image extraction ===")
  const imageMap = new Map<string, string>()

  // Find all image items in manifest using regex
  const manifestRegex = /<item[^>]*media-type="image\/[^"]*"[^>]*>/g
  const matches = opfContent.match(manifestRegex) || []

  console.log("[v0] Found", matches.length, "image items in manifest")

  for (const match of matches) {
    const hrefMatch = match.match(/href="([^"]*)"/)
    if (!hrefMatch) continue

    const href = hrefMatch[1]
    const fullPath = resolvePath(basePath, href)
    const normalizedPath = normalizePath(fullPath)

    console.log("[v0] Processing image:", href, "->", normalizedPath)

    try {
      const imageFile = zip.file(normalizedPath)
      if (!imageFile) {
        console.log("[v0] ✗ Image file not found:", normalizedPath)
        continue
      }

      const imageData = await imageFile.async("arraybuffer")
      const base64 = arrayBufferToBase64(imageData)

      // Determine MIME type
      const ext = normalizedPath.split(".").pop()?.toLowerCase()
      const mimeType =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
            ? "image/png"
            : ext === "gif"
              ? "image/gif"
              : ext === "svg"
                ? "image/svg+xml"
                : "image/jpeg"

      const dataUrl = `data:${mimeType};base64,${base64}`

      // Store with normalized path
      const storeKey = normalizePath(href)
      imageMap.set(storeKey, dataUrl)
      console.log("[v0] ✓ Image stored:", storeKey)
    } catch (error) {
      console.error("[v0] Error extracting image:", normalizedPath, error)
    }
  }

  console.log("[v0] === Image extraction complete:", imageMap.size, "images ===")
  return imageMap
}

// Replace image paths in HTML with base64 data URLs
function replaceImagePaths(html: string, imageMap: Map<string, string>, chapterHref: string): string {
  console.log("[v0] === Replacing image paths in chapter:", chapterHref, "===")

  const chapterDir = chapterHref.split("/").slice(0, -1).join("/")
  let replacedCount = 0

  const result = html.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, (match, src) => {
    console.log("[v0] Found img tag with src:", src)

    // Try to resolve the path
    let resolvedPath = src

    if (src.startsWith("../") || src.startsWith("./") || !src.startsWith("http")) {
      // Relative path - resolve it
      resolvedPath = resolvePath(chapterDir + "/", src)
      resolvedPath = normalizePath(resolvedPath)
      console.log("[v0] Resolved relative path:", src, "->", resolvedPath)
    }

    // Try to find in imageMap
    let dataUrl = imageMap.get(resolvedPath)

    // Fallback: try without directory prefix
    if (!dataUrl) {
      const filename = resolvedPath.split("/").pop() || ""
      for (const [key, value] of imageMap.entries()) {
        if (key.endsWith(filename)) {
          dataUrl = value
          console.log("[v0] ✓ Found by filename:", filename, "->", key)
          break
        }
      }
    }

    if (dataUrl) {
      replacedCount++
      console.log("[v0] ✓✓✓ IMAGE REPLACED:", src, "->", "data:image/...")
      return match.replace(src, dataUrl)
    } else {
      console.log("[v0] ✗ Image NOT found in map:", resolvedPath)
      return match
    }
  })

  console.log("[v0] === Image replacement complete:", replacedCount, "images replaced ===")
  return result
}

export async function parseEPUB(file: File): Promise<{ book: Book; chapters: Chapter[] }> {
  console.log("[v0] === Starting EPUB parsing ===")

  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  // Find container.xml
  const containerFile = zip.file("META-INF/container.xml")
  if (!containerFile) {
    throw new Error("Invalid EPUB: container.xml not found")
  }

  const containerContent = await containerFile.async("text")
  const opfPathMatch = containerContent.match(/full-path="([^"]+)"/)
  if (!opfPathMatch) {
    throw new Error("Invalid EPUB: OPF path not found")
  }

  const opfPath = opfPathMatch[1]
  const basePath = opfPath.substring(0, opfPath.lastIndexOf("/") + 1)
  console.log("[v0] OPF path:", opfPath, "Base path:", basePath)

  // Read OPF file
  const opfFile = zip.file(opfPath)
  if (!opfFile) {
    throw new Error("Invalid EPUB: OPF file not found")
  }

  const opfContent = await opfFile.async("text")
  const parser = new DOMParser()
  const opfDoc = parser.parseFromString(opfContent, "text/xml")

  // Extract metadata
  const metadata = opfDoc.querySelector("metadata")
  const title = metadata?.querySelector("title")?.textContent || file.name.replace(".epub", "")
  const author = metadata?.querySelector("creator")?.textContent || "Unknown Author"

  console.log("[v0] Book metadata:", { title, author })

  // Extract images FIRST
  const imageMap = await extractImages(zip, opfContent, basePath)

  // Extract cover
  let cover: string | undefined

  // Strategy 1: Look for cover in metadata
  const coverMeta = opfDoc.querySelector('meta[name="cover"]')
  if (coverMeta) {
    const coverId = coverMeta.getAttribute("content")
    if (coverId) {
      const coverItem = opfDoc.querySelector(`item[id="${coverId}"]`)
      if (coverItem) {
        const coverHref = coverItem.getAttribute("href")
        if (coverHref) {
          const coverPath = normalizePath(resolvePath(basePath, coverHref))
          cover = imageMap.get(normalizePath(coverHref)) || imageMap.get(coverPath)
          console.log("[v0] Cover found (strategy 1):", coverHref, "->", !!cover)
        }
      }
    }
  }

  // Strategy 2: Look for cover.jpg/cover.png in images
  if (!cover) {
    for (const [key, value] of imageMap.entries()) {
      if (key.toLowerCase().includes("cover")) {
        cover = value
        console.log("[v0] Cover found (strategy 2):", key)
        break
      }
    }
  }

  // Strategy 3: Use first image
  if (!cover && imageMap.size > 0) {
    cover = Array.from(imageMap.values())[0]
    console.log("[v0] Cover found (strategy 3): using first image")
  }

  console.log("[v0] Cover extracted:", !!cover)

  // Extract spine and chapters
  const spine = opfDoc.querySelector("spine")
  const spineItems = Array.from(spine?.querySelectorAll("itemref") || [])

  console.log("[v0] Spine items found:", spineItems.length)

  const chapters: Chapter[] = []
  const bookId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

  for (let i = 0; i < spineItems.length; i++) {
    const itemref = spineItems[i]
    const idref = itemref.getAttribute("idref")
    if (!idref) continue

    const item = opfDoc.querySelector(`item[id="${idref}"]`)
    if (!item) continue

    const href = item.getAttribute("href")
    if (!href) continue

    const fullPath = resolvePath(basePath, href)
    console.log("[v0] Processing chapter", i, ":", href, "->", fullPath)

    try {
      const chapterFile = zip.file(fullPath)
      if (!chapterFile) {
        console.log("[v0] Chapter file not found:", fullPath)
        continue
      }

      let chapterContent = await chapterFile.async("text")

      // Replace image paths with base64 data URLs
      chapterContent = replaceImagePaths(chapterContent, imageMap, href)

      // Sanitize HTML
      const sanitized = sanitizeHtml(chapterContent)

      // Extract title from content
      const chapterDoc = parser.parseFromString(chapterContent, "text/html")
      const chapterTitle =
        chapterDoc.querySelector("h1, h2, h3")?.textContent ||
        chapterDoc.querySelector("title")?.textContent ||
        `Chapter ${i + 1}`

      chapters.push({
        id: `${bookId}-chapter-${i}`,
        bookId,
        index: i,
        title: chapterTitle.trim(),
        content: sanitized,
      })

      console.log("[v0] Chapter", i, "processed:", chapterTitle)
    } catch (error) {
      console.error("[v0] Error processing chapter", i, ":", error)
    }
  }

  console.log("[v0] === EPUB parsing complete ===")
  console.log("[v0] Total chapters:", chapters.length)
  console.log("[v0] Total images:", imageMap.size)

  const book: Book = {
    id: bookId,
    title,
    author,
    cover,
    totalChapters: chapters.length,
    currentChapter: 0,
    addedAt: Date.now(),
  }

  return { book, chapters }
}
