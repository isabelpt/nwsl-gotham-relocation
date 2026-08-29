export type SiteLabel = "current" | "future";

export interface ThresholdStat {
  reachable_tracts: number;
  reachable_population: number;
}

export interface SiteStats {
  name: string;
  by_threshold: Record<string, ThresholdStat>;
}

export type StatsFile = Record<SiteLabel, SiteStats>;

export const THRESHOLDS = [30, 45, 60, 90] as const;
export type Threshold = (typeof THRESHOLDS)[number];

/** How the tract layer is painted.
 *  - `compare`: the diverging default -- which stadium each tract reaches faster.
 *  - `gainers`: only the tracts that get closer, shaded by how many minutes they save.
 *  - `losers`:  only the tracts that get farther, shaded by how many minutes they lose.
 * The two one-sided views are what make the trade legible: the same map, split into the
 * people it helps and the people it costs. */
export const MAP_VIEWS = ["compare", "gainers", "losers"] as const;
export type MapView = (typeof MAP_VIEWS)[number];

export const SITE_CONFIG: Record<
  SiteLabel,
  { label: string; minutesField: string; color: string; coords: [number, number] }
> = {
  current: {
    label: "Sports Illustrated Stadium",
    minutesField: "rba_minutes",
    color: "#e34948",
    coords: [-74.1503, 40.7367],
  },
  future: {
    label: "Etihad Park",
    minutesField: "etihad_minutes",
    color: "#4b2e83",
    coords: [-73.843333, 40.758056],
  },
};
