import { SiteFooter } from "@/components/site-footer"
import { DocsSidebar } from "@/components/site/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Shared by /docs and /builder (a route group, so URLs don't change). Content
// and footer use the docs-center utility (globals.css) with --content-width, so
// they're centered on the window when there's room, like the pages without a
// sidebar.
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      className="min-h-0 items-start"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <DocsSidebar />
      <main className="min-w-0 flex-1 px-4 pt-8 [--content-width:48rem] md:px-10 md:pt-10">
        {children}
        <SiteFooter className="docs-center mt-12" />
      </main>
    </SidebarProvider>
  )
}
