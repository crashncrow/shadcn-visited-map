import { DocsSidebar } from "@/components/site/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Shared by /docs and /builder (a route group, so URLs don't change). Content
// uses the docs-center utility (globals.css) with --content-width, so it's
// centered on the window when there's room, like the pages without a sidebar.
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
      <main className="min-w-0 flex-1 px-4 pt-8 [--content-width:48rem] pb-20 md:px-10 md:pt-10 md:pb-28">
        {children}
      </main>
    </SidebarProvider>
  )
}
