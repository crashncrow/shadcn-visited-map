// Namespace listed in the shadcn registry directory, so the CLI resolves it
// with nothing to set up in components.json.
const installTarget = "@visited-map/visited-map"

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof packageManagers)[number]

export const installCommands: Record<PackageManager, string> = {
  pnpm: `pnpm dlx shadcn@latest add ${installTarget}`,
  npm: `npx shadcn@latest add ${installTarget}`,
  yarn: `yarn dlx shadcn@latest add ${installTarget}`,
  bun: `bunx --bun shadcn@latest add ${installTarget}`,
}

/** Production URL: base for canonical links, the share image and sitemap. */
export const siteUrl = "https://visitedmap.vercel.app"
