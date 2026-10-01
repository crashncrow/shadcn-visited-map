import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getPager } from "@/lib/docs-nav"

export function DocsPager({ href }: { href: string }) {
  const { previous, next } = getPager(href)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t pt-6"
    >
      {previous ? (
        <Button
          variant="outline"
          render={<Link href={previous.href} />}
          nativeButton={false}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {previous.title}
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button
          variant="outline"
          render={<Link href={next.href} />}
          nativeButton={false}
        >
          {next.title}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      )}
    </nav>
  )
}
