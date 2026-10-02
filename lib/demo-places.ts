import type {
  VisitedMapCountries,
  VisitedMapPlace,
} from "@/registry/visited-map/visited-map"

export const demoCountries: VisitedMapCountries = {
  current: "AR",
  lived: ["UY", "ES"],
  visited: ["CL", "PE", "MX", "US", "GB", "DE", "IT", "MA", "JP", "TH"],
  wishlist: ["ZA", "KE", "IS", "AU"],
}

// Cities on top of the countries. Coordinates are [lng, lat].
export const demoPlaces: VisitedMapPlace[] = [
  { name: "Barcelona", coords: [2.17, 41.39], country: "ES", variant: "lived" },
  { name: "New York", coords: [-74.01, 40.71], country: "US" },
  { name: "San Francisco", coords: [-122.42, 37.77], country: "US" },
  { name: "Kyoto", coords: [135.77, 35.01], country: "JP" },
]
