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
  pendingChunks?: number
}

export function ChapterContent({ content, fontSize, fontFamily, lineHeight, maxWidth, textAlign, onScroll, isTranslating, pendingChunks = 0 }: ChapterContentProps) {
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
        className={cn(
          "prose prose-neutral dark:prose-invert mx-auto px-4 pt-20 pb-24 pb-[calc(6rem+env(safe-area-inset-bottom))]",
          "break-words overflow-wrap-anywhere",
          "[&_*]:!bg-transparent",
          "[&_*]:!font-[inherit]",
          "[&_*]:!text-[length:inherit] [&_*]:!leading-[inherit]",
          "[&_p]:!mb-4 [&_p]:!mt-0 [&_p]:!leading-relaxed [&_p]:break-words",
          "[&_div]:!mb-4 [&_div]:!mt-0 [&_div]:break-words",
          "[&_span]:!bg-transparent [&_span]:break-words",
          "[&_pre]:!whitespace-pre-wrap [&_pre]:!break-words",
          fontFamilyClass, 
          textAlignClass
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          maxWidth: `${maxWidth}px`,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
