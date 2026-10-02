import Link from "next/link"

import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import { demoCountries, demoPlaces } from "@/lib/demo-places"
import { VisitedMap } from "@/registry/visited-map/visited-map"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28">
      <section className="flex flex-col items-center gap-4 text-center">
        <Logo className="text-2xl sm:text-3xl" />
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          The world you&apos;ve seen, on one map
        </h1>
        <p className="max-w-2xl text-lg text-balance text-muted-foreground">
          A ready-to-use world map component for shadcn/ui. No tiles, no API
          keys. Renders in Server Components.
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
