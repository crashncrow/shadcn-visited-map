"use client"

import {
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useId, useRef, useState } from "react"

import { CopyButton } from "@/components/copy-button"
import { LiveCodeBlock } from "@/components/live-code-block"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { countryCenters } from "@/lib/country-centers"
import { parseCoordinates } from "@/lib/parse-coordinates"
import {
  addCustomPlace,
  clearPlacesBuilder,
  removeCustomPlace,
  setBuilderOption,
  setCustomVariant,
  type BuilderOptions,
  toggleRegion,
  usePlacesBuilder,
  usePlacesSaveFailed,
} from "@/lib/places-builder"
import {
  countries,
  flattenRegions,
  territories,
  type Continent,
  type Region,
  type RegionGroups,
} from "@/lib/regions"
import { cn } from "@/lib/utils"
import {
  VisitedMap,
  visitedMapVariants,
  VisitedMapSwatch,
  type VisitedMapCountries,
  type VisitedMapCountryCode,
  type VisitedMapPlace,
  type VisitedMapVariant,
} from "@/registry/visited-map/visited-map"

type Tab = "countries" | "territories" | "places"

const byName = (a: Region, b: Region) => a.name.localeCompare(b.name)

const tabs: {
  value: Tab
  label: string
  groups: RegionGroups
  regions: Region[]
}[] = [
  {
    value: "countries",
    label: "Countries",
    groups: countries,
    regions: flattenRegions(countries),
  },
  {
    value: "territories",
    label: "Territories",
    groups: territories,
    regions: flattenRegions(territories),
  },
]
const allRegions = tabs.flatMap((item) => item.regions)

// Options for the country of a custom place. Territories are listed apart
// because they're never counted in the stats.
const countryOptions = [
  { label: "Countries", regions: flattenRegions(countries).sort(byName) },
  {
    label: "Territories (not counted)",
    regions: flattenRegions(territories).sort(byName),
  },
]

function toPlace(
  place: Omit<VisitedMapPlace, "variant">,
  variant: VisitedMapVariant,
): VisitedMapPlace {
  return {
    ...place,
    // "visited" is the default, so it's left out of the generated code.
    ...(variant !== "visited" && { variant }),
  }
}

function toCountries(
  selected: { region: Region; variant: VisitedMapVariant }[],
): VisitedMapCountries {
  const codes = (variant: VisitedMapVariant) =>
    selected.flatMap(({ region, variant: v }) =>
      v === variant ? [region.code] : [],
    )
  const [current] = codes("current")
  const lived = codes("lived")
  const visited = codes("visited")
  const wishlist = codes("wishlist")
  return {
    ...(current && { current }),
    ...(lived.length > 0 && { lived }),
    ...(visited.length > 0 && { visited }),
    ...(wishlist.length > 0 && { wishlist }),
  }
}

// ["AR", "BR", …], wrapped so long lists stay readable.
function formatCodes(codes: string[], indent: string) {
  const items = codes.map((code) => `"${code}"`)
  const inline = `[${items.join(", ")}]`
  if (inline.length <= 60) return inline
  const lines: string[] = []
  let line = ""
  for (const item of items) {
    if (line && line.length + item.length + 2 > 72) {
      lines.push(line)
      line = ""
    }
    line += `${item}, `
  }
  lines.push(line)
  return `[\n${lines.map((l) => `${indent}  ${l.trimEnd()}`).join("\n")}\n${indent}]`
}

function toSnippet(place: VisitedMapPlace) {
  const country = place.country ? `, country: "${place.country}"` : ""
  const variant = place.variant ? `, variant: "${place.variant}"` : ""
  return `{ name: ${JSON.stringify(place.name)}, coords: [${place.coords.join(", ")}]${country}${variant} },`
}

function toCode(
  countries: VisitedMapCountries,
  places: VisitedMapPlace[],
  options: BuilderOptions,
) {
  const hasCountries = Object.keys(countries).length > 0
  const hasPlaces = places.length > 0
  const types = [
    hasCountries && "type VisitedMapCountries",
    hasPlaces && "type VisitedMapPlace",
  ].filter(Boolean)
  const blocks = [
    `import { VisitedMap, ${types.join(", ")} } from "@/components/visited-map"`,
  ]

  if (hasCountries) {
    const lines = [
      countries.current && `  current: "${countries.current}",`,
      ...(["lived", "visited", "wishlist"] as const).map(
        (variant) =>
          countries[variant] &&
          `  ${variant}: ${formatCodes(countries[variant], "  ")},`,
      ),
    ].filter(Boolean)
    blocks.push(
      `const countries: VisitedMapCountries = {\n${lines.join("\n")}\n}`,
    )
  }
  if (hasPlaces) {
    const lines = places.map((place) => `  ${toSnippet(place)}`).join("\n")
    blocks.push(`const places: VisitedMapPlace[] = [\n${lines}\n]`)
  }

  const props = [
    hasCountries && "countries={countries}",
    hasPlaces && "places={places}",
    options.hideStats && "hideStats",
    options.hideLegend && "hideLegend",
    options.zoomable && "zoomable",
  ].filter(Boolean)
  blocks.push(`<VisitedMap ${props.join(" ")} />`)
  return blocks.join("\n\n")
}

