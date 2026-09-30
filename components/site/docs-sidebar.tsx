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

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    // pl-3 lines the item text up with the logo in the top bar.
    <Sidebar
      collapsible="none"
      className="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-(--sidebar-width) shrink-0 bg-transparent pl-3 md:flex"
    >
      <SidebarContent className="no-scrollbar py-4">
        {docsNav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="w-fit"
                      render={<Link href={item.href} />}
                    >
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
