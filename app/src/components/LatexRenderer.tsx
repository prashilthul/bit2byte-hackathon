"use client"

import { useEffect, useRef } from "react"
import katex from "katex"

interface LatexRendererProps {
  content: string
}

export default function LatexRenderer({ content }: LatexRendererProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    let html = ""
    const lines = content.split("\n")
    let inBlockMath = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Block math: $$...$$
      if (line.trim().startsWith("$$") && line.trim().endsWith("$$") && line.trim().length > 2) {
        const math = line.trim().slice(2, -2)
        try {
          html += katex.renderToString(math, { displayMode: true, throwOnError: false })
        } catch {
          html += `<div class="text-negative">${math}</div>`
        }
        continue
      }

      if (line.trim() === "$$") {
        if (inBlockMath) {
          inBlockMath = false
          continue
        }
        inBlockMath = true
        continue
      }

      if (inBlockMath) {
        try {
          html += katex.renderToString(line.trim(), { displayMode: true, throwOnError: false })
        } catch {
          html += line
        }
        continue
      }

      // Headings
      if (line.startsWith("### ")) {
        html += `<h3 class="text-display-xs text-canvas-soft font-bold mt-6 mb-2">${renderInlineMath(line.replace("### ", ""))}</h3>`
        continue
      }
      if (line.startsWith("## ")) {
        html += `<h2 class="text-display-xs text-canvas-soft font-black mt-8 mb-3">${renderInlineMath(line.replace("## ", ""))}</h2>`
        continue
      }
      if (line.startsWith("# ")) {
        html += `<h1 class="text-display-sm text-canvas-soft font-black mt-8 mb-4">${renderInlineMath(line.replace("# ", ""))}</h1>`
        continue
      }

      // Blockquote
      if (line.startsWith("> ")) {
        html += `<blockquote class="border-l-2 border-primary/30 pl-4 my-3 text-canvas-soft/60 italic">${renderInlineMath(line.replace("> ", ""))}</blockquote>`
        continue
      }

      // List items
      if (line.startsWith("- ")) {
        html += `<li class="text-body-md text-canvas-soft/70 ml-5 mb-1">${renderInlineMath(line.replace("- ", ""))}</li>`
        continue
      }

      // Empty line
      if (line.trim() === "") {
        html += '<div class="h-3" />'
        continue
      }

      // Regular paragraph with inline math
      html += `<p class="text-body-md text-canvas-soft/70 mb-3 leading-relaxed">${renderInlineMath(line)}</p>`
    }

    ref.current.innerHTML = html
  }, [content])

  return <div ref={ref} className="katex-renderer" />
}

function renderInlineMath(text: string): string {
  // Replace \(...\) or $...$ with KaTeX inline
  return text.replace(/\$([^\$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return math
    }
  })
}
