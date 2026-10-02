// GitHub address (owner/repo/item): the shadcn CLI reads registry.json from the
// repo. Switch to "@visited-map/visited-map" once the namespace is listed in the
// shadcn registry directory.
const installTarget = "crashncrow/shadcn-visited-map/visited-map"

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof packageManagers)[number]

export const installCommands: Record<PackageManager, string> = {
  pnpm: `pnpm dlx shadcn@latest add ${installTarget}`,
  npm: `npx shadcn@latest add ${installTarget}`,
  yarn: `yarn shadcn@latest add ${installTarget}`,
  bun: `bunx --bun shadcn@latest add ${installTarget}`,
}

/** Production URL: base for canonical links, the share image and sitemap. */
export const siteUrl = "https://shadcn-visited-map.vercel.app"
