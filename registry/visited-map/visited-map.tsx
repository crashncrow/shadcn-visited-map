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
// name, center lng, center lat, continent]. Covers the 195 countries plus 50
// territories. Names, centers and continents from Natural Earth (public
// domain); the centers are label points, which sit on the main landmass
// (unlike centroids). Continents follow its UN regions, with the Americas
// split in three and Mexico in North America, Cyprus in Europe, and the
// Christmas, Cocos, South Georgia and French Southern islands by geography.
type ContinentCode = "AF" | "AS" | "EU" | "NA" | "CA" | "SA" | "OC" | "AN"

// prettier-ignore
const countryData = {
  AD: [null, "Andorra", 1.54, 42.55, "EU"],
  AE: ["784", "United Arab Emirates", 54.55, 23.47, "AS"],
  AF: ["004", "Afghanistan", 66.5, 34.16, "AS"],
  AG: [null, "Antigua and Barbuda", -61.79, 17.35, "CA"],
  AI: [null, "Anguilla", -63.03, 18.24, "CA"],
  AL: ["008", "Albania", 20.11, 40.65, "EU"],
  AM: ["051", "Armenia", 44.8, 40.46, "AS"],
  AO: ["024", "Angola", 17.98, -12.18, "AF"],
  AR: ["032", "Argentina", -64.17, -33.5, "SA"],
  AS: [null, "American Samoa", -170.75, -14.33, "OC"],
  AT: ["040", "Austria", 14.13, 47.52, "EU"],
  AU: ["036", "Australia", 134.05, -24.13, "OC"],
  AW: [null, "Aruba", -69.97, 12.52, "CA"],
  AX: [null, "Åland", 19.87, 60.16, "EU"],
  AZ: ["031", "Azerbaijan", 47.21, 40.4, "AS"],
  BA: ["070", "Bosnia and Herzegovina", 18.07, 44.09, "EU"],
  BB: [null, "Barbados", -59.57, 13.16, "CA"],
  BD: ["050", "Bangladesh", 89.68, 24.21, "AS"],
  BE: ["056", "Belgium", 4.8, 50.79, "EU"],
  BF: ["854", "Burkina Faso", -1.36, 12.67, "AF"],
  BG: ["100", "Bulgaria", 25.16, 42.51, "EU"],
  BH: [null, "Bahrain", 50.55, 26.06, "AS"],
  BI: ["108", "Burundi", 29.92, -3.33, "AF"],
  BJ: ["204", "Benin", 2.35, 10.32, "AF"],
  BL: [null, "Saint Barthélemy", -62.83, 17.9, "CA"],
  BM: [null, "Bermuda", -64.76, 32.3, "NA"],
  BN: ["096", "Brunei", 114.55, 4.45, "AS"],
  BO: ["068", "Bolivia", -64.59, -16.67, "SA"],
  BQ: [null, "Caribbean Netherlands", -63.13, 17.54, "CA"],
  BR: ["076", "Brazil", -49.56, -12.1, "SA"],
  BS: ["044", "Bahamas", -77.15, 26.4, "CA"],
  BT: ["064", "Bhutan", 90.04, 27.54, "AS"],
  BW: ["072", "Botswana", 24.18, -22.1, "AF"],
  BY: ["112", "Belarus", 28.42, 53.82, "EU"],
  BZ: ["084", "Belize", -88.71, 17.2, "CA"],
  CA: ["124", "Canada", -101.91, 60.32, "NA"],
  CC: [null, "Cocos", 96.83, -12.16, "OC"],
  CD: ["180", "DR Congo", 23.46, -1.86, "AF"],
  CF: ["140", "Central African Republic", 20.91, 6.99, "AF"],
  CG: ["178", "Congo", 15.9, 0.14, "AF"],
  CH: ["756", "Switzerland", 7.46, 46.72, "EU"],
  CI: ["384", "Ivory Coast", -5.57, 7.49, "AF"],
  CK: [null, "Cook Islands", -159.79, -21.22, "OC"],
  CL: ["152", "Chile", -72.32, -38.15, "SA"],
  CM: ["120", "Cameroon", 12.47, 4.59, "AF"],
  CN: ["156", "China", 106.34, 32.5, "AS"],
  CO: ["170", "Colombia", -73.17, 3.37, "SA"],
  CR: ["188", "Costa Rica", -84.08, 10.07, "CA"],
  CU: ["192", "Cuba", -77.98, 21.33, "CA"],
  CV: [null, "Cape Verde", -23.64, 15.07, "AF"],
  CW: [null, "Curaçao", -68.92, 12.15, "CA"],
  CX: [null, "Christmas Island", 105.67, -10.49, "OC"],
  CY: ["196", "Cyprus", 33.08, 34.91, "EU"],
  CZ: ["203", "Czechia", 15.38, 49.88, "EU"],
  DE: ["276", "Germany", 9.68, 50.96, "EU"],
  DJ: ["262", "Djibouti", 42.5, 11.98, "AF"],
  DK: ["208", "Denmark", 9.02, 55.97, "EU"],
  DM: [null, "Dominica", -61.34, 15.46, "CA"],
  DO: ["214", "Dominican Republic", -70.65, 19.1, "CA"],
  DZ: ["012", "Algeria", 2.81, 27.4, "AF"],
  EC: ["218", "Ecuador", -78.19, -1.26, "SA"],
  EE: ["233", "Estonia", 25.87, 58.72, "EU"],
  EG: ["818", "Egypt", 29.45, 26.19, "AF"],
  EH: ["732", "Western Sahara", -12.63, 23.97, "AF"],
  ER: ["232", "Eritrea", 38.29, 15.79, "AF"],
  ES: ["724", "Spain", -3.46, 40.09, "EU"],
  ET: ["231", "Ethiopia", 39.09, 8.03, "AF"],
  FI: ["246", "Finland", 27.28, 63.25, "EU"],
  FJ: ["242", "Fiji", 177.98, -17.83, "OC"],
  FM: [null, "Micronesia", 158.23, 6.89, "OC"],
  FO: [null, "Faroe Islands", -7.06, 62.19, "EU"],
  FR: ["250", "France", 2.55, 46.7, "EU"],
  GA: ["266", "Gabon", 11.84, -0.44, "AF"],
  GB: ["826", "United Kingdom", -2.12, 54.4, "EU"],
  GD: [null, "Grenada", -61.68, 12.11, "CA"],
  GE: ["268", "Georgia", 43.74, 41.87, "AS"],
  GF: [null, "French Guiana", -53.07, 4, "SA"],
  GG: [null, "Guernsey", -2.56, 49.46, "EU"],
  GH: ["288", "Ghana", -1.04, 7.72, "AF"],
  GI: [null, "Gibraltar", -5.35, 36.13, "EU"],
  GL: ["304", "Greenland", -39.34, 74.32, "NA"],
  GM: ["270", "Gambia", -15, 13.64, "AF"],
  GN: ["324", "Guinea", -10.02, 10.62, "AF"],
  GP: [null, "Guadeloupe", -61.43, 16.3, "CA"],
  GQ: ["226", "Equatorial Guinea", 10.34, 1.61, "AF"],
  GR: ["300", "Greece", 21.73, 39.49, "EU"],
  GS: [null, "South Georgia", -31.06, -55.68, "AN"],
  GT: ["320", "Guatemala", -90.5, 14.98, "CA"],
  GU: [null, "Guam", 144.7, 13.35, "OC"],
  GW: ["624", "Guinea-Bissau", -14.52, 12.16, "AF"],
  GY: ["328", "Guyana", -58.94, 5.12, "SA"],
  HK: [null, "Hong Kong", 114.1, 22.45, "AS"],
  HN: ["340", "Honduras", -86.89, 14.79, "CA"],
  HR: ["191", "Croatia", 16.37, 45.81, "EU"],
  HT: ["332", "Haiti", -72.22, 19.26, "CA"],
  HU: ["348", "Hungary", 19.45, 47.09, "EU"],
  ID: ["360", "Indonesia", 101.89, -0.95, "AS"],
  IE: ["372", "Ireland", -7.8, 53.08, "EU"],
  IL: ["376", "Israel", 34.85, 30.91, "AS"],
  IM: [null, "Isle of Man", -4.53, 54.22, "EU"],
  IN: ["356", "India", 79.36, 22.69, "AS"],
  IO: [null, "British Indian Ocean Territory", 71.35, -6.19, "AF"],
  IQ: ["368", "Iraq", 43.26, 33.09, "AS"],
  IR: ["364", "Iran", 54.93, 32.17, "AS"],
  IS: ["352", "Iceland", -18.67, 64.78, "EU"],
  IT: ["380", "Italy", 11.08, 44.73, "EU"],
  JE: [null, "Jersey", -2.09, 49.22, "EU"],
  JM: ["388", "Jamaica", -77.32, 18.14, "CA"],
  JO: ["400", "Jordan", 36.38, 30.81, "AS"],
  JP: ["392", "Japan", 138.44, 36.14, "AS"],
  KE: ["404", "Kenya", 37.91, 0.55, "AF"],
  KG: ["417", "Kyrgyzstan", 74.53, 41.67, "AS"],
  KH: ["116", "Cambodia", 104.5, 12.65, "AS"],
  KI: [null, "Kiribati", -157.38, 1.82, "OC"],
  KM: [null, "Comoros", 43.32, -11.73, "AF"],
  KN: [null, "Saint Kitts and Nevis", -62.76, 17.34, "CA"],
  KP: ["408", "North Korea", 126.44, 39.89, "AS"],
  KR: ["410", "South Korea", 128.13, 36.38, "AS"],
  KW: ["414", "Kuwait", 47.31, 29.41, "AS"],
  KY: [null, "Cayman Islands", -81.24, 19.32, "CA"],
  KZ: ["398", "Kazakhstan", 68.69, 49.05, "AS"],
  LA: ["418", "Laos", 102.53, 19.43, "AS"],
  LB: ["422", "Lebanon", 35.99, 34.13, "AS"],
  LC: [null, "Saint Lucia", -60.98, 13.89, "CA"],
  LI: [null, "Liechtenstein", 9.56, 47.11, "EU"],
  LK: ["144", "Sri Lanka", 80.7, 7.58, "AS"],
  LR: ["430", "Liberia", -9.46, 6.45, "AF"],
  LS: ["426", "Lesotho", 28.25, -29.48, "AF"],
  LT: ["440", "Lithuania", 24.09, 55.1, "EU"],
  LU: ["442", "Luxembourg", 6.08, 49.73, "EU"],
  LV: ["428", "Latvia", 25.46, 57.07, "EU"],
  LY: ["434", "Libya", 18.01, 26.64, "AF"],
  MA: ["504", "Morocco", -7.19, 31.65, "AF"],
  MC: [null, "Monaco", 7.4, 43.74, "EU"],
  MD: ["498", "Moldova", 28.49, 47.43, "EU"],
  ME: ["499", "Montenegro", 19.14, 42.8, "EU"],
  MF: [null, "Saint Martin", -63.05, 18.08, "CA"],
  MG: ["450", "Madagascar", 46.7, -18.63, "AF"],
  MH: [null, "Marshall Islands", 171.19, 7.08, "OC"],
  MK: ["807", "North Macedonia", 21.56, 41.56, "EU"],
  ML: ["466", "Mali", -2.04, 18.69, "AF"],
  MM: ["104", "Myanmar", 95.8, 21.57, "AS"],
  MN: ["496", "Mongolia", 104.15, 46, "AS"],
  MO: [null, "Macau", 113.56, 22.13, "AS"],
  MP: [null, "Northern Mariana Islands", 145.73, 15.19, "OC"],
  MQ: [null, "Martinique", -61.06, 14.71, "CA"],
  MR: ["478", "Mauritania", -9.74, 19.59, "AF"],
  MS: [null, "Montserrat", -62.19, 16.74, "CA"],
  MT: [null, "Malta", 14.43, 35.89, "EU"],
  MU: [null, "Mauritius", 57.57, -20.3, "AF"],
  MV: [null, "Maldives", 73.51, 4.17, "AS"],
  MW: ["454", "Malawi", 33.61, -13.39, "AF"],
  MX: ["484", "Mexico", -102.29, 23.92, "NA"],
  MY: ["458", "Malaysia", 113.84, 2.53, "AS"],
  MZ: ["508", "Mozambique", 37.84, -13.94, "AF"],
  NA: ["516", "Namibia", 17.11, -20.58, "AF"],
  NC: ["540", "New Caledonia", 165.08, -21.06, "OC"],
  NE: ["562", "Niger", 9.5, 17.45, "AF"],
  NF: [null, "Norfolk Island", 167.95, -29.03, "OC"],
  NG: ["566", "Nigeria", 7.5, 9.44, "AF"],
  NI: ["558", "Nicaragua", -85.07, 12.67, "CA"],
  NL: ["528", "Netherlands", 5.61, 52.42, "EU"],
  NO: ["578", "Norway", 9.68, 61.36, "EU"],
  NP: ["524", "Nepal", 83.64, 28.3, "AS"],
  NR: [null, "Nauru", 166.93, -0.52, "OC"],
  NU: [null, "Niue", -169.86, -19.05, "OC"],
  NZ: ["554", "New Zealand", 175.9, -39, "OC"],
  OM: ["512", "Oman", 57.34, 22.12, "AS"],
  PA: ["591", "Panama", -80.35, 8.72, "CA"],
  PE: ["604", "Peru", -72.9, -12.98, "SA"],
  PF: [null, "French Polynesia", -149.46, -17.63, "OC"],
  PG: ["598", "Papua New Guinea", 143.91, -5.7, "OC"],
  PH: ["608", "Philippines", 122.47, 11.2, "AS"],
  PK: ["586", "Pakistan", 68.55, 29.33, "AS"],
  PL: ["616", "Poland", 19.49, 51.99, "EU"],
  PM: [null, "Saint Pierre and Miquelon", -56.33, 47.04, "NA"],
  PN: [null, "Pitcairn Islands", -128.32, -24.36, "OC"],
  PR: ["630", "Puerto Rico", -66.48, 18.23, "CA"],
  PS: ["275", "Palestine", 35.29, 32.05, "AS"],
  PT: ["620", "Portugal", -8.27, 39.61, "EU"],
  PW: [null, "Palau", 134.58, 7.52, "OC"],
  PY: ["600", "Paraguay", -60.15, -21.67, "SA"],
  QA: ["634", "Qatar", 51.14, 25.24, "AS"],
  RE: [null, "Réunion", 55.54, -21.11, "AF"],
  RO: ["642", "Romania", 24.97, 45.73, "EU"],
  RS: ["688", "Serbia", 20.79, 44.19, "EU"],
  RU: ["643", "Russia", 44.69, 58.25, "EU"],
  RW: ["646", "Rwanda", 30.1, -1.9, "AF"],
  SA: ["682", "Saudi Arabia", 44.7, 23.81, "AS"],
  SB: ["090", "Solomon Islands", 159.17, -8.03, "OC"],
  SC: [null, "Seychelles", 55.48, -4.68, "AF"],
  SD: ["729", "Sudan", 29.26, 16.33, "AF"],
  SE: ["752", "Sweden", 19.02, 65.86, "EU"],
  SG: [null, "Singapore", 103.82, 1.37, "AS"],
  SH: [null, "Saint Helena", -5.71, -15.95, "AF"],
  SI: ["705", "Slovenia", 14.92, 46.06, "EU"],
  SJ: [null, "Svalbard", 18.08, 78.78, "EU"],
  SK: ["703", "Slovakia", 19.05, 48.73, "EU"],
  SL: ["694", "Sierra Leone", -11.76, 8.62, "AF"],
  SM: [null, "San Marino", 12.44, 43.93, "EU"],
  SN: ["686", "Senegal", -14.78, 15.14, "AF"],
  SO: ["706", "Somalia", 45.19, 3.57, "AF"],
  SR: ["740", "Suriname", -55.91, 4.14, "SA"],
  SS: ["728", "South Sudan", 30.39, 7.23, "AF"],
  ST: [null, "São Tomé and Príncipe", 7.02, 0.97, "AF"],
  SV: ["222", "El Salvador", -88.89, 13.69, "CA"],
  SX: [null, "Sint Maarten", -63.07, 18.04, "CA"],
  SY: ["760", "Syria", 38.28, 35.01, "AS"],
  SZ: ["748", "Eswatini", 31.47, -26.53, "AF"],
  TC: [null, "Turks and Caicos Islands", -71.75, 21.82, "CA"],
  TD: ["148", "Chad", 18.65, 15.14, "AF"],
  TF: ["260", "French Southern and Antarctic Lands", 69.12, -49.3, "AN"],
  TG: ["768", "Togo", 1.06, 8.81, "AF"],
  TH: ["764", "Thailand", 101.07, 15.46, "AS"],
  TJ: ["762", "Tajikistan", 72.59, 38.2, "AS"],
  TK: [null, "Tokelau", -172.49, -8.56, "OC"],
  TL: ["626", "Timor-Leste", 125.85, -8.8, "AS"],
  TM: ["795", "Turkmenistan", 58.68, 39.86, "AS"],
  TN: ["788", "Tunisia", 9.01, 33.69, "AF"],
  TO: [null, "Tonga", -175.16, -21.21, "OC"],
  TR: ["792", "Türkiye", 34.51, 39.35, "AS"],
  TT: ["780", "Trinidad and Tobago", -61.25, 10.45, "CA"],
  TV: [null, "Tuvalu", 179.21, -8.51, "OC"],
  TW: ["158", "Taiwan", 120.87, 23.65, "AS"],
  TZ: ["834", "Tanzania", 34.96, -6.05, "AF"],
  UA: ["804", "Ukraine", 32.14, 49.72, "EU"],
  UG: ["800", "Uganda", 32.95, 1.97, "AF"],
  US: ["840", "United States", -97.48, 39.54, "NA"],
  UY: ["858", "Uruguay", -55.97, -32.96, "SA"],
  UZ: ["860", "Uzbekistan", 64.01, 41.69, "AS"],
  VA: [null, "Vatican City", 12.45, 41.9, "EU"],
  VC: [null, "Saint Vincent and the Grenadines", -61.34, 13.09, "CA"],
  VE: ["862", "Venezuela", -64.6, 7.18, "SA"],
  VG: [null, "British Virgin Islands", -64.64, 18.43, "CA"],
  VI: [null, "United States Virgin Islands", -64.78, 17.75, "CA"],
  VN: ["704", "Vietnam", 105.39, 21.72, "AS"],
  VU: ["548", "Vanuatu", 166.91, -15.37, "OC"],
  WF: [null, "Wallis and Futuna", -178.14, -14.29, "OC"],
  WS: [null, "Samoa", -172.44, -13.64, "OC"],
  XK: [null, "Kosovo", 20.86, 42.59, "EU"],
  YE: ["887", "Yemen", 45.87, 15.33, "AS"],
  YT: [null, "Mayotte", 45.15, -12.77, "AF"],
  ZA: ["710", "South Africa", 23.67, -29.71, "AF"],
  ZM: ["894", "Zambia", 26.4, -14.66, "AF"],
  ZW: ["716", "Zimbabwe", 29.93, -18.91, "AF"],
} as const satisfies Record<
  string,
  readonly [
    id: string | null,
    name: string,
    lng: number,
    lat: number,
    continent: ContinentCode,
  ]
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
   * default in the top-left corner: a chip that expands into the list of
   * places by continent.
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

