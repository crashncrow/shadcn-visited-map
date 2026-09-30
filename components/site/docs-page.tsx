import { DocsPager } from "@/components/site/docs-pager"

// Title, description and previous/next links shared by every docs page.
export function DocsPage({
  href,
  title,
  description,
  children,
}: {
  href: string
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="docs-center flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      {children}
      <DocsPager href={href} />
    </article>
  )
}

export function DocsSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}
