import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { PlacesBuilder } from "@/components/places-builder"
import { ThemeToggle } from "@/components/theme-toggle"
import { countries, territories } from "@/lib/regions"

export const metadata: Metadata = {
  title: "Places — Visited Map",
  description:
    "Mark the countries and territories you've been to, add your own places, and generate the places for Visited Map.",
}

export default function PlacesPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Visited Map
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Places</h1>
          <p className="max-w-xl text-muted-foreground">
            Mark the {countries.length} countries and {territories.length}{" "}
            territories as visited, lived, wishlist or current (each gets a pin
            at its center), add cities or any other place by hand, then copy the
            generated <code className="font-mono text-foreground">places</code>{" "}
            into your project. Everything is saved in this browser.
          </p>
        </div>
        <ThemeToggle />
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
    </main>
  )
}
