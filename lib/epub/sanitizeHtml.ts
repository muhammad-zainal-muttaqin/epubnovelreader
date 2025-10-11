// HTML sanitizer for EPUB content

const ALLOWED_TAGS = new Set([
  "p",
  "div",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "em",
  "strong",
  "i",
  "b",
  "u",
  "s",
  "sup",
  "sub",
  "br",
  "hr",
  "img",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "figure",
  "figcaption",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
  "main",
])

const ALLOWED_ATTRIBUTES = new Set(["href", "src", "alt", "title", "class", "id", "width", "height", "style"])

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"]

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  sanitizeNode(doc.body)

  return doc.body.innerHTML
}

function sanitizeNode(node: Node): void {
  const nodesToRemove: Node[] = []

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement
      const tagName = element.tagName.toLowerCase()

      // Remove disallowed tags
      if (!ALLOWED_TAGS.has(tagName)) {
        nodesToRemove.push(child)
        return
      }

      // Remove disallowed attributes
      Array.from(element.attributes).forEach((attr) => {
        if (!ALLOWED_ATTRIBUTES.has(attr.name)) {
          element.removeAttribute(attr.name)
        } else {
          // Check for dangerous protocols in href/src
          if (attr.name === "href" || attr.name === "src") {
            const value = attr.value.toLowerCase().trim()
            if (DANGEROUS_PROTOCOLS.some((protocol) => value.startsWith(protocol))) {
              element.removeAttribute(attr.name)
            }
          }
        }
      })

      // Remove inline event handlers
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          element.removeAttribute(attr.name)
        }
      })

      // Recursively sanitize children
      sanitizeNode(child)
    } else if (child.nodeType === Node.COMMENT_NODE) {
      nodesToRemove.push(child)
    }
  })

  nodesToRemove.forEach((child) => node.removeChild(child))
}

export function extractTextContent(html: string): string {
  if (typeof window === "undefined") return ""

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  return doc.body.textContent || ""
}
