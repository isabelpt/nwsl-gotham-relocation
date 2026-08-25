# Gotham FC → Queens — site

React + TypeScript + Vite + Tailwind v4 + MapLibre GL. Copied from
`../../QSS 20/nwsl-project/site` and re-themed for this project — same
section structure, same design system, new content and a live map.

## Structure

```
src/
  App.tsx                  # assembles the page
  sections/
    Hero.tsx                # landing view — headline + key stat highlight
    QuestionSection.tsx      # 01 — the research question
    DataSection.tsx          # 02 — data sources
    MethodSection.tsx        # 03 — analytical pipeline
    ResultsSection.tsx       # 04 — live map, then every model + what it shows
    TakeawaySection.tsx      # 05 — conclusions, course-scope cuts, limitations
  components/                # Nav, Footer, SectionHeading, FigureCard, StatTile,
                              # Tag, PullQuote, IsochroneMotif (hero background),
                              # AccessibilityMap, ModelComparisonTable, ScenarioBars
  map/
    IsochroneMap.tsx          # MapLibre layer, adapted from ../../web/src/IsochroneMap.tsx
    types.ts                  # ported from web/, clustering types dropped
  data/
    scenarios.ts               # 2027 attendance scenarios (output/gotham_2027_projection.csv)
    modelComparison.ts         # naive vs. held-out-team fit per model (output/leakage_check_summary.csv)
  assets/figures/             # exported chart PNGs, copied from ../output
public/data/                 # tracts.geojson, transit_lines.geojson, stats.json — copied from
                              # ../web/public/data (regenerate there with export_map_data.py,
                              # then re-copy here)
```

## The interactive map

`ResultsSection` embeds the accessibility-comparison view from the standalone map app in
`../web/` directly into this site (same MapLibre logic, same pre-computed data, restyled to
match this site's design tokens). The **demographic-cluster view is intentionally left out** —
that k-means analysis isn't part of what this project defends as its modeling approach (see the
top-level README). If `web/`'s underlying data changes, re-run `web/export_map_data.py` and
copy the refreshed `tracts.geojson` / `transit_lines.geojson` / `stats.json` into
`public/data/` here.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Push to a Git repo and import into Vercel — framework preset "Vite" is
auto-detected. Build command `npm run build`, output directory `dist`.
