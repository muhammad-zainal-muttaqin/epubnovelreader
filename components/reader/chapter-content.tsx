"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

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
  initialScrollPercent?: number
}

export function ChapterContent({
  content,
  fontSize,
  fontFamily,
  lineHeight,
  maxWidth,
  textAlign,
  onScroll,
  isTranslating,
  pendingChunks = 0,
  initialScrollPercent,
}: ChapterContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !onScroll || !readyRef.current) return

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
      return () => element.removeEventListener("scroll", handleScroll)
    }
  }, [onScroll])

  useLayoutEffect(() => {
    if (!contentRef.current) return
    const el = contentRef.current

    if (initialScrollPercent == null) {
      readyRef.current = true
      return
    }

    readyRef.current = false

    const clamped = Math.max(0, Math.min(100, initialScrollPercent))
    let attempts = 0

    const applyScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) {
        readyRef.current = true
        if (onScroll) onScroll(100)
        return
      }

      const targetScroll = Math.round((clamped / 100) * maxScroll)
      el.scrollTop = targetScroll
      attempts += 1

      const reached = Math.abs(el.scrollTop - targetScroll) < 2 || attempts >= 5
      if (reached) {
        readyRef.current = true
        if (onScroll) {
          const scrollHeight = el.scrollHeight - el.clientHeight
          const percentage = scrollHeight > 0 ? Math.min((el.scrollTop / scrollHeight) * 100, 100) : 100
          onScroll(percentage)
        }
        return
      }

      requestAnimationFrame(applyScroll)
    }

    const raf1 = requestAnimationFrame(applyScroll)
    return () => cancelAnimationFrame(raf1)
  }, [content, initialScrollPercent, onScroll])

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
          "[&_*:not(.bg-muted)]:!bg-transparent",
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
