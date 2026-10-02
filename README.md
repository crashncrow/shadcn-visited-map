<h1 align="center">Visited Map</h1>

<p align="center">
  Free & open-source, ready-to-use world map for <a href="https://ui.shadcn.com">shadcn/ui</a> that shows how much of the world you've seen.<br/>
  No tiles, no API keys. One command setup. Built on <a href="https://github.com/d3/d3-geo">d3-geo</a>, styled with <a href="https://tailwindcss.com/">Tailwind</a>.
</p>

<p align="center">
  <a href="https://visitedmap.vercel.app/docs">Get Started</a> ·
  <a href="https://visitedmap.vercel.app/docs/examples">Examples</a> ·
  <a href="https://visitedmap.vercel.app/docs/api">API Reference</a> ·
  <a href="https://visitedmap.vercel.app/builder">Map Builder</a>
</p>

<br />

<p align="center">
  <img src=".github/preview.png" alt="Visited Map in dark mode" />
</p>

## Installation

```bash
npx shadcn@latest add crashncrow/shadcn-visited-map/visited-map
```

```tsx
import { VisitedMap } from "@/components/visited-map"

export default function Page() {
  return (
    <VisitedMap
      countries={{ current: "AR", lived: ["IT"], visited: ["BR", "JP"] }}
    />
  )
}
```

## Features

- 🗺️ **No tiles, no API keys** — Country shapes are bundled; nothing is fetched at runtime
- ⚡ **Server Components** — Renders as plain SVG on the server and ships no JavaScript by default
- 🎨 **Theme-aware** — Uses shadcn tokens, so light and dark mode work out of the box
- 📍 **Countries & places** — Mark countries as visited, lived, wishlist or current, and pin any city on top
- 📊 **Stats** — Shows the share of the world's 195 countries you've visited
- 🔍 **Zoom & focus** — Optional zoom and pan, or start zoomed in on a country
- 🧩 **Yours to modify** — Installed as source code in your project, like any shadcn/ui component
- 🛠️ **Map Builder** — Click the countries you've been to and copy the generated code

## Data

- Country shapes come from [world-atlas](https://github.com/topojson/world-atlas), and country names and centers from [Natural Earth](https://www.naturalearthdata.com) (public domain).
- The Map Builder also uses country names and continents from [mledoze/countries](https://github.com/mledoze/countries) ([ODbL](https://opendatacommons.org/licenses/odbl/1-0/)).

## License

MIT License - see the [LICENSE](LICENSE) file for details.
