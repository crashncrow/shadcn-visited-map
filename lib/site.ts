const rawRegistryUrl =
  process.env.NEXT_PUBLIC_REGISTRY_URL ??
  "https://shadcn-visited-map.vercel.app"

// Accept "example.com" as well as "https://example.com/": the shadcn CLI only
// treats the argument as a remote registry item when it has a protocol.
export const registryUrl = (
  /^https?:\/\//.test(rawRegistryUrl)
    ? rawRegistryUrl
    : `https://${rawRegistryUrl}`
).replace(/\/+$/, "")

const itemUrl = `${registryUrl}/r/visited-map.json`

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof packageManagers)[number]

export const installCommands: Record<PackageManager, string> = {
  pnpm: `pnpm dlx shadcn@latest add ${itemUrl}`,
  npm: `npx shadcn@latest add ${itemUrl}`,
  yarn: `yarn shadcn@latest add ${itemUrl}`,
  bun: `bunx --bun shadcn@latest add ${itemUrl}`,
}
