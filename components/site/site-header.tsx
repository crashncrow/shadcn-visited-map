import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { CommandMenu } from "@/components/site/command-menu"
import { GitHubLink } from "@/components/site/github-link"
import { Logo } from "@/components/site/logo"
import { MainNav } from "@/components/site/main-nav"
import { MobileNav } from "@/components/site/mobile-nav"
import { ModeSwitcher } from "@/components/site/mode-switcher"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Mirrors apps/v4/components/site-header.tsx from shadcn-ui/ui, plus our logo
// (the docs sidebar text lines up with it).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="flex h-(--header-height) items-center px-4 **:data-[slot=separator]:h-4! md:px-6">
        <MobileNav className="-ml-2 md:hidden" />
        <Link
          href="/"
          aria-label="Visited Map"
          className="rounded-md px-1 py-1"
        >
          <Logo hideNameOnMobile />
        </Link>
        <MainNav className="ml-3 hidden md:flex" />
        <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
          <CommandMenu />
          <Separator orientation="vertical" className="ml-2 hidden lg:block" />
          <GitHubLink />
          <Separator orientation="vertical" />
          <ModeSwitcher />
          <Separator orientation="vertical" />
          <Button
            size="sm"
            className="h-[31px] rounded-lg"
            render={<Link href="/builder" />}
            nativeButton={false}
          >
            <PlusIcon data-icon="inline-start" />
            New
          </Button>
        </div>
      </div>
    </header>
  )
}
