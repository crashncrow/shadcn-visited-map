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
npx shadcn@latest add https://shadcn-visited-map.vercel.app/r/visited-map.json
```

This adds `components/visited-map.tsx` and installs `d3-geo`, `topojson-client` and `world-atlas`. Your project needs shadcn/ui with Tailwind CSS v4 set up (`npx shadcn@latest init`).

<details>
<summary>pnpm, yarn, bun</summary>

```bash
pnpm dlx shadcn@latest add https://shadcn-visited-map.vercel.app/r/visited-map.json
yarn shadcn@latest add https://shadcn-visited-map.vercel.app/r/visited-map.json
bunx --bun shadcn@latest add https://shadcn-visited-map.vercel.app/r/visited-map.json
```

</details>

## Usage

```tsx
import { VisitedMap, type VisitedMapPlace } from "@/components/visited-map";

// coords are [lng, lat] — not [lat, lng]
const places: VisitedMapPlace[] = [
  { name: "Buenos Aires", coords: [-58.38, -34.6], variant: "current" },
  { name: "Barcelona", coords: [2.17, 41.39], variant: "lived" },
  { name: "Tokyo", coords: [139.69, 35.69] },
  { name: "Sydney", coords: [151.21, -33.87], variant: "wishlist" },
];

export default function Page() {
  return <VisitedMap places={places} className="max-w-3xl" />;
}
```

> [!IMPORTANT]
> Coordinates go in **`[longitude, latitude]`** order (the GeoJSON convention). Google Maps copies them as `lat, lng`, so swap the two numbers.

## Props

| Prop        | Type                | Description                           |
| ----------- | ------------------- | ------------------------------------- |
| `places`    | `VisitedMapPlace[]` | Cities to plot on the map.            |
| `className` | `string`            | Extra classes for the card container. |

### `VisitedMapPlace`

| Field     | Type                                              | Description                         |
| --------- | ------------------------------------------------- | ----------------------------------- |
| `name`    | `string`                                          | Shown in the tooltip.               |
| `coords`  | `[lng, lat]`                                      | Longitude first, then latitude.     |
| `variant` | `"visited" \| "lived" \| "wishlist" \| "current"` | Dot style. Defaults to `"visited"`. |

### Variants

| Variant    | Style                                      |
| ---------- | ------------------------------------------ |
| `visited`  | Sky blue dot                               |
| `lived`    | Emerald dot                                |
| `wishlist` | Hollow amber dot                           |
| `current`  | Rose dot with a pulsing halo, drawn on top |

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

The install URL shown on the docs site comes from `NEXT_PUBLIC_REGISTRY_URL` and defaults to `https://shadcn-visited-map.vercel.app`. Set it if you deploy a fork.

## License

[MIT](LICENSE)
