"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { parseEPUB } from "@/lib/epub/epubParser"
import { saveBook } from "@/lib/db/books"
import { saveChapters } from "@/lib/db/chapters"
import { useToast } from "@/hooks/use-toast"

export function UploadButton({ onUploadComplete, className, children, currentFolderId }: { onUploadComplete?: () => void; className?: string; children?: React.ReactNode; currentFolderId?: string | null }) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const uploadId = `epub-upload-${Math.random().toString(36).substr(2, 9)}`

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("Starting EPUB upload:", file.name, "Size:", file.size)

    // Validate type
    if (!file.name.endsWith(".epub")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an EPUB file",
        variant: "destructive",
      })
      return
    }

    // Validate size
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      console.log("Parsing EPUB...")
      const { book, chapters, tocChapters } = await parseEPUB(file, currentFolderId)
      console.log("EPUB parsed successfully:", book.title, "Chapters:", chapters.length)

      // Save to IndexedDB
      console.log("Saving book to IndexedDB...")
      await saveBook(book)
      console.log("Book saved, now saving chapters...")
      await saveChapters(chapters)
      console.log("All data saved successfully")
      
      // Save TOC chapters
      if (tocChapters && tocChapters.length > 0) {
        localStorage.setItem(`toc-chapters-${book.id}`, JSON.stringify(tocChapters))
        console.log("TOC chapters saved to localStorage:", tocChapters.length)
      }

      toast({
        title: "Book added successfully",
        description: `${book.title} by ${book.author}`,
      })

      onUploadComplete?.()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse EPUB file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".epub"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id={uploadId}
      />
      <label htmlFor={uploadId}>
        <Button disabled={isUploading} asChild className={className}>
          <span className="cursor-pointer">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {children ? null : <span className="ml-2">Uploading...</span>}
              </>
            ) : (
              <>
                {children || (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload EPUB
                  </>
                )}
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  )
}
