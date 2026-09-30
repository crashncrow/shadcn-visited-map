import { exampleHref, examples } from "@/lib/examples"

export type NavItem = { title: string; href: string }

export type NavGroup = { title: string; items: NavItem[] }

export const repoUrl = "https://github.com/crashncrow/shadcn-visited-map"

/** Links in the top bar. */
export const mainNav: NavItem[] = [
  { title: "Docs", href: "/docs" },
  { title: "Examples", href: "/docs/examples" },
  { title: "Builder", href: "/builder" },
]

/** Left sidebar of the docs, also used by the search and mobile menu. */
export const docsNav: NavGroup[] = [
  {
    title: "Basics",
    items: [
      { title: "Get Started", href: "/docs" },
      { title: "API Reference", href: "/docs/api" },
    ],
  },
  {
    title: "Examples",
    items: examples.map((example) => ({
      title: example.title,
      href: exampleHref(example),
    })),
  },
  {
    title: "Tools",
    items: [{ title: "Places Builder", href: "/builder" }],
  },
]

// Docs pages in reading order, for the previous/next links.
const pagerItems = docsNav
  .filter((group) => group.title !== "Tools")
  .flatMap((group) => group.items)

export function getPager(href: string) {
  const index = pagerItems.findIndex((item) => item.href === href)
  return {
    previous: index > 0 ? pagerItems[index - 1] : undefined,
    next:
      index >= 0 && index < pagerItems.length - 1
        ? pagerItems[index + 1]
        : undefined,
  }
}
