"use client"

import { useEffect, useRef } from "react"

interface ChapterContentProps {
  content: string
  fontSize: number
  fontFamily: "sans" | "serif" | "mono" | "merriweather" | "open-sans" | "literata" | "garamond"
  lineHeight: number
  maxWidth: number
  textAlign: "left" | "center" | "right" | "justify"
  onScroll?: (scrollPercentage: number) => void
}

export function ChapterContent({ content, fontSize, fontFamily, lineHeight, maxWidth, textAlign, onScroll }: ChapterContentProps) {
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
        // If content fits in viewport, consider it 100% read
        onScroll(100)
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
      // Check initial scroll position
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
  }[fontFamily]

  const textAlignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  }[textAlign]

  return (
    <div ref={contentRef} className="h-full overflow-y-auto scrollbar-hide">
      <article
        className={cn("prose prose-neutral mx-auto px-4 py-8 pb-24 pb-[calc(6rem+env(safe-area-inset-bottom))]", fontFamilyClass, textAlignClass)}
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
