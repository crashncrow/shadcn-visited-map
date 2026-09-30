import { CodeBlock } from "@/components/code-block"
import { DocsPage } from "@/components/site/docs-page"
import { PreviewTabs } from "@/components/site/preview-tabs"
import { exampleHref, type Example } from "@/lib/examples"
import { VisitedMap } from "@/registry/visited-map/visited-map"

export function ExamplePage({ example }: { example: Example }) {
  return (
    <DocsPage
      href={exampleHref(example)}
      title={example.title}
      description={example.description}
    >
      <PreviewTabs
        preview={<VisitedMap {...example.props} />}
        // "Copy code" is already next to the tabs.
        code={<CodeBlock code={example.code} showCopy={false} />}
        copyValue={example.code.trim()}
      />
    </DocsPage>
  )
}
