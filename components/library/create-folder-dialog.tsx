"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  existingFolderNames: string[]
  editingFolder?: { id: string; name: string } | null
}

export function CreateFolderDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  existingFolderNames,
  editingFolder 
}: CreateFolderDialogProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setName(editingFolder?.name || "")
      setError("")
    }
  }, [open, editingFolder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      setError("Folder name cannot be empty")
      return
    }

    const isDuplicate = existingFolderNames.some(
      existingName => 
        existingName.toLowerCase() === trimmedName.toLowerCase() && 
        existingName !== editingFolder?.name
    )

    if (isDuplicate) {
      setError("A folder with this name already exists")
      return
    }

    onSubmit(trimmedName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Rename Folder" : "Create New Folder"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                placeholder="Enter folder name"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingFolder ? "Rename" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

