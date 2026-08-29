// From output/synthetic_control_weights.csv: how much each donor team's history contributes to
// Gotham's synthetic no-move twin.
//
// FIXED 2026-08-29: the team-season panel these weights are fit on was built from
// games_clean.csv without a home-venue filter. Two of Gotham's 2026 "home" games were actually
// played at neutral/unlisted venues -- the Citi Field game vs. Washington Spirit (42,175 fans)
// and a second game at an unlisted stadium_id vs. Seattle Reign FC (4,738 fans) -- which
// inflated Gotham's 2026 season-average attendance in the panel from the correct 8,110 (its
// actual Sports Illustrated Stadium average) to ~10,900. That pulled the donor weights, and
// every downstream projection below, off. Both games are now excluded by game_id in
// 04_synthetic_control.ipynb; these are the corrected weights. Five other teams received
// weights below 0.001 and are folded into "rest of the league" rather than listed at a
// precision that implies they matter.
export type DonorWeight = { team: string; weight: number }

export const donorWeights: DonorWeight[] = [
  { team: 'Orlando Pride', weight: 0.852 },
  { team: 'Chicago Stars FC', weight: 0.094 },
  { team: 'Washington Spirit', weight: 0.054 },
]

export const donorWeightsRestPct = 0

// Gotham's actual home attendance and its donor-weighted synthetic twin, 2022-2026 -- the same
// pre-move window output/synthetic_control_fit.png covers. The "synthetic" column below is
// read directly from the corrected 04_synthetic_control.ipynb execution (the donor-weighted
// fit using the weights above). The "actual" column already read 8,110 for 2026 before this
// fix -- it was computed independently from a home-venue-filtered aggregation and was correct
// all along; only the synthetic twin (and the weights that build it) needed correcting.
export type FitPoint = { year: number; actual: number; synthetic: number }

export const syntheticControlFit: FitPoint[] = [
  { year: 2022, actual: 3897, synthetic: 4458 },
  { year: 2023, actual: 5415, synthetic: 5543 },
  { year: 2024, actual: 9303, synthetic: 9008 },
  { year: 2025, actual: 8892, synthetic: 9972 },
  { year: 2026, actual: 8110, synthetic: 8092 },
]

// The 2028 projection: three "if Gotham moves" scenarios (from scenarios.ts) fanning out from
// 2026, against where the synthetic no-move twin would land on its own trend. The no-move value
// is output/gotham_2028_projection_growth_corrected.csv's baseline.
//
// FIXED 2026-08-29 (second fix, same day): these are now genuine 2028 figures -- two years of
// growth compounded from Gotham's last actual season (2026), matching Etihad Park's real 2028
// opening. The notebook had been computing only ONE year of growth (a 2027 figure) and every
// downstream number, including the first version of this fix earlier today, was mislabeling
// that as "2028." See 04_synthetic_control.ipynb's growth-corrected projection cell.
export const projection2028 = {
  noMove: 10926,
  low: 14962,
  mid: 15992,
  high: 22849,
}
