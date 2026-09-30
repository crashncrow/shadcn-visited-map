import type { VisitedMapVariant } from "@/registry/visited-map/visited-map"

// Swatches matching the dot colors in registry/visited-map/visited-map.tsx.
export const legend: {
  variant: VisitedMapVariant
  label: string
  dot: string
}[] = [
  { variant: "visited", label: "Visited", dot: "bg-sky-500 dark:bg-sky-400" },
  {
    variant: "lived",
    label: "Lived",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    variant: "wishlist",
    label: "Wishlist",
    dot: "border-2 border-amber-500 bg-amber-400/25 dark:border-amber-300",
  },
  { variant: "current", label: "Current", dot: "bg-rose-500 dark:bg-rose-400" },
]
