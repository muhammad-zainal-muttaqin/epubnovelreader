"use client"

import { useEffect, useRef } from "react"

interface ChapterContentProps {
  content: string
  fontSize: number
  fontFamily: "sans" | "serif" | "mono"
  lineHeight: number
  maxWidth: number
  onScroll?: (scrollPercentage: number) => void
}

export function ChapterContent({ content, fontSize, fontFamily, lineHeight, maxWidth, onScroll }: ChapterContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !onScroll) return

      const element = contentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight

      if (scrollHeight > 0) {
        const percentage = (scrollTop / scrollHeight) * 100
        onScroll(percentage)
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
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
  }[fontFamily]

  return (
    <div ref={contentRef} className="h-full overflow-y-auto scrollbar-hide">
      <article
        className={cn("prose prose-neutral mx-auto px-4 py-8 dark:prose-invert", fontFamilyClass)}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          maxWidth: `${maxWidth}px`,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
