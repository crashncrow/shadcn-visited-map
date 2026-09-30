"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { docsNav, mainNav } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

// The top links and the docs sidebar, in a sheet for small screens.
export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const link = (href: string, title: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      aria-current={pathname === href ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        pathname === href && "bg-muted font-medium text-foreground",
      )}
    >
      {title}
    </Link>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className={className}
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-6 px-4 pb-6">
          <div className="flex flex-col gap-0.5">
            {mainNav.map((item) => link(item.href, item.title))}
          </div>
          {docsNav.map((group) => (
            <div key={group.title} className="flex flex-col gap-0.5">
              <p className="px-2 pb-1 text-xs text-muted-foreground">
                {group.title}
              </p>
              {group.items.map((item) => link(item.href, item.title))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
