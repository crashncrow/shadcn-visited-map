import Link from "next/link"

import { CodeBlock } from "@/components/code-block"
import { InstallTabs } from "@/components/install-tabs"
import { MapCheckIcon } from "@/components/map-check-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { VisitedStatsCard } from "@/components/visited-stats-card"
import { demoCountries, demoPlaces } from "@/lib/demo-places"
import { legend } from "@/lib/legend"
import { getVisitedStats, VisitedMap } from "@/registry/visited-map/visited-map"

const usageImport = `import {
  VisitedMap,
  type VisitedMapCountries,
  type VisitedMapPlace,
} from "@/components/visited-map"`

const usageExample = `const countries: VisitedMapCountries = {
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

const usageStats = `import { getVisitedStats } from "@/components/visited-map"

const { visited, total, percent } = getVisitedStats({ countries, places })
// → { visited: 6, total: 195, percent: 3.1 }`

const stats = getVisitedStats({ countries: demoCountries, places: demoPlaces })

const props = [
  {
    name: "countries",
    type: "VisitedMapCountries",
    default: "—",
    description:
      "Countries by status (ISO 3166-1 alpha-2 codes). Each is highlighted with its status color and gets a pin at its center.",
  },
  {
    name: "places",
    type: "VisitedMapPlace[]",
    default: "—",
    description: "Cities or any other point, e.g. Barcelona inside Spain.",
  },
  {
    name: "countryPins",
    type: "boolean",
    default: "true",
    description: "Show a pin at the center of each country in countries.",
  },
  {
    name: "className",
    type: "string",
    default: "—",
    description: "Extra classes for the card container.",
  },
]

const countriesFields = [
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

const placeFields = [
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
    description: 'Dot color. Defaults to "visited". "current" pulses.',
  },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function PropsTable({
  rows,
  showDefault,
}: {
  rows: { name: string; type: string; default?: string; description: string }[]
  showDefault?: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            {showDefault && <th className="px-4 py-2 font-medium">Default</th>}
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t align-top">
              <td className="px-4 py-2 font-mono text-xs">{row.name}</td>
              <td className="px-4 py-2 font-mono text-xs">{row.type}</td>
              {showDefault && (
                <td className="px-4 py-2 font-mono text-xs">{row.default}</td>
              )}
              <td className="px-4 py-2">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2.5 text-3xl font-semibold tracking-tight">
            <MapCheckIcon className="size-8 shrink-0" />
            Visited Map
          </h1>
          <p className="max-w-xl text-muted-foreground">
            An SVG world map for shadcn/ui that highlights the countries
            you&apos;ve been to, pins cities on top, and counts how much of the
            world you&apos;ve seen. No tiles, no API keys, and it renders in
            Server Components.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-3">
        {/* Stacked above the map on small screens, floating over the ocean on large ones. */}
        <div className="flex flex-col gap-3 lg:relative">
          <VisitedStatsCard
            stats={stats}
            className="lg:absolute lg:bottom-4 lg:left-4 lg:z-10 lg:w-52 lg:p-3.5"
          />
          <VisitedMap countries={demoCountries} places={demoPlaces} />
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {legend.map((item) => (
            <li key={item.variant} className="flex items-center gap-2">
              <span className={`size-3 rounded-full ${item.dot}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <Section title="Installation">
        <InstallTabs />
      </Section>

      <Section title="Usage">
        <CodeBlock code={usageImport} />
        <CodeBlock code={usageExample} />
        <p className="text-sm text-muted-foreground">
          If a country shows up more than once, the strongest status wins:
          current, then lived, visited and wishlist.{" "}
          <Link
            href="/places"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Build your countries and places
          </Link>{" "}
          by clicking instead of typing codes.
        </p>
      </Section>

      <Section title="Stats">
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-foreground">getVisitedStats</code>{" "}
          takes the same props as the map and counts the highlighted countries
          (wishlist excluded) out of 195: the UN member states plus the Vatican
          and Palestine. Small countries that aren&apos;t drawn, like Singapore,
          still count. Territories such as Greenland or Puerto Rico are
          highlighted but not counted.
        </p>
        <CodeBlock code={usageStats} />
      </Section>

      <Section title="Props">
        <PropsTable rows={props} showDefault />
        <h3 className="mt-2 font-medium">VisitedMapCountries</h3>
        <PropsTable rows={countriesFields} />
        <h3 className="mt-2 font-medium">VisitedMapPlace</h3>
        <PropsTable rows={placeFields} />
      </Section>
    </main>
  )
}
