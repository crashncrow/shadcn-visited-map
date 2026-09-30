import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ExamplePage } from "@/components/site/example-page"
import { exampleHref, examples } from "@/lib/examples"

// The first example lives at /docs/examples, so it has no slug here.
export function generateStaticParams() {
  return examples
    .filter((example) => example.slug)
    .map((example) => ({ slug: example.slug }))
}

export const dynamicParams = false

function findExample(slug: string) {
  return examples.find((example) => example.slug && example.slug === slug)
}

export async function generateMetadata({
  params,
}: PageProps<"/docs/examples/[slug]">): Promise<Metadata> {
  const example = findExample((await params).slug)
  return example
    ? {
        title: example.title,
        description: example.description,
        alternates: { canonical: exampleHref(example) },
      }
    : {}
}

export default async function ExampleRoutePage({
  params,
}: PageProps<"/docs/examples/[slug]">) {
  const example = findExample((await params).slug)
  if (!example) notFound()
  return <ExamplePage example={example} />
}
