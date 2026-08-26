// From output/gotham_2027_projection.csv (05_synthetic_control.ipynb) and
// output/synthetic_control_comparables.csv. Etihad Park's capacity is 25,000.
export type ScenarioRow = {
  label: string
  attendance: number
  pctOfCapacity: number
  note?: string
  /** 'baseline' = counterfactual no-move reference (dashed/muted). 'range' = the two
   * post-move scenarios that together form this project's actual attendance estimate
   * (solid, bracketed together as one range, not two separate point forecasts). */
  kind: 'baseline' | 'range'
}

export const scenarios: ScenarioRow[] = [
  { label: 'No move (stay at Sports Illustrated Stadium)', attendance: 13116, pctOfCapacity: 52.5, note: 'synthetic control baseline', kind: 'baseline' },
  { label: 'Etihad Park — low scenario', attendance: 22137, pctOfCapacity: 88.5, note: "San Diego's post-move lift (+68.8%)", kind: 'range' },
  { label: 'Etihad Park — capacity-cap scenario', attendance: 25000, pctOfCapacity: 100, note: 'Seattle/Washington-scale lift (+103–174%), capped at capacity', kind: 'range' },
]
