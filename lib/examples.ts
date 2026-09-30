import type { VisitedMapProps } from "@/registry/visited-map/visited-map"

export type Example = {
  /** URL segment under /docs/examples; empty for the first example. */
  slug: string
  title: string
  description: string
  /** Props for the live preview; `code` shows the same map. */
  props: VisitedMapProps
  code: string
  /** Also render the stats card from `getVisitedStats`. */
  withStats?: boolean
}

export const examples: Example[] = [
  {
    slug: "",
    title: "Countries",
    description:
      "Group ISO country codes by status. Each country is highlighted with its status color and gets a pin at its center.",
    props: {
      countries: {
        lived: ["ES"],
        visited: ["AR", "BR", "PE", "US", "FR", "IT", "JP", "TH"],
      },
    },
    code: `import { VisitedMap } from "@/components/visited-map"

export function CountriesMap() {
  return (
    <VisitedMap
      countries={{
        lived: ["ES"],
        visited: ["AR", "BR", "PE", "US", "FR", "IT", "JP", "TH"],
      }}
    />
  )
}`,
  },
  {
    slug: "cities",
    title: "Cities",
    description:
      "Pin any point with places. Coordinates go in [lng, lat] order, and a place's country is highlighted too.",
    props: {
      places: [
        { name: "New York", coords: [-74.01, 40.71], country: "US" },
        { name: "Mexico City", coords: [-99.13, 19.43], country: "MX" },
        { name: "Lisbon", coords: [-9.14, 38.72], country: "PT" },
        {
          name: "Berlin",
          coords: [13.4, 52.52],
          country: "DE",
          variant: "lived",
        },
        { name: "Nairobi", coords: [36.82, -1.29], country: "KE" },
        { name: "Kyoto", coords: [135.77, 35.01], country: "JP" },
      ],
    },
    code: `import { VisitedMap, type VisitedMapPlace } from "@/components/visited-map"

// coords are [lng, lat], not [lat, lng]
const places: VisitedMapPlace[] = [
  { name: "New York", coords: [-74.01, 40.71], country: "US" },
  { name: "Mexico City", coords: [-99.13, 19.43], country: "MX" },
  { name: "Lisbon", coords: [-9.14, 38.72], country: "PT" },
  { name: "Berlin", coords: [13.4, 52.52], country: "DE", variant: "lived" },
  { name: "Nairobi", coords: [36.82, -1.29], country: "KE" },
  { name: "Kyoto", coords: [135.77, 35.01], country: "JP" },
]

export function CitiesMap() {
  return <VisitedMap places={places} />
}`,
  },
  {
    slug: "current",
    title: "Current Location",
    description:
      "Mark where you are now with current. Its pin pulses and is always drawn on top.",
    props: {
      countries: {
        current: "AR",
        lived: ["UY"],
        visited: ["CL", "BR", "PE", "CO", "MX"],
      },
    },
    code: `import { VisitedMap } from "@/components/visited-map"

export function CurrentMap() {
  return (
    <VisitedMap
      countries={{
        current: "AR",
        lived: ["UY"],
        visited: ["CL", "BR", "PE", "CO", "MX"],
      }}
    />
  )
}`,
  },
  {
    slug: "wishlist",
    title: "Wishlist",
    description:
      "Countries you want to visit get a hollow amber pin and a light amber tint. They don't count in the stats.",
    props: {
      countries: {
        visited: ["ES", "IT", "GB", "US"],
        wishlist: ["JP", "AU", "NZ", "IS", "PE", "ZA"],
      },
    },
    code: `import { VisitedMap } from "@/components/visited-map"

export function WishlistMap() {
  return (
    <VisitedMap
      countries={{
        visited: ["ES", "IT", "GB", "US"],
        wishlist: ["JP", "AU", "NZ", "IS", "PE", "ZA"],
      }}
    />
  )
}`,
  },
  {
    slug: "without-pins",
    title: "Without Country Pins",
    description:
      "Set countryPins to false to only highlight the countries. Places still get their pins.",
    props: {
      countries: {
        lived: ["CA"],
        visited: ["US", "MX", "GB", "FR", "DE", "IT", "ES", "CN", "IN"],
      },
      countryPins: false,
    },
    code: `import { VisitedMap } from "@/components/visited-map"

export function WithoutPinsMap() {
  return (
    <VisitedMap
      countries={{
        lived: ["CA"],
        visited: ["US", "MX", "GB", "FR", "DE", "IT", "ES", "CN", "IN"],
      }}
      countryPins={false}
    />
  )
}`,
  },
  {
    slug: "stats",
    title: "Stats",
    description:
      "getVisitedStats takes the same props as the map and counts your countries out of 195.",
    withStats: true,
    props: {
      countries: {
        current: "AR",
        lived: ["ES", "UY"],
        visited: ["CL", "PE", "MX", "US", "GB", "DE", "IT", "MA", "JP", "TH"],
      },
    },
    code: `import {
  getVisitedStats,
  VisitedMap,
  type VisitedMapCountries,
} from "@/components/visited-map"

const countries: VisitedMapCountries = {
  current: "AR",
  lived: ["ES", "UY"],
  visited: ["CL", "PE", "MX", "US", "GB", "DE", "IT", "MA", "JP", "TH"],
}

export function StatsMap() {
  const { visited, total, percent } = getVisitedStats({ countries })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="text-2xl font-semibold text-foreground">{percent}%</span>{" "}
        of the world · {visited} of {total} countries
      </p>
      <VisitedMap countries={countries} />
    </div>
  )
}`,
  },
  {
    slug: "territories",
    title: "Territories & Small Countries",
    description:
      "Every country and territory has a code. Ones too small to be drawn (Singapore, Malta, Curaçao) show just a pin; territories never count in the stats.",
    props: {
      countries: {
        visited: ["SG", "MT", "MC", "CW", "PR", "HK", "GL", "NC"],
      },
    },
    code: `import { VisitedMap } from "@/components/visited-map"

export function TerritoriesMap() {
  return (
    <VisitedMap
      countries={{
        // Countries: Singapore, Malta and Monaco are pins only
        // Territories: Curaçao, Puerto Rico, Hong Kong, Greenland, New Caledonia
        visited: ["SG", "MT", "MC", "CW", "PR", "HK", "GL", "NC"],
      }}
    />
  )
}`,
  },
]

export function exampleHref(example: Example) {
  return example.slug ? `/docs/examples/${example.slug}` : "/docs/examples"
}
