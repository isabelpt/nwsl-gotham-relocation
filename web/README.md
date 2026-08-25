# Interactive isochrone map

Standalone React + MapLibre GL page with two views: **Accessibility comparison** (Red Bull
Arena vs. Etihad Park transit+walk reach, NYC only, per the deliverable's core finding) and
**Demographic clusters** (the k-means clusters from `code/supplementary/08_tract_clustering.ipynb`, colored to
match that notebook's static map, each with a gain/loss indicator showing the cluster's average
change in transit time to the stadium). An address search box (geocoded via Nominatim, free, no
API key) flies to any NYC-metro address and reports the tract underneath it, labeled with its
NYC neighborhood name where one exists (NJ tracts show their raw GEOID instead -- no equivalent
neighborhood-name source at this scope). Meant to be embedded into a larger site later -- this
is just the map component running on its own page for now.

**Data**: all pre-computed. `export_map_data.py` reads the project's already-built isochrone/
travel-time files (`../data/processed/nyc_tract_travel_times_90min.csv`, `transit_lines.geojson`),
the cluster assignments (`../output/tract_clusters_weighted.csv`), NY/NJ Census tract
shapefiles, and NYC's Neighborhood Tabulation Areas (`../data/raw/census/nyc_nta_2020.geojson`,
pulled once from NYC Open Data), joining them into `public/data/tracts.geojson` (one polygon per
tract carrying both stadiums' travel times, its cluster id, its cluster's transit-time delta,
and its NYC neighborhood name where one exists), `public/data/transit_lines.geojson`,
`public/data/stats.json` (reachable population by threshold), and `public/data/clusters.json`
(cluster legend with gain/loss stats). Nothing routes live in the browser except the address
search -- re-run the export script and redeploy any time the underlying r5py or clustering data
changes.

Basemap is CARTO Positron (light, labeled) raster tiles -- free, no API key.

## Re-export data after an upstream change

```bash
cd web
python3 export_map_data.py
```

## Run locally

```bash
cd web
npm install
npm run dev
```

## Deploy to Vercel

```bash
cd web
npx vercel
```

Follow the prompts (link/create a project, accept the detected Vite settings). `vercel.json`
already pins the build command and output directory, so the default detection should just work.
For production deploys once the project is linked:

```bash
npx vercel --prod
```
