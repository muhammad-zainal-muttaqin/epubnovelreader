"use client"

interface ProgressBarProps {
  progress: number // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-muted">
      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  )
}
