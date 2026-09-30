"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { docsNav } from "@/lib/docs-nav"

// Mirrors apps/v4/components/docs-sidebar.tsx from shadcn-ui/ui. The content's
// left padding lines the item text up with the logo in the top bar.
export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] w-(--sidebar-width) shrink-0 overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] md:flex"
    >
      {/* A 1px separator that fades out at both ends. */}
      <div
        aria-hidden
        className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-[linear-gradient(to_bottom,transparent_0%,var(--border)_10%,var(--border)_90%,transparent_100%)] md:flex"
      />
      <SidebarContent className="no-scrollbar scroll-fade w-(--sidebar-menu-width) overflow-x-hidden pl-[11px]">
        {docsNav.map((group, index) => (
          <SidebarGroup
            key={group.title}
            className={index === 0 ? "pt-12" : undefined}
          >
            <SidebarGroupLabel className="pl-[9px] font-medium text-muted-foreground">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-active:border-accent data-active:bg-accent"
                      render={<Link href={item.href} />}
                    >
                      {/* Makes the whole row clickable while the highlight
                          only wraps the text. */}
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