// Continents in display order.
const continents: [code: ContinentCode, name: string][] = [
  ["AF", "Africa"],
  ["AS", "Asia"],
  ["EU", "Europe"],
  ["NA", "North America"],
  ["CA", "Central America & Caribbean"],
  ["SA", "South America"],
  ["OC", "Oceania"],
  ["AN", "Antarctica"],
]

// Countries that count in the stats, per continent.
const continentTotals = Object.entries(countryData).reduce(
  (totals, [code, data]) => {
    if (!uncounted.has(code)) totals[data[4]] = (totals[data[4]] ?? 0) + 1
    return totals
  },
  {} as Partial<Record<ContinentCode, number>>,
)

type StatsItem = {
  key: string
  name: string
  variant: VisitedMapVariant
  /** Places inside this country. */
  places?: string[]
}

type StatsGroup = {
  name: string
  /** "5 of 45": counted countries visited in this continent. */
  count?: string
  items: StatsItem[]
}

// The highlighted countries by continent, each with its places, and the places
// without a country at the end.
function groupByContinent(
  highlighted: CountryVariants,
  places: VisitedMapPlace[],
): StatsGroup[] {
  const groups: StatsGroup[] = continents.flatMap(([continent, name]) => {
    const items = Array.from(highlighted)
      .flatMap(([code, variant]) => {
        const data = countryData[code as VisitedMapCountryCode]
        if (!data || data[4] !== continent) return []
        return [
          {
            key: code,
            name: data[1] as string,
            variant,
            places: places
              .filter((place) => place.country?.toUpperCase() === code)
              .map((place) => place.name),
          },
        ]
      })
      .sort((a, b) => a.name.localeCompare(b.name))
    if (items.length === 0) return []
    const visited = items.filter(
      (item) => item.variant !== "wishlist" && !uncounted.has(item.key),
    ).length
    return [
      {
        name,
        count: `${visited} of ${continentTotals[continent] ?? 0}`,
        items,
      },
    ]
  })

  const others = places.flatMap((place, index) =>
    place.country
      ? []
      : [
          {
            key: `place-${index}`,
            name: place.name,
            variant: place.variant ?? "visited",
          },
        ],
  )
  if (others.length > 0) groups.push({ name: "Other places", items: others })
  return groups
}

