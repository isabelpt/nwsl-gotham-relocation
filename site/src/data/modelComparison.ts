// From output/nwsl_attendance_linear_fit_summary.csv (linear stage) and
// output/catboost_combined_model_fit_summary.csv (combined model). Table 3 in the paper.
// "Naive" = in-sample fit (linear stage) or row-shuffled random split (combined model). Lets a
// venue's other games leak into its own held-out fold. "Grouped" = Leave-One-Venue-Out (LOVO):
// hold out one (team, venue) pair at a time. The honest test of whether the model generalizes to
// a venue it hasn't seen, which is the actual question this project needs answered (Gotham is
// always in-sample as a *team*; only Etihad Park, the *venue*, is genuinely novel. Team-level
// Leave-One-Team-Out was tried and dropped for exactly this reason).
//
// Every row reports R², Pearson r, MAE, and RMSE, computed the same way for every model: pooled
// out-of-fold predictions (every held-out fold's predictions concatenated, then scored once).
// R² and Pearson r aren't interchangeable: a model can correlate reasonably (r) while being
// badly miscalibrated in absolute terms (R²), and R² alone can be misleading at this grain (a
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
    model: 'Reach only',
    features: 'Reachable population, log scale (the linear stage)',
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
    model: 'Reach + CatBoost on the rest',
    features: 'Reach, plus 19 features for opponent, schedule, capacity, weather',
    naiveScheme: 'naive (random 80/20 split)',
    naiveR2: 0.788,
    naivePearsonR: 0.889,
    naiveMae: 1485,
    naiveRmse: 2266,
    groupedScheme: 'Leave-One-Venue-Out (pooled)',
    groupedR2: 0.004,
    groupedPearsonR: 0.308,
    groupedMae: 4225,
    groupedRmse: 5883,
    source: '10+11',
  },
]
