import Link from "next/link"

import { MapCheckIcon } from "@/components/map-check-icon"
import { CommandMenu } from "@/components/site/command-menu"
import { GitHubLink } from "@/components/site/github-link"
import { MainNav } from "@/components/site/main-nav"
import { MobileNav } from "@/components/site/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex h-(--header-height) items-center gap-2 px-4 md:px-6">
        <MobileNav className="-ml-2 md:hidden" />
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-1 py-1 font-semibold"
        >
          <MapCheckIcon className="size-5" />
          <span className="hidden sm:inline">Visited Map</span>
        </Link>
        <MainNav className="ml-2 hidden md:flex" />
        <div className="ml-auto flex items-center gap-1.5">
          <CommandMenu />
          <GitHubLink />
          <Separator orientation="vertical" className="mx-0.5 h-4!" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
