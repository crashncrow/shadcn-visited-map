export const registryUrl =
  process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000"

const itemUrl = `${registryUrl}/r/visited-map.json`

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const

export type PackageManager = (typeof packageManagers)[number]

export const installCommands: Record<PackageManager, string> = {
  pnpm: `pnpm dlx shadcn@latest add ${itemUrl}`,
  npm: `npx shadcn@latest add ${itemUrl}`,
  yarn: `yarn shadcn@latest add ${itemUrl}`,
  bun: `bunx --bun shadcn@latest add ${itemUrl}`,
}
