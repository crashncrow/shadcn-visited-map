import { useSyncExternalStore } from "react"

import { countries, flattenRegions, territories } from "@/lib/regions"
import type {
  VisitedMapCountryCode,
  VisitedMapVariant,
} from "@/registry/visited-map/visited-map"

/** A place typed by hand, e.g. a city that isn't a country's center. */
export type CustomPlace = {
  id: string
  name: string
  coords: [lng: number, lat: number]
  country?: VisitedMapCountryCode
  variant: VisitedMapVariant
}

/** VisitedMap props the builder can turn on or off. */
export type BuilderOptions = {
  hideStats: boolean
  hideLegend: boolean
  zoomable: boolean
}

export type PlacesBuilderState = {
  /** Variant chosen for each country or territory, keyed by its code. */
  regions: Record<string, VisitedMapVariant>
  custom: CustomPlace[]
  options: BuilderOptions
}

const STORAGE_KEY = "places-builder"
const DEFAULT_OPTIONS: BuilderOptions = {
  hideStats: false,
  hideLegend: false,
  zoomable: false,
}
const EMPTY: PlacesBuilderState = {
  regions: {},
  custom: [],
  options: DEFAULT_OPTIONS,
}

const variants = new Set<string>(["visited", "lived", "wishlist", "current"])
const regionCodes = new Set<string>(
  [...flattenRegions(countries), ...flattenRegions(territories)].map(
    (region) => region.code,
  ),
)

// Cached snapshot: useSyncExternalStore needs the same object until it changes.
let state: PlacesBuilderState | null = null
// Set when the last save to localStorage failed (blocked, full, private mode).
let saveFailed = false
const listeners = new Set<() => void>()

function isVariant(value: unknown): value is VisitedMapVariant {
  return typeof value === "string" && variants.has(value)
}

function isCoord(value: unknown, limit: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Math.abs(value) <= limit
  )
}

// Drop anything that isn't valid (old or hand-edited data).
function sanitizeRegions(value: unknown): PlacesBuilderState["regions"] {
  if (!value || typeof value !== "object") return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      ([code, variant]) => regionCodes.has(code) && isVariant(variant),
    ),
  )
}

function sanitizeCustom(value: unknown): CustomPlace[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const { id, name, coords, country, variant } = item as Record<
      string,
      unknown
    >
    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      !name.trim() ||
      !Array.isArray(coords) ||
      !isCoord(coords[0], 180) ||
      !isCoord(coords[1], 90) ||
      !isVariant(variant)
    )
      return []
    return [
      {
        id,
        name,
        coords: [coords[0], coords[1]] as [number, number],
        ...(typeof country === "string" &&
          regionCodes.has(country) && {
            country: country as VisitedMapCountryCode,
          }),
        variant,
      },
    ]
  })
}

function sanitizeOptions(value: unknown): BuilderOptions {
  const options = (value ?? {}) as Partial<
    Record<keyof BuilderOptions, unknown>
  >
  const result = { ...DEFAULT_OPTIONS }
  for (const key of Object.keys(DEFAULT_OPTIONS) as (keyof BuilderOptions)[]) {
    const option = options[key]
    if (typeof option === "boolean") result[key] = option
  }
  return result
}

function read(): PlacesBuilderState {
  if (state) return state
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    state = {
      regions: sanitizeRegions(parsed?.regions),
      custom: sanitizeCustom(parsed?.custom),
      options: sanitizeOptions(parsed?.options),
    }
  } catch {
    state = EMPTY
  }
  return state
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    // key is null when another tab clears all storage (localStorage.clear()).
    if (event.key !== null && event.key !== STORAGE_KEY) return
    state = null
    onChange()
  }
  listeners.add(onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

function write(next: PlacesBuilderState) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    saveFailed = false
  } catch {
    // Keep working from memory, but let the page warn that it won't persist.
    saveFailed = true
  }
  listeners.forEach((listener) => listener())
}

// Only one place can be "current": the previous one becomes "visited".
function demoteCurrent(current: PlacesBuilderState): PlacesBuilderState {
  return {
    ...current,
    regions: Object.fromEntries(
      Object.entries(current.regions).map(([code, variant]) => [
        code,
        variant === "current" ? "visited" : variant,
      ]),
    ),
    custom: current.custom.map((place) =>
      place.variant === "current" ? { ...place, variant: "visited" } : place,
    ),
  }
}

/** Sets a region's variant, or clears it when it's already that variant. */
export function toggleRegion(code: string, variant: VisitedMapVariant) {
  const current = read()
  if (current.regions[code] === variant) {
    const regions = { ...current.regions }
    delete regions[code]
    write({ ...current, regions })
    return
  }
  const base = variant === "current" ? demoteCurrent(current) : current
  write({ ...base, regions: { ...base.regions, [code]: variant } })
}

export function addCustomPlace(place: Omit<CustomPlace, "id">) {
  const current = read()
  const base = place.variant === "current" ? demoteCurrent(current) : current
  // randomUUID only exists in secure contexts (https, localhost), not when
  // testing over plain http on the local network.
  const id = crypto.randomUUID?.() ?? String(Date.now())
  write({ ...base, custom: [...base.custom, { ...place, id }] })
}

export function setCustomVariant(id: string, variant: VisitedMapVariant) {
  const current = read()
  const base = variant === "current" ? demoteCurrent(current) : current
  write({
    ...base,
    custom: base.custom.map((place) =>
      place.id === id ? { ...place, variant } : place,
    ),
  })
}

export function removeCustomPlace(id: string) {
  const current = read()
  write({
    ...current,
    custom: current.custom.filter((place) => place.id !== id),
  })
}

/** Clears the places but keeps the options. */
export function clearPlacesBuilder() {
  write({ ...read(), regions: {}, custom: [] })
}

export function setBuilderOption(key: keyof BuilderOptions, value: boolean) {
  const current = read()
  write({ ...current, options: { ...current.options, [key]: value } })
}

/** True when changes couldn't be saved and will be lost on reload. */
export function usePlacesSaveFailed() {
  return useSyncExternalStore(
    subscribe,
    () => saveFailed,
    () => false,
  )
}

export function usePlacesBuilder() {
  // The server snapshot is empty, so server and client HTML match.
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}
