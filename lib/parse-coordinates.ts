type Axis = "lat" | "lng"

type Coordinate = { value: number; axis?: Axis }

// One coordinate: decimal degrees or degrees/minutes/seconds, with an optional
// hemisphere letter before or after it. E.g. "-34.6", "34.6° S", "S 34.6",
// `34°36'13.7"S`.
const COORDINATE =
  /([NSEW])?\s*(-?\d+(?:\.\d+)?)(?:\s*°\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*(?:"|″|'')\s*)?)?\s*([NSEW])?/gi

function toCoordinate(match: RegExpExecArray): Coordinate | null {
  const [, before, degrees, minutes, seconds, after] = match
  if (before && after) return null

  const letter = (before ?? after)?.toUpperCase()
  const negative = degrees.startsWith("-")
  // "-34.6 S" is contradictory.
  if (negative && letter) return null

  const value =
    Math.abs(Number(degrees)) +
    Number(minutes ?? 0) / 60 +
    Number(seconds ?? 0) / 3600
  const sign = negative || letter === "S" || letter === "W" ? -1 : 1
  const axis: Axis | undefined =
    letter === "N" || letter === "S"
      ? "lat"
      : letter === "E" || letter === "W"
        ? "lng"
        : undefined

  return { value: sign * value, axis }
}

/**
 * Parses a pair of coordinates in the formats map apps and websites use, and
 * returns it in the [lng, lat] order the map expects:
 *
 * - "41.3874, 2.1686" (lat, lng, as Google Maps copies them)
 * - "34.6038° S, 58.3816° W" (hemisphere letters, in any order)
 * - `34°36'13.7"S 58°22'53.8"W` (degrees, minutes, seconds)
 *
 * Without hemisphere letters the first number is the latitude.
 */
export function parseCoordinates(
  text: string,
): [lng: number, lat: number] | null {
  const matches = [...text.matchAll(COORDINATE)].filter((match) => match[2])
  if (matches.length !== 2) return null

  const coordinates = matches.map((match) =>
    toCoordinate(match as RegExpExecArray),
  )
  if (coordinates.some((coordinate) => coordinate === null)) return null
  const [first, second] = coordinates as [Coordinate, Coordinate]

  // Letters decide which one is the latitude; otherwise it's "lat, lng".
  let lat: Coordinate
  let lng: Coordinate
  if (first.axis === "lng" || second.axis === "lat") {
    ;[lat, lng] = [second, first]
  } else {
    ;[lat, lng] = [first, second]
  }
  if (lat.axis === "lng" || lng.axis === "lat") return null
  if (Math.abs(lat.value) > 90 || Math.abs(lng.value) > 180) return null

  const round = (n: number) => Math.round(n * 10000) / 10000
  return [round(lng.value), round(lat.value)]
}
