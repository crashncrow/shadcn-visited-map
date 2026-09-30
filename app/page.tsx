import Link from "next/link"

import { MapCheckIcon } from "@/components/map-check-icon"
import { Button } from "@/components/ui/button"
import { demoCountries, demoPlaces } from "@/lib/demo-places"
import { VisitedMap } from "@/registry/visited-map/visited-map"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28">
      <section className="flex flex-col items-center gap-4 text-center">
        <MapCheckIcon className="size-12 sm:size-14" />
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A visited map for shadcn/ui
        </h1>
        <p className="max-w-2xl text-lg text-balance text-muted-foreground">
          Highlight the countries you&apos;ve been to, pin cities on top, and
          count how much of the world you&apos;ve seen. No tiles, no API keys,
          and it renders in Server Components.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Button render={<Link href="/docs" />} nativeButton={false}>
            Get Started
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/builder" />}
            nativeButton={false}
          >
            Build your map
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <VisitedMap countries={demoCountries} places={demoPlaces} zoomable />
      </section>
    </main>
  )
}
