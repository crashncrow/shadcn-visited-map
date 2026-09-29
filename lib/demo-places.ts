import type { VisitedMapPlace } from "@/registry/visited-map/visited-map"

// Coordinates are [lng, lat].
export const demoPlaces: VisitedMapPlace[] = [
  { name: "Buenos Aires", coords: [-58.38, -34.6], variant: "current" },
  { name: "Montevideo", coords: [-56.16, -34.9], variant: "lived" },
  { name: "Barcelona", coords: [2.17, 41.39], variant: "lived" },
  { name: "Santiago", coords: [-70.67, -33.45] },
  { name: "Lima", coords: [-77.04, -12.05] },
  { name: "Mexico City", coords: [-99.13, 19.43] },
  { name: "New York", coords: [-74.01, 40.71] },
  { name: "San Francisco", coords: [-122.42, 37.77] },
  { name: "London", coords: [-0.13, 51.51] },
  { name: "Berlin", coords: [13.4, 52.52] },
  { name: "Rome", coords: [12.5, 41.9] },
  { name: "Marrakesh", coords: [-7.99, 31.63] },
  { name: "Cape Town", coords: [18.42, -33.92], variant: "wishlist" },
  { name: "Nairobi", coords: [36.82, -1.29], variant: "wishlist" },
  { name: "Tokyo", coords: [139.69, 35.69] },
  { name: "Bangkok", coords: [100.5, 13.76] },
  { name: "Reykjavík", coords: [-21.94, 64.15], variant: "wishlist" },
  { name: "Sydney", coords: [151.21, -33.87], variant: "wishlist" },
]
