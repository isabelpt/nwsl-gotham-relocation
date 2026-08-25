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

export const SITE_CONFIG: Record<
  SiteLabel,
  { label: string; minutesField: string; color: string; coords: [number, number] }
> = {
  current: {
    label: "Red Bull Arena",
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

export type MapView = "accessibility" | "clusters";

export interface ClusterInfo {
  id: number;
  name: string;
  color: string;
  n_tracts: number;
  population: number;
  median_household_income: number;
  /** Mean change in transit travel time to the stadium, future minus current (negative = faster
   * after the move -- see 08_tract_clustering.ipynb's delta_transit_time). */
  avg_delta_transit_min: number;
  /** Share of this cluster's tracts where delta_transit_time < 0 (i.e. gained access). */
  pct_gaining_access: number;
}
