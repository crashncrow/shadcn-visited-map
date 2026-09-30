"use client"

import { useEffect, useState } from "react"
import type { HighlighterCore } from "shiki/core"

import { CodeFrame, plainCodeHtml } from "@/components/code-frame"

// Loaded on first use and shared: only the TSX grammar, the two GitHub themes
// and the JavaScript regex engine (no WebAssembly), so it stays small.
let highlighterPromise: Promise<HighlighterCore> | null = null

function loadHighlighter() {
  highlighterPromise ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
    import("shiki/langs"),
    import("shiki/themes"),
  ]).then(
    ([
      { createHighlighterCore },
      { createJavaScriptRegexEngine },
      { bundledLanguages },
      { bundledThemes },
    ]) =>
      createHighlighterCore({
        langs: [bundledLanguages.tsx()],
        themes: [
          bundledThemes["github-light"](),
          bundledThemes["github-dark"](),
        ],
        engine: createJavaScriptRegexEngine(),
      }),
  )
  return highlighterPromise
}

/**
 * Like CodeBlock, but highlighted in the browser, for code that changes as
 * the user interacts. Shows the same frame uncolored until Shiki loads.
 */
export function LiveCodeBlock({
  code,
  showCopy,
  className,
}: {
  code: string
  showCopy?: boolean
  className?: string
}) {
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null)

  useEffect(() => {
    let cancelled = false
    loadHighlighter().then((instance) => {
      if (!cancelled) setHighlighter(instance)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const html = highlighter
    ? highlighter.codeToHtml(code, {
        lang: "tsx",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      })
    : plainCodeHtml(code)

  return (
    <CodeFrame
      code={code}
      html={html}
      showCopy={showCopy}
      className={className}
    />
  )
}
