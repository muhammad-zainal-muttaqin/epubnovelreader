"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Upload, Moon, Sun, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { toggleThemeWithTransition } from "@/lib/theme-transition"

export default function HomePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-lg sm:text-xl font-bold">EPUB Novel Reader</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => toggleThemeWithTransition(e, setTheme, theme)}
                aria-label="Toggle theme"
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Your Personal{" "}
              <span className="text-primary">EPUB Library</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A beautiful, privacy-first EPUB reader that keeps your books local and secure. 
              No cloud, no tracking, just pure reading experience.
            </p>
            <Button size="lg" onClick={() => router.push("/library")} className="text-lg px-6 py-4 sm:px-8 sm:py-6">
              <BookOpen className="mr-2 h-5 w-5" />
              Go to Library
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16">
            <div className="p-4 sm:p-6">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Smart Reading</h3>
              <p className="text-muted-foreground text-sm">
                TOC-based navigation, internal links, and automatic progress tracking
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Fully Customizable</h3>
              <p className="text-muted-foreground text-sm">
                8 fonts including OpenDyslexic, adjustable spacing, themes, and alignment
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground text-sm">
                100% local storage - your books never leave your device
              </p>
            </div>
          </div>

          {/* Privacy Highlight */}
          <div className="bg-muted/30 rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16">
            <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Your Data, Your Device</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Everything is stored locally in your browser. No external servers, no data collection, 
              no privacy concerns. Your EPUB files and reading progress never leave your device.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Local storage only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Open source</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">&copy; 2025 EPUB Novel Reader</p>
            <Button variant="link" onClick={() => router.push("/privacy")} className="text-muted-foreground">
              Privacy Policy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
