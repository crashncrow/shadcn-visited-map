import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { demoCountries, demoPlaces } from "@/lib/demo-places"
import { legend } from "@/lib/legend"
import { VisitedMap } from "@/registry/visited-map/visited-map"

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
        <section className="flex flex-col items-center gap-4 text-center">
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
          <VisitedMap countries={demoCountries} places={demoPlaces} showStats />
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {legend.map((item) => (
              <li key={item.variant} className="flex items-center gap-2">
                <span className={`size-3 rounded-full ${item.dot}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
