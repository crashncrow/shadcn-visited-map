import { geoArea, geoMercator, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"

import { cn } from "@/lib/utils"

import { VisitedMapZoom, type VisitedMapView } from "./visited-map-zoom"

// This component is intentionally isomorphic: no "use client", no hooks and
// no server-only APIs. Rendered from a Server Component, the map is plain SVG
// markup and the TopoJSON never reaches the client bundle. Only `zoomable`
// adds a client component (visited-map-zoom.tsx), which moves the
// server-rendered map without ever seeing the geometry.

export type VisitedMapVariant = "visited" | "lived" | "wishlist" | "current"

// ISO 3166-1 alpha-2 code → [world-atlas id (null when too small to be drawn),
// name, center lng, center lat]. Covers the 195 countries plus 50 territories.
// Names and centers from Natural Earth (public domain); the centers are label
// points, which sit on the main landmass (unlike centroids).
// prettier-ignore
const countryData = {
  AD: [null, "Andorra", 1.54, 42.55],
  AE: ["784", "United Arab Emirates", 54.55, 23.47],
  AF: ["004", "Afghanistan", 66.5, 34.16],
  AG: [null, "Antigua and Barbuda", -61.79, 17.35],
  AI: [null, "Anguilla", -63.03, 18.24],
  AL: ["008", "Albania", 20.11, 40.65],
  AM: ["051", "Armenia", 44.8, 40.46],
  AO: ["024", "Angola", 17.98, -12.18],
  AR: ["032", "Argentina", -64.17, -33.5],
  AS: [null, "American Samoa", -170.75, -14.33],
  AT: ["040", "Austria", 14.13, 47.52],
  AU: ["036", "Australia", 134.05, -24.13],
  AW: [null, "Aruba", -69.97, 12.52],
  AX: [null, "Åland", 19.87, 60.16],
  AZ: ["031", "Azerbaijan", 47.21, 40.4],
  BA: ["070", "Bosnia and Herzegovina", 18.07, 44.09],
  BB: [null, "Barbados", -59.57, 13.16],
  BD: ["050", "Bangladesh", 89.68, 24.21],
  BE: ["056", "Belgium", 4.8, 50.79],
  BF: ["854", "Burkina Faso", -1.36, 12.67],
  BG: ["100", "Bulgaria", 25.16, 42.51],
  BH: [null, "Bahrain", 50.55, 26.06],
  BI: ["108", "Burundi", 29.92, -3.33],
  BJ: ["204", "Benin", 2.35, 10.32],
  BL: [null, "Saint Barthélemy", -62.83, 17.9],
  BM: [null, "Bermuda", -64.76, 32.3],
  BN: ["096", "Brunei", 114.55, 4.45],
  BO: ["068", "Bolivia", -64.59, -16.67],
  BQ: [null, "Caribbean Netherlands", -63.13, 17.54],
  BR: ["076", "Brazil", -49.56, -12.1],
  BS: ["044", "Bahamas", -77.15, 26.4],
  BT: ["064", "Bhutan", 90.04, 27.54],
  BW: ["072", "Botswana", 24.18, -22.1],
  BY: ["112", "Belarus", 28.42, 53.82],
  BZ: ["084", "Belize", -88.71, 17.2],
  CA: ["124", "Canada", -101.91, 60.32],
  CC: [null, "Cocos", 96.83, -12.16],
  CD: ["180", "DR Congo", 23.46, -1.86],
  CF: ["140", "Central African Republic", 20.91, 6.99],
  CG: ["178", "Congo", 15.9, 0.14],
  CH: ["756", "Switzerland", 7.46, 46.72],
  CI: ["384", "Ivory Coast", -5.57, 7.49],
  CK: [null, "Cook Islands", -159.79, -21.22],
  CL: ["152", "Chile", -72.32, -38.15],
  CM: ["120", "Cameroon", 12.47, 4.59],
  CN: ["156", "China", 106.34, 32.5],
  CO: ["170", "Colombia", -73.17, 3.37],
  CR: ["188", "Costa Rica", -84.08, 10.07],
  CU: ["192", "Cuba", -77.98, 21.33],
  CV: [null, "Cape Verde", -23.64, 15.07],
  CW: [null, "Curaçao", -68.92, 12.15],
  CX: [null, "Christmas Island", 105.67, -10.49],
  CY: ["196", "Cyprus", 33.08, 34.91],
  CZ: ["203", "Czechia", 15.38, 49.88],
  DE: ["276", "Germany", 9.68, 50.96],
  DJ: ["262", "Djibouti", 42.5, 11.98],
  DK: ["208", "Denmark", 9.02, 55.97],
  DM: [null, "Dominica", -61.34, 15.46],
  DO: ["214", "Dominican Republic", -70.65, 19.1],
  DZ: ["012", "Algeria", 2.81, 27.4],
  EC: ["218", "Ecuador", -78.19, -1.26],
  EE: ["233", "Estonia", 25.87, 58.72],
  EG: ["818", "Egypt", 29.45, 26.19],
  EH: ["732", "Western Sahara", -12.63, 23.97],
  ER: ["232", "Eritrea", 38.29, 15.79],
  ES: ["724", "Spain", -3.46, 40.09],
  ET: ["231", "Ethiopia", 39.09, 8.03],
  FI: ["246", "Finland", 27.28, 63.25],
  FJ: ["242", "Fiji", 177.98, -17.83],
  FM: [null, "Micronesia", 158.23, 6.89],
  FO: [null, "Faroe Islands", -7.06, 62.19],
  FR: ["250", "France", 2.55, 46.7],
  GA: ["266", "Gabon", 11.84, -0.44],
  GB: ["826", "United Kingdom", -2.12, 54.4],
  GD: [null, "Grenada", -61.68, 12.11],
  GE: ["268", "Georgia", 43.74, 41.87],
  GF: [null, "French Guiana", -53.07, 4],
  GG: [null, "Guernsey", -2.56, 49.46],
  GH: ["288", "Ghana", -1.04, 7.72],
  GI: [null, "Gibraltar", -5.35, 36.13],
  GL: ["304", "Greenland", -39.34, 74.32],
  GM: ["270", "Gambia", -15, 13.64],
  GN: ["324", "Guinea", -10.02, 10.62],
  GP: [null, "Guadeloupe", -61.43, 16.3],
  GQ: ["226", "Equatorial Guinea", 10.34, 1.61],
  GR: ["300", "Greece", 21.73, 39.49],
  GS: [null, "South Georgia", -31.06, -55.68],
  GT: ["320", "Guatemala", -90.5, 14.98],
  GU: [null, "Guam", 144.7, 13.35],
  GW: ["624", "Guinea-Bissau", -14.52, 12.16],
  GY: ["328", "Guyana", -58.94, 5.12],
  HK: [null, "Hong Kong", 114.1, 22.45],
  HN: ["340", "Honduras", -86.89, 14.79],
  HR: ["191", "Croatia", 16.37, 45.81],
  HT: ["332", "Haiti", -72.22, 19.26],
  HU: ["348", "Hungary", 19.45, 47.09],
  ID: ["360", "Indonesia", 101.89, -0.95],
  IE: ["372", "Ireland", -7.8, 53.08],
  IL: ["376", "Israel", 34.85, 30.91],
  IM: [null, "Isle of Man", -4.53, 54.22],
  IN: ["356", "India", 79.36, 22.69],
  IO: [null, "British Indian Ocean Territory", 71.35, -6.19],
  IQ: ["368", "Iraq", 43.26, 33.09],
  IR: ["364", "Iran", 54.93, 32.17],
  IS: ["352", "Iceland", -18.67, 64.78],
  IT: ["380", "Italy", 11.08, 44.73],
  JE: [null, "Jersey", -2.09, 49.22],
  JM: ["388", "Jamaica", -77.32, 18.14],
  JO: ["400", "Jordan", 36.38, 30.81],
  JP: ["392", "Japan", 138.44, 36.14],
  KE: ["404", "Kenya", 37.91, 0.55],
  KG: ["417", "Kyrgyzstan", 74.53, 41.67],
  KH: ["116", "Cambodia", 104.5, 12.65],
  KI: [null, "Kiribati", -157.38, 1.82],
  KM: [null, "Comoros", 43.32, -11.73],
  KN: [null, "Saint Kitts and Nevis", -62.76, 17.34],
  KP: ["408", "North Korea", 126.44, 39.89],
  KR: ["410", "South Korea", 128.13, 36.38],
  KW: ["414", "Kuwait", 47.31, 29.41],
  KY: [null, "Cayman Islands", -81.24, 19.32],
  KZ: ["398", "Kazakhstan", 68.69, 49.05],
  LA: ["418", "Laos", 102.53, 19.43],
  LB: ["422", "Lebanon", 35.99, 34.13],
  LC: [null, "Saint Lucia", -60.98, 13.89],
  LI: [null, "Liechtenstein", 9.56, 47.11],
  LK: ["144", "Sri Lanka", 80.7, 7.58],
  LR: ["430", "Liberia", -9.46, 6.45],
  LS: ["426", "Lesotho", 28.25, -29.48],
  LT: ["440", "Lithuania", 24.09, 55.1],
  LU: ["442", "Luxembourg", 6.08, 49.73],
  LV: ["428", "Latvia", 25.46, 57.07],
  LY: ["434", "Libya", 18.01, 26.64],
  MA: ["504", "Morocco", -7.19, 31.65],
  MC: [null, "Monaco", 7.4, 43.74],
  MD: ["498", "Moldova", 28.49, 47.43],
  ME: ["499", "Montenegro", 19.14, 42.8],
  MF: [null, "Saint Martin", -63.05, 18.08],
  MG: ["450", "Madagascar", 46.7, -18.63],
  MH: [null, "Marshall Islands", 171.19, 7.08],
  MK: ["807", "North Macedonia", 21.56, 41.56],
  ML: ["466", "Mali", -2.04, 18.69],
  MM: ["104", "Myanmar", 95.8, 21.57],
  MN: ["496", "Mongolia", 104.15, 46],
  MO: [null, "Macau", 113.56, 22.13],
  MP: [null, "Northern Mariana Islands", 145.73, 15.19],
  MQ: [null, "Martinique", -61.06, 14.71],
  MR: ["478", "Mauritania", -9.74, 19.59],
  MS: [null, "Montserrat", -62.19, 16.74],
  MT: [null, "Malta", 14.43, 35.89],
  MU: [null, "Mauritius", 57.57, -20.3],
  MV: [null, "Maldives", 73.51, 4.17],
  MW: ["454", "Malawi", 33.61, -13.39],
  MX: ["484", "Mexico", -102.29, 23.92],
  MY: ["458", "Malaysia", 113.84, 2.53],
  MZ: ["508", "Mozambique", 37.84, -13.94],
  NA: ["516", "Namibia", 17.11, -20.58],
  NC: ["540", "New Caledonia", 165.08, -21.06],
  NE: ["562", "Niger", 9.5, 17.45],
  NF: [null, "Norfolk Island", 167.95, -29.03],
  NG: ["566", "Nigeria", 7.5, 9.44],
  NI: ["558", "Nicaragua", -85.07, 12.67],
  NL: ["528", "Netherlands", 5.61, 52.42],
  NO: ["578", "Norway", 9.68, 61.36],
  NP: ["524", "Nepal", 83.64, 28.3],
  NR: [null, "Nauru", 166.93, -0.52],
  NU: [null, "Niue", -169.86, -19.05],
  NZ: ["554", "New Zealand", 175.9, -39],
  OM: ["512", "Oman", 57.34, 22.12],
  PA: ["591", "Panama", -80.35, 8.72],
  PE: ["604", "Peru", -72.9, -12.98],
  PF: [null, "French Polynesia", -149.46, -17.63],
  PG: ["598", "Papua New Guinea", 143.91, -5.7],
  PH: ["608", "Philippines", 122.47, 11.2],
  PK: ["586", "Pakistan", 68.55, 29.33],
  PL: ["616", "Poland", 19.49, 51.99],
  PM: [null, "Saint Pierre and Miquelon", -56.33, 47.04],
  PN: [null, "Pitcairn Islands", -128.32, -24.36],
  PR: ["630", "Puerto Rico", -66.48, 18.23],
  PS: ["275", "Palestine", 35.29, 32.05],
  PT: ["620", "Portugal", -8.27, 39.61],
  PW: [null, "Palau", 134.58, 7.52],
  PY: ["600", "Paraguay", -60.15, -21.67],
  QA: ["634", "Qatar", 51.14, 25.24],
  RE: [null, "Réunion", 55.54, -21.11],
  RO: ["642", "Romania", 24.97, 45.73],
  RS: ["688", "Serbia", 20.79, 44.19],
  RU: ["643", "Russia", 44.69, 58.25],
  RW: ["646", "Rwanda", 30.1, -1.9],
  SA: ["682", "Saudi Arabia", 44.7, 23.81],
  SB: ["090", "Solomon Islands", 159.17, -8.03],
  SC: [null, "Seychelles", 55.48, -4.68],
  SD: ["729", "Sudan", 29.26, 16.33],
  SE: ["752", "Sweden", 19.02, 65.86],
  SG: [null, "Singapore", 103.82, 1.37],
  SH: [null, "Saint Helena", -5.71, -15.95],
  SI: ["705", "Slovenia", 14.92, 46.06],
  SJ: [null, "Svalbard", 18.08, 78.78],
  SK: ["703", "Slovakia", 19.05, 48.73],
  SL: ["694", "Sierra Leone", -11.76, 8.62],
  SM: [null, "San Marino", 12.44, 43.93],
  SN: ["686", "Senegal", -14.78, 15.14],
  SO: ["706", "Somalia", 45.19, 3.57],
  SR: ["740", "Suriname", -55.91, 4.14],
  SS: ["728", "South Sudan", 30.39, 7.23],
  ST: [null, "São Tomé and Príncipe", 7.02, 0.97],
  SV: ["222", "El Salvador", -88.89, 13.69],
  SX: [null, "Sint Maarten", -63.07, 18.04],
  SY: ["760", "Syria", 38.28, 35.01],
  SZ: ["748", "Eswatini", 31.47, -26.53],
  TC: [null, "Turks and Caicos Islands", -71.75, 21.82],
  TD: ["148", "Chad", 18.65, 15.14],
  TF: ["260", "French Southern and Antarctic Lands", 69.12, -49.3],
  TG: ["768", "Togo", 1.06, 8.81],
  TH: ["764", "Thailand", 101.07, 15.46],
  TJ: ["762", "Tajikistan", 72.59, 38.2],
  TK: [null, "Tokelau", -172.49, -8.56],
  TL: ["626", "Timor-Leste", 125.85, -8.8],
  TM: ["795", "Turkmenistan", 58.68, 39.86],
  TN: ["788", "Tunisia", 9.01, 33.69],
  TO: [null, "Tonga", -175.16, -21.21],
  TR: ["792", "Türkiye", 34.51, 39.35],
  TT: ["780", "Trinidad and Tobago", -61.25, 10.45],
  TV: [null, "Tuvalu", 179.21, -8.51],
  TW: ["158", "Taiwan", 120.87, 23.65],
  TZ: ["834", "Tanzania", 34.96, -6.05],
  UA: ["804", "Ukraine", 32.14, 49.72],
  UG: ["800", "Uganda", 32.95, 1.97],
  US: ["840", "United States", -97.48, 39.54],
  UY: ["858", "Uruguay", -55.97, -32.96],
  UZ: ["860", "Uzbekistan", 64.01, 41.69],
  VA: [null, "Vatican City", 12.45, 41.9],
  VC: [null, "Saint Vincent and the Grenadines", -61.34, 13.09],
  VE: ["862", "Venezuela", -64.6, 7.18],
  VG: [null, "British Virgin Islands", -64.64, 18.43],
  VI: [null, "United States Virgin Islands", -64.78, 17.75],
  VN: ["704", "Vietnam", 105.39, 21.72],
  VU: ["548", "Vanuatu", 166.91, -15.37],
  WF: [null, "Wallis and Futuna", -178.14, -14.29],
  WS: [null, "Samoa", -172.44, -13.64],
  XK: [null, "Kosovo", 20.86, 42.59],
  YE: ["887", "Yemen", 45.87, 15.33],
  YT: [null, "Mayotte", 45.15, -12.77],
  ZA: ["710", "South Africa", 23.67, -29.71],
  ZM: ["894", "Zambia", 26.4, -14.66],
  ZW: ["716", "Zimbabwe", 29.93, -18.91],
} as const satisfies Record<
  string,
  readonly [id: string | null, name: string, lng: number, lat: number]
>

/**
 * ISO 3166-1 alpha-2 code of one of the 195 countries or 50 territories (e.g.
 * `"AR"`, `"CW"`; `"XK"` for Kosovo). Every code gets a pin at its center, but
 * only the ones drawn at this map's 1:110m resolution can be highlighted:
 * small countries and islands (Singapore, Malta, Curaçao…) show just the pin.
 */
export type VisitedMapCountryCode = keyof typeof countryData

// Territories, Kosovo, Taiwan and Western Sahara: not among the 195 countries
// counted in stats (the 193 UN member states plus the two observer states,
// Vatican and Palestine), though the ones drawn on the map can be highlighted.
// prettier-ignore
const uncounted = new Set<string>([
  "AI", "AS", "AW", "AX", "BL", "BM", "BQ", "CC", "CK", "CW", "CX", "EH",
  "FO", "GF", "GG", "GI", "GL", "GP", "GS", "GU", "HK", "IM", "IO", "JE", "KY",
  "MF", "MO", "MP", "MQ", "MS", "NC", "NF", "NU", "PF", "PM", "PN", "PR", "RE",
  "SH", "SJ", "SX", "TC", "TF", "TK", "TW", "VG", "VI", "WF", "XK", "YT",
])

export type VisitedMapPlace = {
  name: string
  /**
   * Coordinates in **[longitude, latitude]** order (GeoJSON / d3 convention).
   * Note that Google Maps copies them as "lat, lng", so swap them:
   * Buenos Aires is `[-58.38, -34.6]`, not `[-34.6, -58.38]`.
   */
  coords: [lng: number, lat: number]
  /** Country the place is in (e.g. `"ES"`); it's highlighted with the place's variant. */
  country?: VisitedMapCountryCode
  /** Defaults to "visited". */
  variant?: VisitedMapVariant
}

/**
 * Countries by status, as ISO 3166-1 alpha-2 codes. Each one is highlighted
 * and gets a pin at its center. If a country shows up more than once (here or
 * through `places`), the strongest status wins: current > lived > visited >
 * wishlist.
 *
 * @example { current: "AR", lived: ["IT"], visited: ["BR", "JP"], wishlist: ["FR"] }
 */
export type VisitedMapCountries = {
  current?: VisitedMapCountryCode
  lived?: VisitedMapCountryCode[]
  visited?: VisitedMapCountryCode[]
  wishlist?: VisitedMapCountryCode[]
}

export type VisitedMapProps = {
  countries?: VisitedMapCountries
  /** Cities or any other point, e.g. Barcelona inside Spain. */
  places?: VisitedMapPlace[]
  /** Show a pin at the center of each country in `countries`. Defaults to true. */
  countryPins?: boolean
  /**
   * Hide how much of the world you've seen (see `getVisitedStats`), shown by
   * default in the bottom-left corner: a card on wide maps, a pill that
   * expands on tap on narrow ones.
   */
  hideStats?: boolean
  /** Hide the legend under the map, which lists the statuses in use. */
  hideLegend?: boolean
  /**
   * Let people zoom and pan the map: buttons, ⌘/Ctrl + scroll, pinch and
   * drag. Adds a small client component; without it the map ships no
   * JavaScript.
   */
  zoomable?: boolean
  /**
   * Start zoomed in on a country, e.g. `"AR"`. Frames its main landmass
   * (France without French Guiana, the US without Alaska). With `zoomable`,
   * people can zoom out from there; without it, the map stays cropped.
   */
  focus?: VisitedMapCountryCode
  /** Extra classes for the root element: the map card and its legend. */
  className?: string
}

const WIDTH = 960
const HEIGHT = 560
const PADDING = 8
const ANTARCTICA_ID = "010"

const rank: Record<VisitedMapVariant, number> = {
  wishlist: 0,
  visited: 1,
  lived: 2,
  current: 3,
}

const codeById = new Map<string, string>([
  ...Object.entries(countryData).flatMap(([code, [id]]) =>
    id ? [[id, code] as const] : [],
  ),
  // The Malvinas Islands are shown as part of Argentina.
  ["238", "AR"],
])

const topology = worldAtlas as unknown as Parameters<typeof feature>[0]
const { features } = feature(
  topology,
  topology.objects.countries as Parameters<typeof feature>[1] & {
    type: "GeometryCollection"
  },
)
const world = {
  type: "FeatureCollection" as const,
  features: features.filter((country) => country.id !== ANTARCTICA_ID),
}

const projection = geoMercator().fitSize([WIDTH, HEIGHT], world)
// One decimal is plenty (0.1 of a 960-wide viewBox, still sub-pixel at the
// maximum zoom) and makes the markup about a quarter smaller than d3's default 3.
const path = geoPath(projection).digits(1)

type CountryFeature = (typeof world.features)[number]

// Kosovo has no ISO numeric id in world-atlas; "XK" is its common code.
function codeOf(country: CountryFeature) {
  if (country.id !== undefined) return codeById.get(String(country.id))
  return country.properties?.name === "Kosovo" ? "XK" : undefined
}

const countryPaths = world.features.map((country, index) => ({
  key: country.id ?? index,
  code: codeOf(country),
  d: path(country) ?? "",
}))

// Crop the viewBox to the land bounds so there is no empty band above/below.
const [[x0, y0], [x1, y1]] = path.bounds(world)
const viewBoxX = Math.floor(x0 - PADDING)
const viewBoxY = Math.floor(y0 - PADDING)
const viewBoxWidth = Math.ceil(x1 - x0 + PADDING * 2)
const viewBoxHeight = Math.ceil(y1 - y0 + PADDING * 2)
const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`

// Matches visited-map-zoom.tsx (a client module, so its value can't be
// imported here).
const MAX_ZOOM = 6
// Share of the map around the focused country, so it isn't edge to edge.
const FOCUS_FILL = 0.7
// Islands and territories smaller than this share of a country's largest
// landmass are left out of its frame (Alaska is ~21% of the contiguous US,
// French Guiana ~15% of France; Hokkaido is ~36% of Honshu).
const MAIN_LAND = 0.25

type Polygon = GeoJSON.Polygon["coordinates"]

function polygonsOf(code: string): Polygon[] {
  return world.features.flatMap((country) => {
    if (codeOf(country) !== code) return []
    const { geometry } = country
    if (geometry.type === "Polygon") return [geometry.coordinates]
    if (geometry.type === "MultiPolygon") return geometry.coordinates
    return []
  })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Initial zoom that frames a country: `k` is the scale and `x`/`y` the
// translation as fractions of the map's size (see visited-map-zoom.tsx).
function focusView(code: string): VisitedMapView | undefined {
  const key = code.toUpperCase()
  const polygons = polygonsOf(key).map((coordinates) => ({
    type: "Polygon" as const,
    coordinates,
  }))

  let bounds: [[number, number], [number, number]]
  if (polygons.length) {
    const areas = polygons.map((polygon) => geoArea(polygon))
    const largest = Math.max(...areas)
    bounds = path.bounds({
      type: "MultiPolygon",
      coordinates: polygons
        .filter((_, index) => areas[index] >= largest * MAIN_LAND)
        .map((polygon) => polygon.coordinates),
    })
  } else {
    // Too small to be drawn at this scale (Singapore, Malta…): zoom all the
    // way in on its center.
    const data = countryData[key as VisitedMapCountryCode]
    const point = data && projection([data[2], data[3]])
    if (!point) return undefined
    bounds = [point, point]
  }

  const [[bx0, by0], [bx1, by1]] = bounds
  const width = (bx1 - bx0) / viewBoxWidth
  const height = (by1 - by0) / viewBoxHeight
  const k = clamp(FOCUS_FILL / Math.max(width, height, 1e-6), 1, MAX_ZOOM)
  const centerX = ((bx0 + bx1) / 2 - viewBoxX) / viewBoxWidth
  const centerY = ((by0 + by1) / 2 - viewBoxY) / viewBoxHeight
  return {
    k,
    x: clamp(0.5 - centerX * k, 1 - k, 0),
    y: clamp(0.5 - centerY * k, 1 - k, 0),
  }
}

const pinStyles: Record<VisitedMapVariant, string> = {
  visited: "fill-sky-500 stroke-sky-700 dark:fill-sky-400 dark:stroke-sky-200",
  lived:
    "fill-emerald-500 stroke-emerald-700 dark:fill-emerald-400 dark:stroke-emerald-200",
  wishlist:
    "fill-amber-400/25 stroke-amber-500 dark:fill-amber-300/20 dark:stroke-amber-300",
  current:
    "fill-rose-500 stroke-rose-700 dark:fill-rose-400 dark:stroke-rose-200",
}

/** Every status with its label, in legend order. */
export const visitedMapVariants: {
  variant: VisitedMapVariant
  label: string
}[] = [
  { variant: "visited", label: "Visited" },
  { variant: "lived", label: "Lived" },
  { variant: "wishlist", label: "Wishlist" },
  { variant: "current", label: "Current" },
]

/** A status's pin, drawn like on the map. Handy for your own legend or filters. */
export function VisitedMapSwatch({
  variant,
  className,
}: {
  variant: VisitedMapVariant
  className?: string
}) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className={cn("size-3", className)}>
      <circle
        cx={5}
        cy={5}
        r={4}
        strokeWidth={1.5}
        className={pinStyles[variant]}
      />
    </svg>
  )
}

const countryStyles: Record<VisitedMapVariant, string> = {
  visited: "fill-sky-500/25 dark:fill-sky-400/20",
  lived: "fill-emerald-500/25 dark:fill-emerald-400/20",
  wishlist: "fill-amber-400/25 dark:fill-amber-300/15",
  current: "fill-rose-500/25 dark:fill-rose-400/20",
}

type CountryVariants = Map<string, VisitedMapVariant>

// Keeps the strongest variant per country code.
function addVariant(
  result: CountryVariants,
  code: string,
  variant: VisitedMapVariant,
) {
  const key = code.toUpperCase()
  const existing = result.get(key)
  if (!existing || rank[variant] > rank[existing]) result.set(key, variant)
}

function fromCountries(countries: VisitedMapCountries = {}): CountryVariants {
  const result: CountryVariants = new Map()
  for (const variant of ["wishlist", "visited", "lived"] as const) {
    for (const code of countries[variant] ?? [])
      addVariant(result, code, variant)
  }
  if (countries.current) addVariant(result, countries.current, "current")
  return result
}

function resolveCountries(
  countries?: VisitedMapCountries,
  places: VisitedMapPlace[] = [],
): CountryVariants {
  const result = fromCountries(countries)
  for (const place of places) {
    if (place.country)
      addVariant(result, place.country, place.variant ?? "visited")
  }
  return result
}

type Pin = {
  key: string
  name: string
  variant: VisitedMapVariant
  coords: [number, number]
}

function projectPins(pins: Pin[]) {
  // SVG has no z-index: put "current" last so it's never covered.
  const sorted = [...pins].sort(
    (a, b) => Number(a.variant === "current") - Number(b.variant === "current"),
  )

  return sorted.flatMap((pin) => {
    const point = projection(pin.coords)
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1]))
      return []

    const [cx, cy] = point
    return [
      {
        ...pin,
        cx,
        cy,
        // Position of the dot as a percentage of the rendered map.
        left: ((cx - viewBoxX) / viewBoxWidth) * 100,
        top: ((cy - viewBoxY) / viewBoxHeight) * 100,
      },
    ]
  })
}

export type VisitedMapStats = {
  /** Countries visited, counted once each (wishlist excluded). */
  visited: number
  /** Always 195: UN member states plus the two observer states. */
  total: number
  /** `visited / total` as a percentage, rounded to one decimal. */
  percent: number
}

const TOTAL_COUNTRIES = Object.keys(countryData).length - uncounted.size

/**
 * Share of the world's 195 countries you've visited, from the same props the
 * map takes. Wishlist countries aren't counted, and neither are territories
 * (Greenland, Puerto Rico…), Kosovo or Taiwan, which can still be highlighted.
 */
export function getVisitedStats({
  countries,
  places,
}: Pick<VisitedMapProps, "countries" | "places">): VisitedMapStats {
  const visited = Array.from(resolveCountries(countries, places)).filter(
    ([code, variant]) =>
      variant !== "wishlist" && code in countryData && !uncounted.has(code),
  ).length

  return {
    visited,
    total: TOTAL_COUNTRIES,
    percent: Math.round((visited / TOTAL_COUNTRIES) * 1000) / 10,
  }
}

function StatsBar({ stats }: { stats: VisitedMapStats }) {
  return (
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
  )
}

function StatsCounts({ stats }: { stats: VisitedMapStats }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
        {stats.visited} of {stats.total} countries
      </span>
      <span className="text-muted-foreground">
        {stats.total - stats.visited} left
      </span>
    </div>
  )
}

// Which one shows depends on the map's own width (container queries), not the
// window's, so it also fits a map in a narrow column.
function StatsOverlay({ stats }: { stats: VisitedMapStats }) {
  return (
    <>
      {/* Narrow maps: a pill that expands into the card. A native <details>,
          so it works without JavaScript. */}
      <details className="group/stats absolute bottom-2 left-2 z-20 rounded-full border bg-card/80 shadow-sm backdrop-blur-sm open:w-56 open:rounded-xl @3xl:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 py-1 outline-none select-none group-open/stats:items-baseline group-open/stats:px-3 group-open/stats:pt-2.5 group-open/stats:pb-2 focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold tabular-nums group-open/stats:text-2xl group-open/stats:tracking-tight">
            {stats.percent}%
          </span>
          <span className="hidden text-sm text-muted-foreground group-open/stats:inline">
            of the world
          </span>
          <span className="sr-only group-open/stats:hidden">
            of the world, show details
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="ml-auto size-3.5 self-center text-muted-foreground transition-transform group-open/stats:rotate-180"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </summary>
        <div className="flex flex-col gap-2.5 px-3 pb-3">
          <StatsBar stats={stats} />
          <StatsCounts stats={stats} />
        </div>
      </details>
      {/* Wide maps: the full card. */}
      <div className="absolute bottom-2 left-2 z-20 hidden w-52 flex-col gap-2.5 rounded-xl border bg-card/80 p-3.5 shadow-sm backdrop-blur-sm @3xl:flex">
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {stats.percent}%
          </span>
          <span className="text-sm text-muted-foreground">of the world</span>
        </p>
        <StatsBar stats={stats} />
        <StatsCounts stats={stats} />
      </div>
    </>
  )
}

export function VisitedMap({
  countries,
  places = [],
  countryPins = true,
  hideStats = false,
  hideLegend = false,
  zoomable = false,
  focus,
  className,
}: VisitedMapProps) {
  const highlighted = resolveCountries(countries, places)
  // A country's pin reflects only what `countries` says about it, so a
  // "current" city doesn't also make the country's center pulse.
  const countryPinList: Pin[] = countryPins
    ? Array.from(fromCountries(countries)).flatMap(([code, variant]) => {
        const data = countryData[code as VisitedMapCountryCode]
        if (!data) return []
        const [, name, lng, lat] = data
        return [{ key: `country-${code}`, name, variant, coords: [lng, lat] }]
      })
    : []
  const points = projectPins([
    ...countryPinList,
    ...places.map((place, index) => ({
      key: `place-${index}`,
      name: place.name,
      variant: place.variant ?? "visited",
      coords: place.coords,
    })),
  ])

  const usedVariants = new Set<VisitedMapVariant>([
    ...highlighted.values(),
    ...points.map((point) => point.variant),
  ])
  const legendItems = visitedMapVariants.filter((item) =>
    usedVariants.has(item.variant),
  )

  const initialView = focus ? focusView(focus) : undefined

  // The SVG and its tooltips; with `zoomable` they move and scale together.
  // --visited-map-zoom (set by VisitedMapZoom) keeps pins, tooltips and
  // borders the same size at any zoom.
  const layer = (
    <>
      <svg viewBox={viewBox} className="block h-auto w-full" aria-hidden>
        <g
          className="fill-muted stroke-border [stroke-width:calc(0.5px/var(--visited-map-zoom,1))]"
          strokeWidth={0.5}
        >
          {countryPaths.map(({ key, code, d }) => {
            const variant = code ? highlighted.get(code) : undefined
            return (
              <path
                key={key}
                d={d}
                data-country={code}
                data-variant={variant}
                className={variant ? countryStyles[variant] : undefined}
              />
            )
          })}
        </g>
        {points.map((point) => (
          <g
            key={point.key}
            data-variant={point.variant}
            className={cn(
              "origin-center transform-fill [scale:calc(1/var(--visited-map-zoom,1))]",
              pinStyles[point.variant],
            )}
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
            className="group absolute size-5 -translate-x-1/2 -translate-y-1/2 [scale:calc(1/var(--visited-map-zoom,1))] cursor-pointer rounded-full outline-none hover:z-10 focus:z-10 focus-visible:ring-2 focus-visible:ring-ring"
            style={{ left: `${point.left}%`, top: `${point.top}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus:opacity-100">
              {point.name}
            </span>
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <div
      data-slot="visited-map"
      className={cn("flex flex-col gap-3", className)}
    >
      <div
        data-slot="visited-map-card"
        className="@container rounded-xl border bg-card p-2"
      >
        <div className="relative">
          {zoomable ? (
            <VisitedMapZoom initialView={initialView}>{layer}</VisitedMapZoom>
          ) : initialView ? (
            // Focused but not zoomable: the same transform, applied once on
            // the server, so it still ships no JavaScript.
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="relative origin-top-left"
                style={
                  {
                    transform: `translate(${initialView.x * 100}%, ${initialView.y * 100}%) scale(${initialView.k})`,
                    "--visited-map-zoom": initialView.k,
                  } as React.CSSProperties
                }
              >
                {layer}
              </div>
            </div>
          ) : (
            layer
          )}
          {!hideStats && (
            <StatsOverlay stats={getVisitedStats({ countries, places })} />
          )}
        </div>
      </div>
      {!hideLegend && legendItems.length > 0 && (
        <ul
          aria-label="Legend"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          {legendItems.map((item) => (
            <li key={item.variant} className="flex items-center gap-2">
              <VisitedMapSwatch variant={item.variant} />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
