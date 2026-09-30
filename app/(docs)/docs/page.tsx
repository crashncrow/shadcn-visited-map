import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/code-block"
import { InstallTabs } from "@/components/install-tabs"
import { DocsPage, DocsSection } from "@/components/site/docs-page"
import { usageExample, usageImport } from "@/lib/api-docs"

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Install the Visited Map component for shadcn/ui and render your first map.",
  alternates: { canonical: "/docs" },
}

const linkClass = "font-medium text-foreground underline underline-offset-4"

export default function GetStartedPage() {
  return (
    <DocsPage
      href="/docs"
      title="Get Started"
      description="An SVG world map for shadcn/ui that highlights the countries you've been to, pins cities on top, and counts how much of the world you've seen. No tiles, no API keys, and it renders in Server Components."
    >
      <DocsSection title="Prerequisite">
        <p className="text-muted-foreground">
          The component is installed with the shadcn CLI, so your project needs{" "}
          <a
            href="https://ui.shadcn.com/docs/installation"
            className={linkClass}
          >
            shadcn/ui
          </a>{" "}
          set up with Tailwind CSS v4.
        </p>
      </DocsSection>

      <DocsSection title="Installation">
        <InstallTabs />
        <p className="text-sm text-muted-foreground">
          This adds{" "}
          <code className="font-mono text-foreground">
            components/visited-map.tsx
          </code>{" "}
          and installs <code className="font-mono text-foreground">d3-geo</code>
          , <code className="font-mono text-foreground">topojson-client</code>{" "}
          and <code className="font-mono text-foreground">world-atlas</code>.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <CodeBlock code={usageImport} />
        <CodeBlock code={usageExample} />
        <p className="text-sm text-muted-foreground">
          If a country shows up more than once, the strongest status wins:
          current, then lived, visited and wishlist. See every option in the{" "}
          <Link href="/docs/api" className={linkClass}>
            API reference
          </Link>
          , or{" "}
          <Link href="/builder" className={linkClass}>
            build your countries and places
          </Link>{" "}
          by clicking instead of typing codes.
        </p>
      </DocsSection>
    </DocsPage>
  )
}
