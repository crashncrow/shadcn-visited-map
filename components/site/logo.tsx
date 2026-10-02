import { MapCheckIcon } from "@/components/map-check-icon"
import { cn } from "@/lib/utils"

// The icon and the gap are sized in em, so one text-size class on the logo
// scales the whole thing.
export function Logo({
  hideNameOnMobile = false,
  className,
}: {
  /** Show only the icon on narrow screens, as in the header. */
  hideNameOnMobile?: boolean
  className?: string
}) {
  return (
    <span
      className={cn("flex items-center gap-[0.5em] font-semibold", className)}
    >
      <MapCheckIcon className="size-[1.25em]" />
      <span className={cn(hideNameOnMobile && "hidden sm:inline")}>
        Visited Map
      </span>
    </span>
  )
}
