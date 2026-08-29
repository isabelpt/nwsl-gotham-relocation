// From output/gotham_2028_projection_growth_corrected.csv (04_synthetic_control.ipynb) and
// output/synthetic_control_comparables.csv. Table 4 in the paper. Etihad Park's capacity is 25,000.
//
// These are GROWTH-CORRECTED lifts, not raw pre/post lifts. The placebo validation on Seattle and
// Washington Spirit found the synthetic control under-predicts each team's actual post-move
// attendance by 57-65 percentage points; that gap is what separates the relocation lift from
// league-wide growth, and only the relocation-attributable part is applied to Gotham here.
//
// FIXED 2026-08-29 (two separate fixes, same day):
// 1. The no-move baseline these are built from was inflated by two of Gotham's 2026 games being
//    counted at their actual neutral-site attendance (Citi Field, 42,175; a second unlisted
//    venue, 4,738) instead of being excluded like any other non-representative game.
// 2. The projection was only extrapolating ONE year of growth from Gotham's last actual season
//    (2026), landing on 2027 -- but Etihad Park opens in 2028. A second year of growth is now
//    compounded on top to reach a genuine 2028 figure. See data/syntheticControl.ts and
//    04_synthetic_control.ipynb for both fixes.
// The "high" scenario still doesn't reach Etihad Park's capacity even after both fixes and the
// extra year of growth -- it previously appeared to hit capacity only because of the inflated,
// one-year-short baseline, not because Washington Spirit's real lift is actually that large.
export type ScenarioRow = {
  label: string
  /** Compact label for the stadium-fill buttons, where the full label doesn't fit. */
  short: string
  attendance: number
  pctOfCapacity: number
  note?: string
  /** 'baseline' = counterfactual no-move reference (dashed/muted). 'range' = the three
   * post-move scenarios that together form this project's actual attendance estimate
   * (solid, bracketed together as one range, not separate point forecasts). */
  kind: 'baseline' | 'range'
}

export const scenarios: ScenarioRow[] = [
  { label: 'No move (stay at Sports Illustrated Stadium)', short: 'No move', attendance: 10926, pctOfCapacity: 43.7, note: 'league growth only', kind: 'baseline' },
  { label: 'Etihad Park, low', short: 'Low', attendance: 14962, pctOfCapacity: 59.8, note: "San Diego's lift, minus league growth", kind: 'range' },
  { label: 'Etihad Park, mid', short: 'Mid', attendance: 15992, pctOfCapacity: 64.0, note: "Seattle's lift, minus league growth", kind: 'range' },
  { label: 'Etihad Park, high', short: 'High', attendance: 22849, pctOfCapacity: 91.4, note: "Washington Spirit's lift -- the largest of the three, but still short of a sellout", kind: 'range' },
]
