import type { VisitedMapPlace } from "@/registry/visited-map/visited-map"

// Coordinates are [lng, lat]. Wishlist countries are not highlighted.
export const demoPlaces: VisitedMapPlace[] = [
  {
    name: "Buenos Aires",
    coords: [-58.38, -34.6],
    country: "AR",
    variant: "current",
  },
  {
    name: "Montevideo",
    coords: [-56.16, -34.9],
    country: "UY",
    variant: "lived",
  },
  { name: "Barcelona", coords: [2.17, 41.39], country: "ES", variant: "lived" },
  { name: "Santiago", coords: [-70.67, -33.45], country: "CL" },
  { name: "Lima", coords: [-77.04, -12.05], country: "PE" },
  { name: "Mexico City", coords: [-99.13, 19.43], country: "MX" },
  { name: "New York", coords: [-74.01, 40.71], country: "US" },
  { name: "San Francisco", coords: [-122.42, 37.77], country: "US" },
  { name: "London", coords: [-0.13, 51.51], country: "GB" },
  { name: "Berlin", coords: [13.4, 52.52], country: "DE" },
  { name: "Rome", coords: [12.5, 41.9], country: "IT" },
  { name: "Marrakesh", coords: [-7.99, 31.63], country: "MA" },
  {
    name: "Cape Town",
    coords: [18.42, -33.92],
    country: "ZA",
    variant: "wishlist",
  },
  {
    name: "Nairobi",
    coords: [36.82, -1.29],
    country: "KE",
    variant: "wishlist",
  },
  { name: "Tokyo", coords: [139.69, 35.69], country: "JP" },
  { name: "Bangkok", coords: [100.5, 13.76], country: "TH" },
  {
    name: "Reykjavík",
    coords: [-21.94, 64.15],
    country: "IS",
    variant: "wishlist",
  },
  {
    name: "Sydney",
    coords: [151.21, -33.87],
    country: "AU",
    variant: "wishlist",
  },
]
