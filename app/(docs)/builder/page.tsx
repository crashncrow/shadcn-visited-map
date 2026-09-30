import type { Metadata } from "next"

import { PlacesBuilder } from "@/components/places-builder"
import { countries, flattenRegions, territories } from "@/lib/regions"

export const metadata: Metadata = {
  title: "Places Builder",
  description:
    "Mark the countries and territories you've been to, add your own places, and generate the places for Visited Map.",
}

export default function PlacesPage() {
  return (
    <div className="docs-center flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Places Builder
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Mark the {flattenRegions(countries).length} countries and{" "}
          {flattenRegions(territories).length} territories as visited, lived,
          wishlist or current (each gets a pin at its center), add cities or any
          other place by hand, then copy the generated{" "}
          <code className="font-mono text-foreground">countries</code> and{" "}
          <code className="font-mono text-foreground">places</code> into your
          project. Everything is saved in this browser.
        </p>
      </header>

      <PlacesBuilder />

      <p className="text-xs text-muted-foreground">
        Country centers from{" "}
        <a
          href="https://www.naturalearthdata.com"
          className="underline underline-offset-4"
        >
          Natural Earth
        </a>{" "}
        (public domain). Names from{" "}
        <a
          href="https://github.com/mledoze/countries"
          className="underline underline-offset-4"
        >
          mledoze/countries
        </a>{" "}
        (
        <a
          href="https://opendatacommons.org/licenses/odbl/1-0/"
          className="underline underline-offset-4"
        >
          ODbL
        </a>
        ).
      </p>
    </div>
  )
}
