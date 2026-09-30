"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { mainNav } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

// "/docs" is active on docs pages except the examples, which have their own link.
export function isNavItemActive(href: string, pathname: string) {
  if (href === "/docs")
    return (
      pathname.startsWith("/docs") && !pathname.startsWith("/docs/examples")
    )
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("items-center gap-1", className)}>
      {mainNav.map((item) => {
        const active = isNavItemActive(item.href, pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
