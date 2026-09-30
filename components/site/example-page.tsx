import { CodeBlock } from "@/components/code-block"
import { DocsPage, DocsSection } from "@/components/site/docs-page"
import { VisitedStatsCard } from "@/components/visited-stats-card"
import { exampleHref, type Example } from "@/lib/examples"
import { getVisitedStats, VisitedMap } from "@/registry/visited-map/visited-map"

export function ExamplePage({ example }: { example: Example }) {
  return (
    <DocsPage
      href={exampleHref(example)}
      title={example.title}
      description={example.description}
    >
      <DocsSection title="Preview">
        <div className="flex flex-col gap-3 lg:relative">
          {example.withStats && (
            <VisitedStatsCard
              stats={getVisitedStats(example.props)}
              className="lg:absolute lg:bottom-4 lg:left-4 lg:z-10 lg:w-52 lg:p-3.5"
            />
          )}
          <VisitedMap {...example.props} />
        </div>
      </DocsSection>
      <DocsSection title="Code">
        <CodeBlock code={example.code} />
      </DocsSection>
    </DocsPage>
  )
}
