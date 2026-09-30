import type { PropRow } from "@/components/site/props-table"
import {
  countriesFields,
  placeFields,
  statsFields,
  usageExample,
  usageImport,
  visitedMapProps,
} from "@/lib/api-docs"
import { docsNav, repoUrl } from "@/lib/docs-nav"
import { exampleHref, examples } from "@/lib/examples"
import { installCommands, siteUrl } from "@/lib/site"

// https://llmstxt.org: a Markdown summary of the docs for LLMs, built from the
// same data as the pages so it doesn't drift.
export const dynamic = "force-static"

const description =
  "Free & open-source, ready-to-use world map for shadcn/ui that shows how much of the world you've seen."

function fields(rows: PropRow[]) {
  return rows
    .map((row) => {
      const meta = row.default
        ? `\`${row.type}\`, default \`${row.default}\``
        : `\`${row.type}\``
      return `- \`${row.name}\` (${meta}): ${row.description}`
    })
    .join("\n")
}

function link(title: string, href: string, note?: string) {
  const url = href.startsWith("http") ? href : `${siteUrl}${href}`
  return `- [${title}](${url})${note ? `: ${note}` : ""}`
}

export function GET() {
  const docsLinks = docsNav
    .filter((group) => group.title === "Basics")
    .flatMap((group) => group.items)
    .map((item) => link(item.title, item.href))

  const text = `# Visited Map

> ${description}

Visited Map is a shadcn/ui registry component: a single file (\`components/visited-map.tsx\`) with an SVG world map that highlights countries by status (current, lived, visited, wishlist), pins cities or any other point, and shows the share of the world's 195 countries you've visited. It has no "use client" and no hooks, so it renders in React Server Components; there are no map tiles or API keys. It needs shadcn/ui with Tailwind CSS v4 and installs d3-geo, topojson-client and world-atlas.

## Installation

\`\`\`bash
${installCommands.npm}
\`\`\`

The registry item is also available as JSON at ${siteUrl}/r/visited-map.json.

## Usage

\`\`\`tsx
${usageImport}

${usageExample}
\`\`\`

## API

### VisitedMap props

${fields(visitedMapProps)}

If a country shows up more than once (in several lists, or through a place's \`country\`), the strongest status wins: current, then lived, visited and wishlist. A country's center pin only reflects \`countries\`.

### VisitedMapCountries

${fields(countriesFields)}

### VisitedMapPlace

${fields(placeFields)}

### VisitedMapCountryCode

An ISO 3166-1 alpha-2 code for one of the 195 countries or 50 territories ("XK" for Kosovo). Every code gets a pin at its center. The map is drawn at 1:110m, so small countries and islands (Singapore, Malta, Curaçao) show just the pin. Territories are never counted in the stats, and the Malvinas Islands are part of Argentina.

### getVisitedStats({ countries, places })

Returns \`{ visited, total, percent }\`:

${fields(statsFields)}

### visitedMapVariants and VisitedMapSwatch

\`visitedMapVariants\` lists every status with its label in legend order; \`<VisitedMapSwatch variant="visited" />\` draws that status's pin. Use them to build a custom legend.

## Docs

${docsLinks.join("\n")}

## Examples

${examples.map((example) => link(example.title, exampleHref(example), example.description)).join("\n")}

## Optional

${link("Map Builder", "/builder", "Pick countries and territories, add places, and copy the generated code")}
${link("Source code", repoUrl, "MIT license")}
`

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
