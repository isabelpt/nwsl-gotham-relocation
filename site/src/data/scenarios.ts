// From output/gotham_2027_projection_growth_corrected.csv (04_synthetic_control.ipynb) and
// output/synthetic_control_comparables.csv. Table 4 in the paper. Etihad Park's capacity is 25,000.
//
// These are GROWTH-CORRECTED lifts, not raw pre/post lifts. The placebo validation on Seattle and
// Washington Spirit found the synthetic control under-predicts each team's actual post-move
// attendance by 57-65 percentage points; that gap is what separates the relocation lift from
// league-wide growth, and only the relocation-attributable part is applied to Gotham here.
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
  { label: 'No move (stay at Sports Illustrated Stadium)', short: 'No move', attendance: 13116, pctOfCapacity: 52.5, note: 'league growth only', kind: 'baseline' },
  { label: 'Etihad Park, low', short: 'Low', attendance: 17961, pctOfCapacity: 71.8, note: "San Diego's lift, minus league growth", kind: 'range' },
  { label: 'Etihad Park, mid', short: 'Mid', attendance: 19197, pctOfCapacity: 76.8, note: "Seattle's lift, minus league growth", kind: 'range' },
  { label: 'Etihad Park, high', short: 'High', attendance: 25000, pctOfCapacity: 100, note: "Washington Spirit's lift, capped at a full house", kind: 'range' },
]
