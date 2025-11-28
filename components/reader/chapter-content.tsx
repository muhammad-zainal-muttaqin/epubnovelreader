"use client"

import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface ChapterContentProps {
  content: string
  fontSize: number
  fontFamily: "sans" | "serif" | "mono" | "merriweather" | "open-sans" | "literata" | "garamond" | "opendyslexic"
  lineHeight: number
  maxWidth: number
  textAlign: "left" | "center" | "right" | "justify"
  onScroll?: (scrollPercentage: number) => void
  isTranslating?: boolean
}

export function ChapterContent({ content, fontSize, fontFamily, lineHeight, maxWidth, textAlign, onScroll, isTranslating }: ChapterContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !onScroll) return

      const element = contentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight

      if (scrollHeight > 0) {
        const percentage = Math.min((scrollTop / scrollHeight) * 100, 100)
        onScroll(percentage)
      } else {
        onScroll(100)
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
      handleScroll()
      return () => element.removeEventListener("scroll", handleScroll)
    }
  }, [onScroll])

  const fontFamilyClass = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
    merriweather: "font-[family-name:var(--font-merriweather)]",
    "open-sans": "font-[family-name:var(--font-open-sans)]",
    literata: "font-[family-name:var(--font-literata)]",
    garamond: "font-[family-name:var(--font-garamond)]",
    opendyslexic: "font-['OpenDyslexic']",
  }[fontFamily]

  const textAlignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  }[textAlign]

  return (
    <div ref={contentRef} className="h-full overflow-y-auto scrollbar-hide chapter-scroll" data-chapter-content>
      <article
        className={cn("prose prose-neutral mx-auto px-4 pt-20 pb-24 pb-[calc(6rem+env(safe-area-inset-bottom))]", fontFamilyClass, textAlignClass)}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          maxWidth: `${maxWidth}px`,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isTranslating && (
        <div className="flex items-center justify-center py-4 text-muted-foreground text-sm animate-pulse">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Translating remaining content...
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