// Case- and accent-insensitive: "curacao" matches "Curaçao".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

function CountPill({
  active = false,
  className,
  children,
}: {
  active?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs tabular-nums",
        active
          ? "bg-background text-foreground"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}

// The count inside a region tab. The tab list is muted and the selected tab is
// not, so the pill takes the opposite background to stay visible.
function RegionCount({
  selected,
  children,
}: {
  selected: boolean
  children: React.ReactNode
}) {
  return (
    <CountPill
      className={selected ? "bg-muted text-foreground" : "bg-background"}
    >
      {children}
    </CountPill>
  )
}

function StatusButtons({
  label,
  value,
  onSelect,
}: {
  label: string
  value?: VisitedMapVariant
  onSelect: (variant: VisitedMapVariant) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5">
      {visitedMapVariants.map((item) => {
        const active = value === item.variant
        return (
          <button
            key={item.variant}
            type="button"
            aria-pressed={active}
            aria-label={item.label}
            title={item.label}
            onClick={() => onSelect(item.variant)}
            className={cn(
              "group/status grid size-6 place-items-center rounded-md outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:size-7",
              active && "bg-muted ring-1 ring-border",
            )}
          >
            <VisitedMapSwatch
              variant={item.variant}
              className={cn(
                "transition-opacity",
                !active && "opacity-25 group-hover/status:opacity-70",
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

type FormErrors = { name?: string; coords?: string }

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

function AddPlaceForm() {
  const [name, setName] = useState("")
  const [coords, setCoords] = useState("")
  const [country, setCountry] = useState("")
  const [variant, setVariant] = useState<VisitedMapVariant>("visited")
  const [errors, setErrors] = useState<FormErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const coordsRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const nameErrorId = `${id}-name-error`
  const coordsErrorId = `${id}-coords-error`

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseCoordinates(coords)
    // Validate every field at once so each one shows its own error.
    const nextErrors: FormErrors = {
      ...(!name.trim() && { name: "Give the place a name." }),
      ...(!parsed && {
        coords:
          'Enter coordinates like "41.3874, 2.1686" (lat, lng) or "34.6° S, 58.4° W".',
      }),
    }
    setErrors(nextErrors)
    if (nextErrors.name) return nameRef.current?.focus()
    if (nextErrors.coords || !parsed) return coordsRef.current?.focus()

    addCustomPlace({
      name: name.trim(),
      coords: parsed,
      ...(country && { country: country as VisitedMapCountryCode }),
      variant,
    })
    // Keep country and status for adding several cities in a row, except
    // "current": only one place can be current.
    setName("")
    setCoords("")
    if (variant === "current") setVariant("visited")
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <Input
            ref={nameRef}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            placeholder="Barcelona"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? nameErrorId : undefined}
          />
          <FieldError id={nameErrorId} message={errors.name} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">
            Coordinates{" "}
            <span className="font-normal text-muted-foreground">
              lat, lng, as copied from Google Maps
            </span>
          </span>
          <Input
            ref={coordsRef}
            value={coords}
            onChange={(event) => {
              setCoords(event.target.value)
              setErrors((prev) => ({ ...prev, coords: undefined }))
            }}
            placeholder="41.3874, 2.1686"
            inputMode="decimal"
            aria-invalid={Boolean(errors.coords)}
            aria-describedby={errors.coords ? coordsErrorId : undefined}
          />
          <FieldError id={coordsErrorId} message={errors.coords} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">
            Country{" "}
            <span className="font-normal text-muted-foreground">
              optional: highlights it on the map
            </span>
          </span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">None</option>
            {countryOptions.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name} ({region.code})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Status</span>
          <StatusButtons
            label="Status for the new place"
            value={variant}
            onSelect={setVariant}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">
          <PlusIcon />
          Add place
        </Button>
      </div>
    </form>
  )
}

export function PlacesBuilder() {
  const { regions, custom, options } = usePlacesBuilder()
  const saveFailed = usePlacesSaveFailed()
  const [tab, setTab] = useState<Tab>("countries")
  const [query, setQuery] = useState("")
  const [selectedOnly, setSelectedOnly] = useState(false)
  // Open continents, keyed by tab and continent. All start collapsed.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const selected = allRegions
    .filter((region) => regions[region.code])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((region) => ({ region, variant: regions[region.code] }))
  const mapCountries = toCountries(selected)
  const places = custom.map(({ name, coords, country, variant }) =>
    toPlace({ name, coords, ...(country && { country }) }, variant),
  )
  const total = selected.length + custom.length
  const code = total > 0 ? toCode(mapCountries, places, options) : ""

  const q = normalize(query.trim())
  const matches = (region: Region) =>
    (!selectedOnly || Boolean(regions[region.code])) &&
    (!q || normalize(`${region.name} ${region.code}`).includes(q))
  // The places tab has no regions; the region logic below then runs on
  // countries but isn't rendered.
  const regionTab = tab === "places" ? "countries" : tab
  const active = tabs.find((item) => item.value === regionTab)!
  const other = tabs.find((item) => item.value !== regionTab)!
  const groups = (
    Object.entries(active.groups) as [Continent, Region[]][]
  ).flatMap(([continent, all]) => {
    const groupRows = all.filter(matches)
    if (groupRows.length === 0) return []
    const selected = all.filter((region) => regions[region.code]).length
    return [{ continent, rows: groupRows, total: all.length, selected }]
  })
  const rows = groups.flatMap((group) => group.rows)
  // Searching or showing only selected opens every continent, so all the
  // matches are visible.
  const filtering = Boolean(q) || selectedOnly
  const toggleContinent = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })
  const otherMatches = q ? other.regions.filter(matches).length : 0
  const selectedCount = active.regions.filter(
    (region) => regions[region.code],
  ).length
  const otherSelectedCount = other.regions.filter(
    (region) => regions[region.code],
  ).length
  const switchTabLink = (count: number) => (
    <button
      type="button"
      onClick={() => setTab(other.value)}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {count} in {other.label.toLowerCase()}
    </button>
  )

  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Your map">
        <Tabs defaultValue="preview" className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CountPill>{total}</CountPill>
                {total === 1 ? "place" : "places"}
              </span>
              {total > 0 && (
                <>
                  <Button variant="ghost" onClick={clearPlacesBuilder}>
                    <XIcon />
                    Clear
                  </Button>
                  <CopyButton value={code} label="Copy code" />
                </>
              )}
            </div>
          </div>
          {saveFailed && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              This browser isn&apos;t letting the page save (storage is blocked
              or full), so your places will be lost when you leave. Copy them
              before closing the page.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {(
              [
                ["hideStats", "Hide stats"],
                ["hideLegend", "Hide legend"],
                ["zoomable", "Zoomable"],
              ] as const
            ).map(([key, label]) => (
              <Label key={key} className="font-normal">
                <Switch
                  checked={options[key]}
                  onCheckedChange={(checked) => setBuilderOption(key, checked)}
                />
                {label}
              </Label>
            ))}
          </div>
          <TabsContent value="preview">
            <VisitedMap
              countries={mapCountries}
              places={places}
              hideStats={options.hideStats}
              hideLegend={options.hideLegend}
              zoomable={options.zoomable}
            />
          </TabsContent>
          <TabsContent value="code">
            {total > 0 ? (
              // "Copy code" is already in the header, for both tabs.
              <LiveCodeBlock code={code} showCopy={false} />
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Pick a status for a country below or add your own place to
                generate the code for your map.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as Tab)}
        className="gap-3"
        render={<section />}
      >
        <TabsList aria-label="Region type">
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="px-2.5">
              {item.label}
              <RegionCount selected={tab === item.value}>
                {item.regions.length}
              </RegionCount>
            </TabsTrigger>
          ))}
          <TabsTrigger value="places" className="px-2.5">
            Places
            <RegionCount selected={tab === "places"}>
              {custom.length}
            </RegionCount>
          </TabsTrigger>
        </TabsList>
        {tab === "territories" && (
          <p className="text-sm text-muted-foreground">
            Territories aren&apos;t among the 195 countries, so they never count
            in the stats. Only some are drawn on the map; the rest show just a
            pin.
          </p>
        )}

        {/* One panel for whichever tab is active: countries and territories
            share the same table. */}
        <TabsContent value={tab} className="flex flex-col gap-3">
          {tab === "places" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Cities or anything else that isn&apos;t a country&apos;s center.
              </p>
              <AddPlaceForm />
              {custom.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium sm:px-4">Place</th>
                        <th className="hidden px-4 py-2 font-medium md:table-cell">
                          Coords [lng, lat]
                        </th>
                        <th className="px-1.5 py-2 font-medium sm:px-2">
                          Status
                        </th>
                        <th className="w-10 px-1.5 py-2">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {custom.map((place) => (
                        <tr key={place.id} className="border-t">
                          <td className="px-3 py-1.5 font-medium sm:px-4">
                            {place.name}{" "}
                            {place.country && (
                              <span className="font-mono text-xs font-normal text-muted-foreground">
                                {place.country}
                              </span>
                            )}
                          </td>
                          <td className="hidden px-4 py-1.5 font-mono text-xs text-muted-foreground md:table-cell">
                            [{place.coords.join(", ")}]
                          </td>
                          <td className="px-1.5 py-1.5 sm:px-2">
                            <StatusButtons
                              label={`Status for ${place.name}`}
                              value={place.variant}
                              onSelect={(variant) =>
                                setCustomVariant(place.id, variant)
                              }
                            />
                          </td>
                          <td className="px-1.5 py-1.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove ${place.name}`}
                              onClick={() => removeCustomPlace(place.id)}
                            >
                              <XIcon />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${active.label.toLowerCase()} by name or code…`}
                    aria-label={`Search ${active.label.toLowerCase()}`}
                    className="pl-8"
                  />
                </div>
                <ToggleGroup
                  aria-label="Show"
                  variant="outline"
                  spacing={0}
                  className="shrink-0"
                  value={[selectedOnly ? "selected" : "all"]}
                  // Clicking the pressed item sends []: keep the current one.
                  onValueChange={([value]) => {
                    if (value) setSelectedOnly(value === "selected")
                  }}
                >
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="selected">
                    Selected
                    <CountPill active={selectedOnly}>{selectedCount}</CountPill>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium sm:px-4">
                        {tab === "countries" ? "Country" : "Territory"}
                      </th>
                      <th className="hidden px-4 py-2 font-medium md:table-cell">
                        Center [lng, lat]
                      </th>
                      <th className="px-1.5 py-2 font-medium sm:px-2">
                        Status
                      </th>
                    </tr>
                  </thead>
                  {groups.map((group) => {
                    const key = `${regionTab}:${group.continent}`
                    const open = filtering || expanded.has(key)
                    return (
                      <tbody key={group.continent}>
                        <tr className="border-t bg-muted/30">
                          <th scope="rowgroup" colSpan={3} className="p-0">
                            <button
                              type="button"
                              aria-expanded={open}
                              disabled={filtering}
                              onClick={() => toggleContinent(key)}
                              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none sm:px-4"
                            >
                              <ChevronRightIcon
                                aria-hidden
                                className={cn(
                                  "size-3.5 shrink-0 transition-transform",
                                  open && "rotate-90",
                                )}
                              />
                              {group.continent}
                              {/* Highlighted when the continent has a selection,
                                so it shows even while collapsed. */}
                              <CountPill
                                active={group.selected > 0}
                                className="ml-1 font-normal tracking-normal normal-case"
                              >
                                {group.selected} / {group.total}
                              </CountPill>
                            </button>
                          </th>
                        </tr>
                        {open &&
                          group.rows.map((region) => (
                            <tr
                              key={region.code}
                              className={cn(
                                "border-t",
                                regions[region.code] && "bg-muted/40",
                              )}
                            >
                              <td className="px-3 py-1.5 sm:px-4">
                                <span className="font-medium">
                                  {region.name}
                                </span>{" "}
                                <span className="font-mono text-xs text-muted-foreground">
                                  {region.code}
                                </span>
                              </td>
                              <td className="hidden px-4 py-1.5 font-mono text-xs text-muted-foreground md:table-cell">
                                [{countryCenters[region.code].join(", ")}]
                              </td>
                              <td className="px-1.5 py-1.5 sm:px-2">
                                <StatusButtons
                                  label={`Status for ${region.name}`}
                                  value={regions[region.code]}
                                  onSelect={(variant) =>
                                    toggleRegion(region.code, variant)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    )
                  })}
                  {rows.length === 0 && (
                    <tbody>
                      <tr className="border-t">
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          {selectedOnly && !q ? (
                            <>
                              Nothing selected in {active.label.toLowerCase()}{" "}
                              yet.
                              {otherSelectedCount > 0 && (
                                <> {switchTabLink(otherSelectedCount)}</>
                              )}
                            </>
                          ) : (
                            <>
                              No {active.label.toLowerCase()} match “{query}”.
                              {otherMatches > 0 && (
                                <> {switchTabLink(otherMatches)}</>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
