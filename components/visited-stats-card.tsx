import type { VisitedMapStats } from "@/registry/visited-map/visited-map"
import { cn } from "@/lib/utils"

export function VisitedStatsCard({
  stats,
  className,
}: {
  stats: VisitedMapStats
  className?: string
}) {
  const left = stats.total - stats.visited

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {stats.percent}%
        </span>
        <span className="text-sm text-muted-foreground">of the world</span>
      </p>
      <div
        role="progressbar"
        aria-label="Countries visited"
        aria-valuemin={0}
        aria-valuemax={stats.total}
        aria-valuenow={stats.visited}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full bg-sky-500 dark:bg-sky-400",
            // Keep a sliver visible for tiny percentages.
            stats.visited > 0 && "min-w-1.5",
          )}
          style={{ width: `${stats.percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
          {stats.visited} of {stats.total} countries
        </span>
        <span className="text-muted-foreground">{left} left</span>
      </div>
    </div>
  )
}
