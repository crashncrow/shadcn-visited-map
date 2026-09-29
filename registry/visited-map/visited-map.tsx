import { geoMercator, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"

import { cn } from "@/lib/utils"

// This component is intentionally isomorphic: no "use client", no hooks and
// no server-only APIs. Rendered from a Server Component, the map is plain SVG
// markup and the TopoJSON never reaches the client bundle.

export type VisitedMapVariant = "visited" | "lived" | "wishlist" | "current"

export type VisitedMapPlace = {
  name: string
  /**
   * Coordinates in **[longitude, latitude]** order (GeoJSON / d3 convention).
   * Note that Google Maps copies them as "lat, lng", so swap them:
   * Buenos Aires is `[-58.38, -34.6]`, not `[-34.6, -58.38]`.
   */
  coords: [lng: number, lat: number]
  /** Defaults to "visited". */
  variant?: VisitedMapVariant
}

export type VisitedMapProps = {
  places: VisitedMapPlace[]
  className?: string
}

const WIDTH = 960
const HEIGHT = 560
const PADDING = 8
const ANTARCTICA_ID = "010"

const topology = worldAtlas as unknown as Parameters<typeof feature>[0]
const { features } = feature(
  topology,
  topology.objects.countries as Parameters<typeof feature>[1] & {
    type: "GeometryCollection"
  },
)
const countries = {
  type: "FeatureCollection" as const,
  features: features.filter((country) => country.id !== ANTARCTICA_ID),
}

const projection = geoMercator().fitSize([WIDTH, HEIGHT], countries)
const path = geoPath(projection)

const countryPaths = countries.features.map((country, index) => ({
  key: country.id ?? index,
  d: path(country) ?? "",
}))

// Crop the viewBox to the land bounds so there is no empty band above/below.
const [[x0, y0], [x1, y1]] = path.bounds(countries)
const viewBoxX = Math.floor(x0 - PADDING)
const viewBoxY = Math.floor(y0 - PADDING)
const viewBoxWidth = Math.ceil(x1 - x0 + PADDING * 2)
const viewBoxHeight = Math.ceil(y1 - y0 + PADDING * 2)
const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`

const variantStyles: Record<VisitedMapVariant, string> = {
  visited: "fill-sky-500 stroke-sky-700 dark:fill-sky-400 dark:stroke-sky-200",
  lived:
    "fill-emerald-500 stroke-emerald-700 dark:fill-emerald-400 dark:stroke-emerald-200",
  wishlist:
    "fill-amber-400/25 stroke-amber-500 dark:fill-amber-300/20 dark:stroke-amber-300",
  current:
    "fill-rose-500 stroke-rose-700 dark:fill-rose-400 dark:stroke-rose-200",
}

function projectPlaces(places: VisitedMapPlace[]) {
  // SVG has no z-index: put "current" last so it's never covered.
  const sorted = [...places].sort(
    (a, b) => Number(a.variant === "current") - Number(b.variant === "current"),
  )

  return sorted.flatMap((place, index) => {
    const point = projection(place.coords)
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1]))
      return []

    const [cx, cy] = point
    return [
      {
        key: `${place.name}-${index}`,
        name: place.name,
        variant: place.variant ?? "visited",
        cx,
        cy,
        // Position of the dot as a percentage of the rendered map.
        left: ((cx - viewBoxX) / viewBoxWidth) * 100,
        top: ((cy - viewBoxY) / viewBoxHeight) * 100,
      },
    ]
  })
}

export function VisitedMap({ places, className }: VisitedMapProps) {
  const points = projectPlaces(places)

  return (
    <div
      data-slot="visited-map"
      className={cn("rounded-xl border bg-card p-2", className)}
    >
      <div className="relative">
        <svg viewBox={viewBox} className="block h-auto w-full" aria-hidden>
          <g className="fill-muted stroke-border" strokeWidth={0.5}>
            {countryPaths.map(({ key, d }) => (
              <path key={key} d={d} />
            ))}
          </g>
          {points.map((point) => (
            <g
              key={point.key}
              data-variant={point.variant}
              className={variantStyles[point.variant]}
            >
              {point.variant === "current" && (
                <circle
                  cx={point.cx}
                  cy={point.cy}
                  r={5}
                  className="origin-center animate-ping stroke-none opacity-75 transform-fill"
                />
              )}
              <circle
                cx={point.cx}
                cy={point.cy}
                r={point.variant === "current" ? 5 : 4}
                strokeWidth={1.5}
              />
            </g>
          ))}
        </svg>
        {/*
          Tooltips are plain HTML laid over the SVG so their text doesn't shrink
          with the map. Each hit area is focusable, so hover, click/tap and
          keyboard focus all show the tooltip with CSS only (no JS needed).
        */}
        <ul aria-label="Places" className="absolute inset-0">
          {points.map((point) => (
            <li
              key={point.key}
              tabIndex={0}
              className="group absolute size-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none hover:z-10 focus:z-10 focus-visible:ring-2 focus-visible:ring-ring"
              style={{ left: `${point.left}%`, top: `${point.top}%` }}
            >
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                {point.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
