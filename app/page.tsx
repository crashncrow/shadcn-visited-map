import { CodeBlock } from "@/components/code-block"
import { InstallTabs } from "@/components/install-tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { demoPlaces } from "@/lib/demo-places"
import {
  VisitedMap,
  type VisitedMapVariant,
} from "@/registry/visited-map/visited-map"

const usageImport = `import { VisitedMap, type VisitedMapPlace } from "@/components/visited-map"`

const usageExample = `// coords are [lng, lat] — not [lat, lng]
const places: VisitedMapPlace[] = [
  { name: "Buenos Aires", coords: [-58.38, -34.6], country: "AR", variant: "current" },
  { name: "Barcelona", coords: [2.17, 41.39], country: "ES", variant: "lived" },
  { name: "Tokyo", coords: [139.69, 35.69], country: "JP" },
  // wishlist countries are not highlighted
  { name: "Sydney", coords: [151.21, -33.87], country: "AU", variant: "wishlist" },
]

<VisitedMap
  places={places}
  // extra countries you've been to without pinning a city
  countries={["UY"]}
  className="max-w-3xl"
/>`

const legend: { variant: VisitedMapVariant; label: string; dot: string }[] = [
  { variant: "visited", label: "Visited", dot: "bg-sky-500 dark:bg-sky-400" },
  {
    variant: "lived",
    label: "Lived",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    variant: "wishlist",
    label: "Wishlist",
    dot: "border-2 border-amber-500 bg-amber-400/25 dark:border-amber-300",
  },
  { variant: "current", label: "Current", dot: "bg-rose-500 dark:bg-rose-400" },
]

const props = [
  {
    name: "places",
    type: "VisitedMapPlace[]",
    default: "—",
    description: "Cities to plot on the map.",
  },
  {
    name: "countries",
    type: "VisitedMapCountryCode[]",
    default: "—",
    description:
      'Extra countries to highlight (ISO 3166-1 alpha-2, e.g. "UY"), on top of the ones from places. Very small countries aren\'t drawn at this resolution.',
  },
  {
    name: "className",
    type: "string",
    default: "—",
    description: "Extra classes for the card container.",
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
      'ISO 3166-1 alpha-2 code (e.g. "AR"). Highlights the country unless the place is on the wishlist.',
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
          <h1 className="text-3xl font-semibold tracking-tight">Visited Map</h1>
          <p className="max-w-xl text-muted-foreground">
            An SVG world map for shadcn/ui that plots the cities you&apos;ve
            been to. No tiles, no API keys, and it renders in Server Components.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-3">
        <VisitedMap places={demoPlaces} />
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
      </Section>

      <Section title="Props">
        <PropsTable rows={props} showDefault />
        <h3 className="mt-2 font-medium">VisitedMapPlace</h3>
        <PropsTable rows={placeFields} />
      </Section>
    </main>
  )
}
