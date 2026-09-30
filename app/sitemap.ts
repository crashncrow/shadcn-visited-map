import type { MetadataRoute } from "next"

import { docsNav } from "@/lib/docs-nav"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set([
    "/",
    ...docsNav.flatMap((g) => g.items.map((i) => i.href)),
  ])
  return Array.from(paths, (path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    priority: path === "/" ? 1 : 0.7,
  }))
}