// A ring that fills with the share of the world visited.
function StatsRing({ stats }: { stats: VisitedMapStats }) {
  // Whole numbers fit inside the ring; getVisitedStats keeps the decimal.
  const label =
    stats.visited > 0 && stats.percent < 1 ? "<1" : Math.round(stats.percent)

  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 36 36"
        aria-hidden
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx={18}
          cy={18}
          r={16}
          fill="none"
          strokeWidth={3}
          className="stroke-muted"
        />
        <circle
          cx={18}
          cy={18}
          r={16}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={100}
          // Keep a sliver visible for tiny percentages.
          strokeDasharray={`${stats.visited > 0 ? Math.max(stats.percent, 2) : 0} 100`}
          className="stroke-sky-500 dark:stroke-sky-400"
        />
      </svg>
      <span
        className={cn(
          "font-semibold tabular-nums",
          // "100%" needs a smaller size to clear the ring.
          label === 100 ? "text-[0.5rem]" : "text-[0.625rem]",
        )}
      >
        {label}%
      </span>
    </span>
  )
}

// A chip in the top-left corner (open sea above Alaska on a world map) that
// expands into the list of places. A native <details>, so it works without
// JavaScript. Open, it fills the card on narrow maps (the padding keeps the
// ring in place) and is a strip across the top on wide ones. On narrow maps the closed chip is just the ring (container queries,
// so it depends on the map's width, not the window's).
function StatsOverlay({
  stats,
  groups,
}: {
  stats: VisitedMapStats
  groups: StatsGroup[]
}) {
  return (
    <details className="group/stats absolute top-2 left-2 z-20 max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto rounded-3xl border bg-card/80 shadow-sm backdrop-blur-sm open:top-0 open:left-0 open:size-full open:max-h-full open:max-w-full open:rounded-lg open:border-transparent open:bg-card open:shadow-none @xl:open:top-2 @xl:open:left-2 @xl:open:h-auto @xl:open:max-h-[calc(100%-1rem)] @xl:open:w-[calc(100%-1rem)] @xl:open:max-w-[calc(100%-1rem)] @xl:open:rounded-2xl @xl:open:border-border @xl:open:shadow-sm">
      <summary className="sticky top-0 z-20 flex cursor-pointer list-none items-center gap-2 rounded-3xl border-b border-transparent p-1 outline-none select-none group-open/stats:rounded-none group-open/stats:border-border group-open/stats:bg-card group-open/stats:p-3 @xl:group-open/stats:rounded-t-2xl @xl:group-open/stats:p-1 @xl:group-open/stats:pr-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset @xl:pr-3 [&::-webkit-details-marker]:hidden">
        <StatsRing stats={stats} />
        <span className="hidden flex-col leading-tight group-open/stats:flex @xl:flex">
          <span className="text-sm font-semibold tabular-nums">
            {stats.visited} of {stats.total}
          </span>
          <span className="text-xs text-muted-foreground">
            countries visited
          </span>
        </span>
        <span className="sr-only">Show places by continent</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="ml-auto hidden size-3.5 text-muted-foreground transition-transform group-open/stats:block group-open/stats:rotate-180 @xl:block"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {/* Narrow maps: a list that scrolls, with each continent's header pinned
          under the chip until the next one arrives. Wide maps: as many
          columns as fit, so the panel stays short. */}
      <div className="text-sm @xl:columns-[10rem] @xl:gap-x-6 @xl:p-3">
        {groups.length === 0 && (
          <p className="p-3 text-muted-foreground @xl:p-0">No places yet.</p>
        )}
        {groups.map((group) => (
          <section
            key={group.name}
            className="@xl:mb-3 @xl:break-inside-avoid @xl:last:mb-0"
          >
            <h3 className="sticky top-[61px] z-10 flex items-baseline justify-between gap-3 border-b bg-card px-3 py-2 font-medium @xl:static @xl:border-b-0 @xl:bg-transparent @xl:px-0 @xl:pt-0 @xl:pb-1.5 @xl:text-xs @xl:text-muted-foreground">
              {group.name}
              {group.count && (
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {group.count}
                </span>
              )}
            </h3>
            <ul className="flex flex-col divide-y px-3 @xl:gap-1 @xl:divide-y-0 @xl:px-0">
              {group.items.map((item) => (
                <li key={item.key} className="flex gap-2 py-2 @xl:py-0">
                  <VisitedMapSwatch
                    variant={item.variant}
                    className="mt-1 shrink-0"
                  />
                  <span>
                    {item.name}
                    {item.places && item.places.length > 0 && (
                      <span className="block text-xs text-muted-foreground">
                        {item.places.join(", ")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
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
                className="origin-center stroke-none opacity-75 transform-fill motion-safe:animate-ping"
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
        {/* On narrow maps the card is taller than the map, which is centered
            in it: room for the list of places when the stats chip opens. */}
        <div
          className={cn(
            "relative flex flex-col justify-center",
            !hideStats && "min-h-80 @xl:min-h-0",
          )}
        >
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
            <div className="relative">{layer}</div>
          )}
          {!hideStats && (
            <StatsOverlay
              stats={getVisitedStats({ countries, places })}
              groups={groupByContinent(highlighted, places)}
            />
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
