"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Folder } from "@/lib/types"
import { Folder as FolderIcon } from "lucide-react"

interface MoveBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMove: (folderId: string | null) => void
  folders: Folder[]
  currentFolderId?: string | null
  bookTitle: string
}

export function MoveBookDialog({ 
  open, 
  onOpenChange, 
  onMove, 
  folders,
  currentFolderId,
  bookTitle 
}: MoveBookDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null)

  useEffect(() => {
    if (open) {
      setSelectedFolderId(currentFolderId || null)
    }
  }, [open, currentFolderId])

  const handleSubmit = () => {
    onMove(selectedFolderId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Book</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Move "{bookTitle}" to:
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <RadioGroup value={selectedFolderId || "none"} onValueChange={(value) => setSelectedFolderId(value === "none" ? null : value)}>
            <div className="space-y-3 py-4">
              <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="flex-1 cursor-pointer font-normal">
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    <span>No Folder (Root)</span>
                  </div>
                </Label>
              </div>

              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={folder.id} id={folder.id} />
                  <Label htmlFor={folder.id} className="flex-1 cursor-pointer font-normal">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-primary" />
                      <span>{folder.name}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

