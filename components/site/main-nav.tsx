"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
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

// Mirrors apps/v4/components/main-nav.tsx from shadcn-ui/ui.
export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("items-center gap-0", className)}>
      {mainNav.map((item) => {
        const active = isNavItemActive(item.href, pathname)
        return (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            className={cn(
              "px-2.5 text-muted-foreground",
              active && "text-foreground",
            )}
            render={
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
              />
            }
            nativeButton={false}
          >
            {item.title}
          </Button>
        )
      })}
    </nav>
  )
}
