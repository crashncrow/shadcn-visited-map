import type { Metadata } from "next"

import { CodeBlock } from "@/components/code-block"
import { DocsPage, DocsSection } from "@/components/site/docs-page"
import { PropsTable, type PropRow } from "@/components/site/props-table"

export const metadata: Metadata = {
  title: "API Reference",
  description: "Props, types and helpers of the Visited Map component.",
}

const props: PropRow[] = [
  {
    name: "countries",
    type: "VisitedMapCountries",
    description:
      "Countries by status (ISO 3166-1 alpha-2 codes). Each is highlighted with its status color and gets a pin at its center.",
  },
  {
    name: "places",
    type: "VisitedMapPlace[]",
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
    description: "Extra classes for the card container.",
  },
]

const countriesFields: PropRow[] = [
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

const placeFields: PropRow[] = [
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
    description: 'Pin style. Defaults to "visited". "current" pulses.',
  },
]

const statsFields: PropRow[] = [
  {
    name: "visited",
    type: "number",
    description: "Countries visited, counted once each (wishlist excluded).",
  },
  {
    name: "total",
    type: "number",
    description:
      "Always 195: the UN member states plus the Vatican and Palestine.",
  },
  {
    name: "percent",
    type: "number",
    description: "visited / total as a percentage, rounded to one decimal.",
  },
]

const variants = [
  { variant: "visited", pin: "Sky blue dot", tint: "Light sky" },
  { variant: "lived", pin: "Emerald dot", tint: "Light emerald" },
  { variant: "wishlist", pin: "Hollow amber dot", tint: "Light amber" },
  {
    variant: "current",
    pin: "Rose dot with a pulsing halo, drawn on top",
    tint: "Light rose",
  },
]

const statsCode = `import { getVisitedStats } from "@/components/visited-map"

const { visited, total, percent } = getVisitedStats({ countries, places })
// → { visited: 6, total: 195, percent: 3.1 }`

export default function ApiReferencePage() {
  return (
    <DocsPage
      href="/docs/api"
      title="API Reference"
      description="Props, types and helpers exported by components/visited-map.tsx."
    >
      <DocsSection title="VisitedMap">
        <PropsTable rows={props} showDefault />
        <p className="text-sm text-muted-foreground">
          If a country shows up more than once (in several lists, or through a
          place&apos;s{" "}
          <code className="font-mono text-foreground">country</code>
          ), the strongest status wins: current, then lived, visited and
          wishlist. A country&apos;s center pin only reflects{" "}
          <code className="font-mono text-foreground">countries</code>, so a
          current city doesn&apos;t make its country&apos;s pin pulse.
        </p>
      </DocsSection>

      <DocsSection title="VisitedMapCountries">
        <PropsTable rows={countriesFields} />
      </DocsSection>

      <DocsSection title="VisitedMapPlace">
        <PropsTable rows={placeFields} />
      </DocsSection>

      <DocsSection title="VisitedMapCountryCode">
        <p className="text-muted-foreground">
          An ISO 3166-1 alpha-2 code for one of the 195 countries or 50
          territories (
          <code className="font-mono text-foreground">&quot;XK&quot;</code> for
          Kosovo). Every code gets a pin at its center. The map is drawn at
          1:110m, so small countries and islands (Singapore, Malta, Curaçao…)
          show just the pin. Territories are never counted in the stats, and the
          Malvinas Islands are part of Argentina.
        </p>
      </DocsSection>

      <DocsSection title="Variants">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Variant</th>
                <th className="px-4 py-2 font-medium">Pin</th>
                <th className="px-4 py-2 font-medium">Country tint</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((row) => (
                <tr key={row.variant} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{row.variant}</td>
                  <td className="px-4 py-2">{row.pin}</td>
                  <td className="px-4 py-2">{row.tint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          To change the colors, edit{" "}
          <code className="font-mono text-foreground">pinStyles</code> and{" "}
          <code className="font-mono text-foreground">countryStyles</code> in{" "}
          <code className="font-mono text-foreground">
            components/visited-map.tsx
          </code>{" "}
          after installing.
        </p>
      </DocsSection>

      <DocsSection title="getVisitedStats">
        <p className="text-muted-foreground">
          Takes the same props as the map and returns the share of the
          world&apos;s 195 countries you&apos;ve visited. Small countries that
          aren&apos;t drawn, like Singapore, still count; territories such as
          Greenland or Puerto Rico don&apos;t.
        </p>
        <CodeBlock code={statsCode} />
        <PropsTable rows={statsFields} />
      </DocsSection>
    </DocsPage>
  )
}
