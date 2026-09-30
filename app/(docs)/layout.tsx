import { SiteFooter } from "@/components/site-footer"
import { DocsSidebar } from "@/components/site/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Shared by /docs and /places (a route group, so URLs don't change). Each page
// sets its own max width: docs read best narrow, the builder needs more room.
// Content and footer use the docs-center utility (globals.css) so they're
// centered on the window when there's room, like the pages without a sidebar.
// Both share --content-width: 48rem, or 56rem for pages marked
// data-content="wide" (the builder's table needs more room).
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="min-h-0 items-start">
      <DocsSidebar />
      <main className="min-w-0 flex-1 px-4 pt-8 [--content-width:48rem] has-data-[content=wide]:[--content-width:56rem] md:px-10 md:pt-10">
        {children}
        <SiteFooter className="docs-center mt-12" />
      </main>
    </SidebarProvider>
  )
}
