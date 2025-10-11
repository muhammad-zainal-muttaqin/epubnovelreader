import { BookOpen } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-6">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">No books yet</h3>
      <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
        Upload your first EPUB file to start building your digital library
      </p>
    </div>
  )
}
