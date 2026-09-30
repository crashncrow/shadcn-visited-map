import type { PropRow } from "@/components/site/props-table"

// Docs content shared by the docs pages and /llms.txt.

export const usageImport = `import {
  VisitedMap,
  type VisitedMapCountries,
  type VisitedMapPlace,
} from "@/components/visited-map"`

export const usageExample = `const countries: VisitedMapCountries = {
  current: "AR",
  lived: ["IT"],
  visited: ["BR", "JP", "US"],
  wishlist: ["AU"],
}

// Cities or any other point. coords are [lng, lat], not [lat, lng]
const places: VisitedMapPlace[] = [
  { name: "Barcelona", coords: [2.17, 41.39], country: "ES" },
]

<VisitedMap countries={countries} places={places} className="max-w-3xl" />`

export const visitedMapProps: PropRow[] = [
  {
    name: "countries",
    type: "VisitedMapCountries",
    description:
      "Countries by status (ISO 3166-1 alpha-2 codes). Each is highlighted with its status color and gets a pin at its center.",
  },
  {
    name: "places",
    type: "VisitedMapPlace[]",
    description: "Cities or any other point, e.g. Barcelona inside Spain.",
  },
  {
    name: "countryPins",
    type: "boolean",
    default: "true",
    description: "Show a pin at the center of each country in countries.",
  },
  {
    name: "hideStats",
    type: "boolean",
    default: "false",
    description:
      "Hide how much of the world you've seen, shown by default in the bottom-left corner: a card on wide maps, a pill that expands on tap on narrow ones.",
  },
  {
    name: "hideLegend",
    type: "boolean",
    default: "false",
    description:
      "Hide the legend under the map, which lists the statuses in use.",
  },
  {
    name: "className",
    type: "string",
    description:
      "Extra classes for the root element (the map card and its legend).",
  },
]

export const countriesFields: PropRow[] = [
  {
    name: "current",
    type: "VisitedMapCountryCode",
    description: "Where you are now. Its pin pulses.",
  },
  {
    name: "lived",
    type: "VisitedMapCountryCode[]",
    description: "Countries you've lived in.",
  },
  {
    name: "visited",
    type: "VisitedMapCountryCode[]",
    description: "Countries you've been to.",
  },
  {
    name: "wishlist",
    type: "VisitedMapCountryCode[]",
    description: "Countries you want to visit. Not counted in the stats.",
  },
]

export const placeFields: PropRow[] = [
  {
    name: "name",
    type: "string",
    description: "Shown in a tooltip on hover, click/tap or keyboard focus.",
  },
  {
    name: "coords",
    type: "[lng, lat]",
    description: "Longitude first, then latitude (GeoJSON order).",
  },
  {
    name: "country",
    type: "VisitedMapCountryCode",
    description:
      'Country the place is in (e.g. "ES"). Highlighted with the place\'s variant.',
  },
  {
    name: "variant",
    type: '"visited" | "lived" | "wishlist" | "current"',
    description: 'Pin style. Defaults to "visited". "current" pulses.',
  },
]

export const statsFields: PropRow[] = [
  {
    name: "visited",
    type: "number",
    description: "Countries visited, counted once each (wishlist excluded).",
  },
  {
    name: "total",
    type: "number",
    description:
      "Always 195: the UN member states plus the Vatican and Palestine.",
  },
  {
    name: "percent",
    type: "number",
    description: "visited / total as a percentage, rounded to one decimal.",
  },
]
