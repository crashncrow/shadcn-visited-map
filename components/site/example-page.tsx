import { CodeBlock } from "@/components/code-block"
import { DocsPage, DocsSection } from "@/components/site/docs-page"
import { exampleHref, type Example } from "@/lib/examples"
import { VisitedMap } from "@/registry/visited-map/visited-map"

export function ExamplePage({ example }: { example: Example }) {
  return (
    <DocsPage
      href={exampleHref(example)}
      title={example.title}
      description={example.description}
    >
      <DocsSection title="Preview">
        <VisitedMap {...example.props} />
      </DocsSection>
      <DocsSection title="Code">
        <CodeBlock code={example.code} />
      </DocsSection>
    </DocsPage>
  )
}
