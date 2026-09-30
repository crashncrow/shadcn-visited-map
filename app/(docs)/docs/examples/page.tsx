import type { Metadata } from "next"

import { ExamplePage } from "@/components/site/example-page"
import { examples } from "@/lib/examples"

const example = examples[0]

export const metadata: Metadata = {
  title: example.title,
  description: example.description,
  alternates: { canonical: "/docs/examples" },
}

export default function ExamplesIndexPage() {
  return <ExamplePage example={example} />
}
