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
          html += `<div class="my-10 flex justify-center scale-110 md:scale-125 overflow-x-auto py-4">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`
        } catch {
          html += `<div class="text-negative text-center my-6">${math}</div>`
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
          html += `<div class="flex justify-center scale-110 md:scale-125 my-4">${katex.renderToString(line.trim(), { displayMode: true, throwOnError: false })}</div>`
        } catch {
          html += `<div class="text-center">${line}</div>`
        }
        continue
      }

      // Headings
      if (line.startsWith("### ")) {
        html += `<h3 class="text-display-xs text-white font-bold mt-12 mb-6 tracking-tight">${renderInlineMath(line.replace("### ", ""))}</h3>`
        continue
      }
      if (line.startsWith("## ")) {
        html += `<h2 class="text-display-sm text-white font-black mt-16 mb-8 tracking-tighter">${renderInlineMath(line.replace("## ", ""))}</h2>`
        continue
      }
      if (line.startsWith("# ")) {
        html += `<h1 class="text-display-md text-white font-black mt-20 mb-10 tracking-tighter">${renderInlineMath(line.replace("# ", ""))}</h1>`
        continue
      }

      // Blockquote
      if (line.startsWith("> ")) {
        html += `<blockquote class="border-l-4 border-primary/20 bg-white/5 rounded-r-xl px-8 py-6 my-10 text-body-lg text-canvas-soft/80 italic leading-relaxed font-medium">${renderInlineMath(line.replace("> ", ""))}</blockquote>`
        continue
      }

      // List items
      if (line.startsWith("- ")) {
        html += `<li class="text-body-lg text-canvas-soft/70 ml-6 mb-4 list-none relative before:content-[''] before:absolute before:-left-6 before:top-3 before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">${renderInlineMath(line.replace("- ", ""))}</li>`
        continue
      }

      // Empty line
      if (line.trim() === "") {
        html += '<div class="h-6" />'
        continue
      }

      // Regular paragraph with inline math
      html += `<p class="text-body-lg text-canvas-soft/60 mb-8 leading-[1.7] tracking-tight font-medium">${renderInlineMath(line)}</p>`
    }

    ref.current.innerHTML = html
  }, [content])

  return <div ref={ref} className="katex-renderer select-text selection:bg-primary/20 selection:text-primary" />
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
