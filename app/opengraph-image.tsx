import { geoMercator, geoPath } from "d3-geo"
import { ImageResponse } from "next/og"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"

import { countryCenters } from "@/lib/country-centers"
import { demoCountries } from "@/lib/demo-places"
import { getVisitedStats } from "@/registry/visited-map/visited-map"

// Share image for link previews, in the dark theme. Twitter/X cards use it
// too: Next copies og:image into twitter:image.

export const alt =
  "Visited Map: a world map for shadcn/ui with visited, lived and wishlist countries"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Variant = "visited" | "lived" | "wishlist" | "current"

type Theme = {
  background: string
  foreground: string
  muted: string
  border: string
  land: string
  landStroke: string
  colors: Record<Variant, { tint: string; pin: string; stroke: string }>
}

// Satori can't read Tailwind classes, so the demo map is drawn again here as a
// plain SVG with the same projection and the dark theme's colors.
const theme: Theme = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
  border: "#2e2e2e",
  land: "#262626",
  landStroke: "#3f3f3f",
  colors: {
    visited: { tint: "#38bdf833", pin: "#38bdf8", stroke: "#bae6fd" },
    lived: { tint: "#34d39933", pin: "#34d399", stroke: "#a7f3d0" },
    wishlist: { tint: "#fcd34d26", pin: "#fcd34d33", stroke: "#fcd34d" },
    current: { tint: "#fb718533", pin: "#fb7185", stroke: "#fecdd3" },
  },
}

// world-atlas ids (ISO 3166-1 numeric) of the demo countries.
const numericIds: Record<string, string> = {
  AR: "032",
  UY: "858",
  ES: "724",
  CL: "152",
  PE: "604",
  MX: "484",
  US: "840",
  GB: "826",
  DE: "276",
  IT: "380",
  MA: "504",
  JP: "392",
  TH: "764",
  ZA: "710",
  KE: "404",
  IS: "352",
  AU: "036",
}

const WIDTH = 960
const HEIGHT = 560
const PADDING = 8

function demoVariants() {
  const variants = new Map<string, Variant>()
  for (const code of demoCountries.wishlist ?? [])
    variants.set(code, "wishlist")
  for (const code of demoCountries.visited ?? []) variants.set(code, "visited")
  for (const code of demoCountries.lived ?? []) variants.set(code, "lived")
  if (demoCountries.current) variants.set(demoCountries.current, "current")
  return variants
}

function mapSvg({ colors, land, landStroke }: Theme) {
  const topology = worldAtlas as unknown as Parameters<typeof feature>[0]
  const { features } = feature(
    topology,
    topology.objects.countries as Parameters<typeof feature>[1] & {
      type: "GeometryCollection"
    }
  )
  const world = {
    type: "FeatureCollection" as const,
    features: features.filter((country) => country.id !== "010"),
  }
  const projection = geoMercator().fitSize([WIDTH, HEIGHT], world)
  const path = geoPath(projection)
  const [[x0, y0], [x1, y1]] = path.bounds(world)
  const box = {
    x: Math.floor(x0 - PADDING),
    y: Math.floor(y0 - PADDING),
    width: Math.ceil(x1 - x0 + PADDING * 2),
    height: Math.ceil(y1 - y0 + PADDING * 2),
  }

  const variants = demoVariants()
  const variantById = new Map(
    [...variants].map(([code, variant]) => [numericIds[code], variant])
  )

  const countries = world.features
    .map((country) => {
      const variant = variantById.get(String(country.id))
      const fill = variant ? colors[variant].tint : land
      return `<path d="${path(country) ?? ""}" fill="${fill}" stroke="${landStroke}" stroke-width="0.5"/>`
    })
    .join("")

  // Current goes last so it's drawn on top, like in the component.
  const pins = [...variants]
    .sort(([, a], [, b]) => Number(a === "current") - Number(b === "current"))
    .map(([code, variant]) => {
      const point = projection(countryCenters[code])
      if (!point) return ""
      const { pin, stroke } = colors[variant]
      const r = variant === "current" ? 7 : 6
      return `<circle cx="${point[0]}" cy="${point[1]}" r="${r}" fill="${pin}" stroke="${stroke}" stroke-width="2"/>`
    })
    .join("")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}">${countries}${pins}</svg>`
  return { svg, ratio: box.height / box.width }
}

const logo = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 19-1.106-.552a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619V12"/><path d="M15 5.764V12"/><path d="M9 3.236v15"/><path d="m15 19 2 2 4-4"/></svg>`

function dataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

const legend: { variant: Variant; label: string }[] = [
  { variant: "visited", label: "Visited" },
  { variant: "lived", label: "Lived" },
  { variant: "wishlist", label: "Wishlist" },
  { variant: "current", label: "Current" },
]

export default function Image() {
  const { colors } = theme
  const map = mapSvg(theme)
  const mapHeight = 440
  const mapWidth = Math.round(mapHeight / map.ratio)
  const stats = getVisitedStats({ countries: demoCountries })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 48,
        padding: 48,
        background: theme.background,
        color: theme.foreground,
      }}
    >
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}
      >
        <img
          src={dataUri(logo(theme.foreground))}
          width={60}
          height={60}
          alt=""
        />
        <div style={{ fontSize: 54, lineHeight: 1.1, letterSpacing: -2 }}>
          A visited map for shadcn/ui
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.4, color: theme.muted }}>
          Countries, cities and how much of the world you&apos;ve seen.
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 44, letterSpacing: -1.5 }}>
            {`${stats.percent}%`}
          </div>
          <div style={{ fontSize: 22, color: theme.muted }}>of the world</div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 22,
            rowGap: 10,
            fontSize: 21,
            color: theme.muted,
          }}
        >
          {legend.map(({ variant, label }) => (
            <div
              key={variant}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: colors[variant].pin,
                  border: `2px solid ${colors[variant].stroke}`,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: 12,
          border: `1px solid ${theme.border}`,
          borderRadius: 24,
        }}
      >
        <img
          src={dataUri(map.svg)}
          width={mapWidth - 26}
          height={mapHeight - 26}
          alt=""
        />
      </div>
    </div>,
    size
  )
}
