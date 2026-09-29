# Visited Map

An SVG world map for [shadcn/ui](https://ui.shadcn.com) that plots the cities you've been to as colored dots.

- **No tiles, no API keys.** Country shapes come from [`world-atlas`](https://github.com/topojson/world-atlas) and are projected with [`d3-geo`](https://github.com/d3/d3-geo). Nothing is fetched at runtime.
- **Works in Server Components.** No hooks and no `"use client"`, so the map renders as plain SVG on the server and the map data never reaches the browser. It also works in Client Components and outside the App Router.
- **Follows your theme.** Countries use shadcn tokens (`fill-muted`, `stroke-border`, `bg-card`), so light and dark mode work out of the box.
- **Tooltips without JavaScript.** City names show on hover, click/tap and keyboard focus, using CSS only.

**[Live demo and docs →](https://shadcn-visited-map.vercel.app)**

![Visited Map in dark mode](.github/preview.png)

## Installation

```bash
npx shadcn@latest add crashncrow/shadcn-visited-map/visited-map
```

This adds `components/visited-map.tsx` and installs `d3-geo`, `topojson-client` and `world-atlas`. Your project needs shadcn/ui with Tailwind CSS v4 set up (`npx shadcn@latest init`).

<details>
<summary>pnpm, yarn, bun</summary>

```bash
pnpm dlx shadcn@latest add crashncrow/shadcn-visited-map/visited-map
yarn shadcn@latest add crashncrow/shadcn-visited-map/visited-map
bunx --bun shadcn@latest add crashncrow/shadcn-visited-map/visited-map
```

</details>

You can also install from the registry URL:

```bash
npx shadcn@latest add https://shadcn-visited-map.vercel.app/r/visited-map.json
```

## Usage

```tsx
import { VisitedMap, type VisitedMapPlace } from "@/components/visited-map"

// coords are [lng, lat] — not [lat, lng]
const places: VisitedMapPlace[] = [
  {
    name: "Buenos Aires",
    coords: [-58.38, -34.6],
    country: "AR",
    variant: "current",
  },
  { name: "Barcelona", coords: [2.17, 41.39], country: "ES", variant: "lived" },
  { name: "Tokyo", coords: [139.69, 35.69], country: "JP" },
  // wishlist countries are not highlighted
  {
    name: "Sydney",
    coords: [151.21, -33.87],
    country: "AU",
    variant: "wishlist",
  },
]

export default function Page() {
  return (
    <VisitedMap
      places={places}
      // extra countries you've been to without pinning a city
      countries={["UY"]}
      className="max-w-3xl"
    />
  )
}
```

> [!IMPORTANT]
> Coordinates go in **`[longitude, latitude]`** order (the GeoJSON convention). Google Maps copies them as `lat, lng`, so swap the two numbers.

## Stats

`getVisitedStats` returns the share of the world's countries you've visited, counting the same countries the map highlights (wishlist excluded):

```tsx
import { getVisitedStats } from "@/components/visited-map"

const { visited, total, percent } = getVisitedStats(places, ["UY"])
// → { visited: 4, total: 195, percent: 2.1 }
```

The total is 195: the 193 UN member states plus the Vatican and Palestine. Small countries that aren't drawn on the map, like Singapore, still count. Territories such as Greenland or Puerto Rico, Kosovo and Taiwan can be highlighted but aren't counted.

## Props

| Prop        | Type                      | Description                                                                                                 |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `places`    | `VisitedMapPlace[]`       | Cities to plot on the map.                                                                                  |
| `countries` | `VisitedMapCountryCode[]` | Extra countries to highlight (ISO 3166-1 alpha-2, e.g. `"UY"`), on top of the ones from `places`. Optional. |
| `className` | `string`                  | Extra classes for the card container.                                                                       |

### `VisitedMapPlace`

| Field     | Type                                              | Description                                                                                                  |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `name`    | `string`                                          | Shown in the tooltip.                                                                                        |
| `coords`  | `[lng, lat]`                                      | Longitude first, then latitude.                                                                              |
| `country` | `VisitedMapCountryCode`                           | ISO 3166-1 alpha-2 code (e.g. `"AR"`). Highlights the country unless the place is on the wishlist. Optional. |
| `variant` | `"visited" \| "lived" \| "wishlist" \| "current"` | Dot style. Defaults to `"visited"`.                                                                          |

### Variants

| Variant    | Style                                      |
| ---------- | ------------------------------------------ |
| `visited`  | Sky blue dot                               |
| `lived`    | Emerald dot                                |
| `wishlist` | Hollow amber dot                           |
| `current`  | Rose dot with a pulsing halo, drawn on top |

Countries of `visited`, `lived` and `current` places (plus any in `countries`) get a light sky tint; wishlist countries stay plain. The map is drawn at 1:110m, so very small countries (Singapore, Monaco, Malta…) can't be highlighted, although they still count in the stats below. Kosovo uses `"XK"`.

To change the colors, edit `variantStyles` in `components/visited-map.tsx` after installing. The component is yours to modify.

## Development

This repo is both the docs site and the registry that serves the component.

```bash
npm install
npm run dev             # docs site on http://localhost:3000
npm run registry:build  # regenerates public/r/*.json from registry.json
```

| Path                                   | What it is                                             |
| -------------------------------------- | ------------------------------------------------------ |
| `registry/visited-map/visited-map.tsx` | The component (source of truth).                       |
| `registry.json`                        | Registry definition read by `shadcn build`.            |
| `public/r/`                            | Built registry JSON served to `shadcn add`. Commit it. |
| `app/page.tsx`                         | Docs and demo page.                                    |

After changing the component, run `npm run registry:build` and commit the updated `public/r/` so the deployed registry serves the new version.

The short install address (`crashncrow/shadcn-visited-map/visited-map`) reads the registry from this GitHub repo, so changes reach users once they are pushed. It is defined in `lib/site.ts`.

## License

[MIT](LICENSE)
