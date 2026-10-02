"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsNav } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

// Looks like apps/v4/components/docs-sidebar.tsx from shadcn-ui/ui, as plain
// markup: it's a fixed list of links, so it doesn't need the Sidebar
// component (no collapsing, no mobile sheet, no context). The content's
// left padding lines the item text up with the logo in the top bar. The top
// margin matches the sticky offset, so the sidebar sits in the same place
// whether or not the page scrolls (otherwise it jumps on short pages).
//
// The sidebar is only as tall as its links, and never taller than the space
// between the header and the site footer (--footer-height, its height from md
// up). A taller sticky sidebar gets pushed up by the end of the page on short
// pages, and moves whenever the page height changes, e.g. while searching in
// the builder.
export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside
      data-slot="docs-sidebar"
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 mt-[0.6rem] hidden max-h-[calc(100svh-var(--header-height)-0.6rem-var(--footer-height))] w-(--sidebar-width) shrink-0 flex-col overflow-hidden overscroll-none text-sidebar-foreground [--footer-height:24.25rem] [--sidebar-menu-width:--spacing(56)] md:flex"
    >
      {/* A 1px separator that fades out at both ends. */}
      <div
        aria-hidden
        className="absolute top-12 right-2 bottom-0 h-full w-px bg-[linear-gradient(to_bottom,transparent_0%,var(--border)_10%,var(--border)_90%,transparent_100%)]"
      />
      <nav
        aria-label="Docs"
        className="no-scrollbar scroll-fade flex min-h-0 w-(--sidebar-menu-width) flex-1 flex-col overflow-x-hidden overflow-y-auto pl-[11px]"
      >
        {docsNav.map((group, index) => (
          <div
            key={group.title}
            className={cn("flex flex-col p-2", index === 0 && "pt-12")}
          >
            <h2
              data-slot="docs-sidebar-label"
              className="flex h-8 shrink-0 items-center px-2 pl-[9px] text-xs font-medium text-muted-foreground"
            >
              {group.title}
            </h2>
            <ul className="flex flex-col gap-0.5 text-sm">
              {group.items.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="relative flex h-[30px] w-fit items-center rounded-md border border-transparent p-2 text-[0.8rem] font-medium ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-sidebar-accent-foreground"
                    >
                      {/* Makes the whole row clickable while the highlight
                          only wraps the text. */}
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
