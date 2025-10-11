"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, Shield, Database, Eye, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">EPUB Novel Reader</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Your privacy and data security are our top priorities
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Storage */}
          <section className="p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Data Storage</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Local Storage Only:</strong> All your EPUB files, 
                reading progress, and settings are stored locally in your browser using IndexedDB. 
                Nothing is uploaded to external servers.
              </p>
              <p>
                <strong className="text-foreground">Browser-Based:</strong> Your data remains on your device 
                and is only accessible to you. We cannot access your files or reading history.
              </p>
              <p>
                <strong className="text-foreground">No Cloud Sync:</strong> Unlike other reading apps, 
                we don't sync your data to the cloud, ensuring complete privacy.
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Data Collection</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Zero Data Collection:</strong> We do not collect, 
                store, or transmit any personal information or reading data.
              </p>
              <p>
                <strong className="text-foreground">No Analytics:</strong> We don't use tracking pixels, 
                analytics, or any data collection tools.
              </p>
              <p>
                <strong className="text-foreground">No Cookies:</strong> We don't use cookies for tracking 
                or data collection purposes.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Security</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Client-Side Processing:</strong> All EPUB parsing 
                and processing happens in your browser, not on external servers.
              </p>
              <p>
                <strong className="text-foreground">No External Dependencies:</strong> The app doesn't 
                make any external API calls that could compromise your data.
              </p>
              <p>
                <strong className="text-foreground">Open Source:</strong> The entire codebase is open source, 
                allowing you to verify our privacy claims.
              </p>
            </div>
          </section>

          {/* Technical Details */}
          <section className="p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Technical Implementation</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <strong className="text-foreground">IndexedDB:</strong> Your EPUB files and metadata are stored 
                in your browser's IndexedDB, which is a local database that only your browser can access.
              </div>
              <div>
                <strong className="text-foreground">LocalStorage:</strong> Reading settings and preferences 
                are stored in localStorage, which is also local to your browser.
              </div>
              <div>
                <strong className="text-foreground">No Server Communication:</strong> The app runs entirely 
                in your browser and doesn't communicate with any external servers.
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-lg border bg-muted/50">
            <h2 className="text-2xl font-semibold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our privacy practices or want to verify our claims, 
              you can examine the source code or contact us.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/")}>
                Back to App
              </Button>
              <Button variant="outline" onClick={() => window.open("https://github.com", "_blank")}>
                View Source Code
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
