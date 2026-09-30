import { codeToHtml } from "shiki"

import { CodeFrame } from "@/components/code-frame"

// Highlighted on the server at build time: no highlighter JS ships to the client.
export async function CodeBlock({
  code,
  lang = "tsx",
}: {
  code: string
  lang?: string
}) {
  const trimmed = code.trim()
  const html = await codeToHtml(trimmed, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })

  return <CodeFrame code={trimmed} html={html} />
}
