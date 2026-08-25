// From output/leakage_check_summary.csv. "Naive" = in-sample fit (linear stage) or row-shuffled
// random split (combined model) — lets a venue's other games leak into its own held-out fold.
// "Grouped" = Leave-One-Venue-Out (LOVO): hold out one (team, venue) pair at a time — the honest
// test of whether the model generalizes to a venue it hasn't seen, which is the actual question
// this project needs answered (Gotham is always in-sample as a *team*; only Etihad Park, the
// *venue*, is genuinely novel — team-level Leave-One-Team-Out was tried and dropped for exactly
// this reason).
//
// Every row reports R², Pearson r, MAE, and RMSE, computed the same way for every model: pooled
// out-of-fold predictions (every held-out fold's predictions concatenated, then scored once).
// R² and Pearson r aren't interchangeable — a model can correlate reasonably (r) while being
// badly miscalibrated in absolute terms (R²) — and R² alone can be misleading at this grain (a
// low-variance venue can post a terrible R² on a small absolute error), which is why MAE/RMSE
// (in raw attendance units) are shown alongside rather than instead.
export type ModelRow = {
  model: string
  features: string
  naiveScheme: string
  naiveR2: number
  naivePearsonR: number
  naiveMae: number
  naiveRmse: number
  groupedScheme: string | null
  groupedR2: number | null
  groupedPearsonR: number | null
  groupedMae: number | null
  groupedRmse: number | null
  source: string
}

export const modelComparison: ModelRow[] = [
  {
    model: 'Linear (accessibility only, clustered SE)',
    features: 'log(metro_size) — the linear stage of the residual model below',
    naiveScheme: 'naive (in-sample)',
    naiveR2: 0.154,
    naivePearsonR: 0.392,
    naiveMae: 4068,
    naiveRmse: 5426,
    groupedScheme: 'Leave-One-Venue-Out (pooled)',
    groupedR2: -0.045,
    groupedPearsonR: 0.170,
    groupedMae: 4463,
    groupedRmse: 5848,
    source: '10',
  },
  {
    model: 'Linear + CatBoost residual (combined model)',
    features: 'log(metro_size) [linear] + table_rank, venue/schedule, stadium_capacity, etc. [CatBoost residual]',
    naiveScheme: 'naive (random 80/20 split)',
    naiveR2: 0.778,
    naivePearsonR: 0.883,
    naiveMae: 1635,
    naiveRmse: 2453,
    groupedScheme: 'Leave-One-Venue-Out (pooled)',
    groupedR2: -0.167,
    groupedPearsonR: 0.126,
    groupedMae: 4587,
    groupedRmse: 6308,
    source: '10+11',
  },
]
