import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

// The look shared by every code block: border, line numbers (see .code-block in
// globals.css) and a copy button. `html` is Shiki output, or plainCodeHtml()
// while it isn't available.
export function CodeFrame({
  code,
  html,
  showCopy = true,
  className,
}: {
  code: string
  html: string
  showCopy?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative rounded-lg border bg-muted/50", className)}>
      {showCopy && (
        <div className="absolute top-2 right-2 z-10">
          <CopyButton value={code} />
        </div>
      )}
      <div
        className={cn(
          "code-block overflow-x-auto py-4 font-mono text-sm leading-relaxed",
          showCopy && "pr-12",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

/** Uncolored markup with the same structure as Shiki's, so line numbers show. */
export function plainCodeHtml(code: string) {
  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const lines = code
    .split("\n")
    .map((line) => `<span class="line">${escape(line)}</span>`)
    .join("\n")
  return `<pre class="shiki"><code>${lines}</code></pre>`
}
