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
  /**
   * ISO 3166-1 alpha-2 code of the place's country (e.g. `"AR"`). The country
   * is highlighted unless the place is on the wishlist.
   */
  country?: VisitedMapCountryCode
  /** Defaults to "visited". */
  variant?: VisitedMapVariant
}

export type VisitedMapProps = {
  places: VisitedMapPlace[]
  /**
   * Extra countries to highlight, as ISO 3166-1 alpha-2 codes (e.g. `["UY"]`),
   * on top of the ones taken from `places`. Very small countries (Singapore,
   * Monaco, Malta…) aren't drawn at this map's resolution, but they still
   * count in `getVisitedStats`.
   */
  countries?: VisitedMapCountryCode[]
  className?: string
}

const WIDTH = 960
const HEIGHT = 560
const PADDING = 8
const ANTARCTICA_ID = "010"

// ISO 3166-1 alpha-2 → ISO numeric id used by world-atlas.
// prettier-ignore
const countryIds = {
  AE: "784", AF: "004", AL: "008", AM: "051", AO: "024", AR: "032", AT: "040",
  AU: "036", AZ: "031", BA: "070", BD: "050", BE: "056", BF: "854", BG: "100",
  BI: "108", BJ: "204", BN: "096", BO: "068", BR: "076", BS: "044", BT: "064",
  BW: "072", BY: "112", BZ: "084", CA: "124", CD: "180", CF: "140", CG: "178",
  CH: "756", CI: "384", CL: "152", CM: "120", CN: "156", CO: "170", CR: "188",
  CU: "192", CY: "196", CZ: "203", DE: "276", DJ: "262", DK: "208", DO: "214",
  DZ: "012", EC: "218", EE: "233", EG: "818", EH: "732", ER: "232", ES: "724",
  ET: "231", FI: "246", FJ: "242", FK: "238", FR: "250", GA: "266", GB: "826",
  GE: "268", GH: "288", GL: "304", GM: "270", GN: "324", GQ: "226", GR: "300",
  GT: "320", GW: "624", GY: "328", HN: "340", HR: "191", HT: "332", HU: "348",
  ID: "360", IE: "372", IL: "376", IN: "356", IQ: "368", IR: "364", IS: "352",
  IT: "380", JM: "388", JO: "400", JP: "392", KE: "404", KG: "417", KH: "116",
  KP: "408", KR: "410", KW: "414", KZ: "398", LA: "418", LB: "422", LK: "144",
  LR: "430", LS: "426", LT: "440", LU: "442", LV: "428", LY: "434", MA: "504",
  MD: "498", ME: "499", MG: "450", MK: "807", ML: "466", MM: "104", MN: "496",
  MR: "478", MW: "454", MX: "484", MY: "458", MZ: "508", NA: "516", NC: "540",
  NE: "562", NG: "566", NI: "558", NL: "528", NO: "578", NP: "524", NZ: "554",
  OM: "512", PA: "591", PE: "604", PG: "598", PH: "608", PK: "586", PL: "616",
  PR: "630", PS: "275", PT: "620", PY: "600", QA: "634", RO: "642", RS: "688",
  RU: "643", RW: "646", SA: "682", SB: "090", SD: "729", SE: "752", SI: "705",
  SK: "703", SL: "694", SN: "686", SO: "706", SR: "740", SS: "728", SV: "222",
  SY: "760", SZ: "748", TD: "148", TF: "260", TG: "768", TH: "764", TJ: "762",
  TL: "626", TM: "795", TN: "788", TR: "792", TT: "780", TW: "158", TZ: "834",
  UA: "804", UG: "800", US: "840", UY: "858", UZ: "860", VE: "862", VN: "704",
  VU: "548", YE: "887", ZA: "710", ZM: "894", ZW: "716",
} as const

// The 193 UN member states plus the two observer states (Vatican, Palestine):
// the "195 countries" used for travel stats. Some are too small to be drawn
// on this map but still count.
// prettier-ignore
const sovereignCodes = [
  "AD", "AE", "AF", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ", "BA", "BB",
  "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BS", "BT", "BW",
  "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL", "CM", "CN", "CO", "CR",
  "CU", "CV", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG",
  "ER", "ES", "ET", "FI", "FJ", "FM", "FR", "GA", "GB", "GD", "GE", "GH", "GM",
  "GN", "GQ", "GR", "GT", "GW", "GY", "HN", "HR", "HT", "HU", "ID", "IE", "IL",
  "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM",
  "KN", "KP", "KR", "KW", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT",
  "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML", "MM", "MN",
  "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL",
  "NO", "NP", "NR", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PS", "PT",
  "PW", "PY", "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG",
  "SI", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SY", "SZ", "TD",
  "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TZ", "UA", "UG",
  "US", "UY", "UZ", "VA", "VC", "VE", "VN", "VU", "WS", "YE", "ZA", "ZM", "ZW",
] as const

/**
 * ISO 3166-1 alpha-2 code of a country that can be highlighted on the map or
 * counted in `getVisitedStats` (or both).
 */
export type VisitedMapCountryCode =
  keyof typeof countryIds | (typeof sovereignCodes)[number] | "XK"

const sovereign = new Set<string>(sovereignCodes)

const codeById = new Map<string, string>(
  Object.entries(countryIds).map(([code, id]) => [id, code]),
)

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
  // Kosovo has no ISO numeric id in world-atlas; "XK" is its common code.
  code:
    country.id !== undefined
      ? codeById.get(String(country.id))
      : country.properties?.name === "Kosovo"
        ? "XK"
        : undefined,
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

function getHighlightedCountries(
  places: VisitedMapPlace[],
  countries: VisitedMapCountryCode[] = [],
) {
  // Wishlist places haven't been visited yet, so their country stays plain.
  const fromPlaces = places.flatMap((place) =>
    place.country && place.variant !== "wishlist" ? [place.country] : [],
  )
  return new Set(
    [...fromPlaces, ...countries].map((code) => code.toUpperCase()),
  )
}

export type VisitedMapStats = {
  /** Countries visited, counted once each (wishlist places excluded). */
  visited: number
  /** Always 195: UN member states plus the two observer states. */
  total: number
  /** `visited / total` as a percentage, rounded to one decimal. */
  percent: number
}

/**
 * Share of the world's 195 countries you've visited, from the same data the
 * map highlights. Territories (Greenland, Puerto Rico…), Kosovo and Taiwan
 * can be highlighted but aren't counted.
 */
export function getVisitedStats(
  places: VisitedMapPlace[],
  countries?: VisitedMapCountryCode[],
): VisitedMapStats {
  const total = sovereign.size
  const visited = Array.from(getHighlightedCountries(places, countries)).filter(
    (code) => sovereign.has(code),
  ).length

  return {
    visited,
    total,
    percent: Math.round((visited / total) * 1000) / 10,
  }
}

export function VisitedMap({ places, countries, className }: VisitedMapProps) {
  const points = projectPlaces(places)
  const highlighted = getHighlightedCountries(places, countries)

  return (
    <div
      data-slot="visited-map"
      className={cn("rounded-xl border bg-card p-2", className)}
    >
      <div className="relative">
        <svg viewBox={viewBox} className="block h-auto w-full" aria-hidden>
          <g className="fill-muted stroke-border" strokeWidth={0.5}>
            {countryPaths.map(({ key, code, d }) => (
              <path
                key={key}
                d={d}
                data-country={code}
                className={
                  code && highlighted.has(code)
                    ? "fill-sky-500/25 dark:fill-sky-400/20"
                    : undefined
                }
              />
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
