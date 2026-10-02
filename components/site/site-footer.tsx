import Link from "next/link"

import { GitHubIcon } from "@/components/github-icon"
import { Logo } from "@/components/site/logo"
import { repoUrl } from "@/lib/docs-nav"

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.4h2L6.5 3.2H4.3l13.3 17.4Z" />
    </svg>
  )
}

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Docs",
    links: [
      { label: "Get Started", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Map Builder", href: "/builder" },
    ],
  },
  {
    title: "Examples",
    links: [
      { label: "Countries", href: "/docs/examples" },
      { label: "Cities", href: "/docs/examples/cities" },
      { label: "Stats", href: "/docs/examples/stats" },
      { label: "Territories", href: "/docs/examples/territories" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: repoUrl },
      { label: "Registry", href: "/r/visited-map.json" },
      { label: "License", href: `${repoUrl}/blob/main/LICENSE` },
      { label: "shadcn/ui", href: "https://ui.shadcn.com" },
    ],
  },
]

const socials = [
  { label: "GitHub", href: repoUrl, Icon: GitHubIcon },
  { label: "X", href: "https://x.com/_nnaro_", Icon: XIcon },
]

function FooterLink({ href, children }: { href: string; children: string }) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground"
  // External links (and the raw registry JSON) open as plain links.
  if (href.startsWith("http") || href.endsWith(".json")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

// Boxed columns with a striped bottom bar, in the style of shadcnblocks'
// footer51 (written from scratch).
export function SiteFooter() {
  return (
    <footer className="pb-16 sm:pb-24">
      {/* Full-width lines above and below the box, like the original. */}
      <div className="border-y">
        <div className="mx-auto w-full max-w-5xl border-x">
          <div className="grid gap-10 px-6 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
            <div className="flex flex-col gap-4">
              <Link href="/" className="w-fit">
                <Logo className="text-lg" />
              </Link>
              <p className="max-w-xs text-sm text-muted-foreground">
                Free &amp; open-source, ready-to-use world map for shadcn/ui
                that shows how much of the world you&apos;ve seen.
              </p>
              <ul className="flex items-center gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Icon className="size-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12"
            >
              {columns.map((column) => (
                <div key={column.title} className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold">{column.title}</h2>
                  <ul className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink href={link.href}>{link.label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-2 border-t bg-[repeating-linear-gradient(-45deg,var(--border)_0,var(--border)_1px,transparent_0,transparent_8px)] px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Visited Map · MIT License</p>
            <p>
              Made with ♥ by{" "}
              <a
                href="https://x.com/_nnaro_"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground"
              >
                @_nnaro_
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
