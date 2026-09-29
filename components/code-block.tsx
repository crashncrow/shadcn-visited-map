import { codeToHtml } from "shiki"

import { CopyButton } from "@/components/copy-button"

// Highlighted on the server at build time: no highlighter JS ships to the client.
export async function CodeBlock({
  code,
  lang = "tsx",
}: {
  code: string
  lang?: string
}) {
  const html = await codeToHtml(code.trim(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })

  return (
    <div className="relative rounded-lg border bg-muted/50">
      <div className="absolute top-2 right-2">
        <CopyButton value={code.trim()} />
      </div>
      <div
        className="code-block overflow-x-auto py-4 pr-12 font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
