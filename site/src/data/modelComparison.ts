// From output/leakage_check_summary.csv. "Naive" = row-shuffled k-fold (lets a team's other
// seasons leak into its own held-out fold); "grouped" = GroupKFold / Leave-One-Team-Out, which
// holds a whole team out — the honest test of whether the model generalizes to a team it
// has never seen.
export type ModelRow = {
  model: string
  features: string
  naiveMetric: string
  naiveValue: number
  groupedMetric: string | null
  groupedValue: number | null
  source: string
}

export const modelComparison: ModelRow[] = [
  {
    model: 'Linear (baseline, 5 predictors)',
    features: 'ppg, market_size_log, new_stadium_flag, rivalry_flag, dist_miles',
    naiveMetric: 'R²',
    naiveValue: -0.018,
    groupedMetric: null,
    groupedValue: null,
    source: '04',
  },
  {
    model: 'Linear (extended, +transit)',
    features: 'ppg, new_stadium_flag, rivalry_flag, catchment_pop_60min_100k',
    naiveMetric: 'R²',
    naiveValue: 0.156,
    groupedMetric: 'R² (GroupKFold)',
    groupedValue: -2.258,
    source: '04',
  },
  {
    model: 'GBT (extended, same features)',
    features: 'same as linear, extended',
    naiveMetric: 'R²',
    naiveValue: 0.512,
    groupedMetric: 'R² (GroupKFold)',
    groupedValue: -1.875,
    source: '04',
  },
  {
    model: 'CatBoost (full feature set)',
    features: 'table_rank, venue/schedule, metro_size, team_venue_tenure, team_league_tenure, etc.',
    naiveMetric: 'Pearson r',
    naiveValue: 0.867,
    groupedMetric: 'pooled r (LOTO)',
    groupedValue: 0.496,
    source: '12',
  },
]
