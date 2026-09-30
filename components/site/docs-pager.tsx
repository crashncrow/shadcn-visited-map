import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { getPager } from "@/lib/docs-nav"

export function DocsPager({ href }: { href: string }) {
  const { previous, next } = getPager(href)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t pt-6"
    >
      {previous ? (
        <Link
          href={previous.href}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeftIcon className="size-4" />
          {previous.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {next.title}
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </nav>
  )
}
