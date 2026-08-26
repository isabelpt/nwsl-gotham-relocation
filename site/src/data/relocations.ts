// Table 2 in the paper. Accessibility figures from output/accessibility_gain_by_relocation.csv;
// attendance changes from output/synthetic_control_comparables.csv.
//
// Ordered by accessibility gain ascending among the three usable relocations, so the co-movement
// with attendance change is readable directly off the table. Raw attendance changes here are NOT
// corrected for league-wide growth. The growth-corrected projections live in scenarios.ts.
export type RelocationRow = {
  team: string
  oldVenue: string
  newVenue: string
  oldPop: number
  newPop: number
  accessChangePct: number
  attChangePct: number | null
  /** Gotham hasn't moved yet; Kansas City is capacity-suppressed and excluded from the
   * attendance comparison (though its accessibility gain is still real). */
  status: 'future' | 'usable' | 'excluded'
  note?: string
}

export const relocations: RelocationRow[] = [
  {
    team: 'NJ/NY Gotham FC',
    oldVenue: 'Sports Illustrated Stadium',
    newVenue: 'Etihad Park',
    oldPop: 1051425,
    newPop: 3201230,
    accessChangePct: 204.5,
    attChangePct: null,
    status: 'future',
    note: 'not yet moved',
  },
  {
    team: 'San Diego Wave FC',
    oldVenue: 'Torero Stadium',
    newVenue: 'Snapdragon Stadium',
    oldPop: 358541,
    newPop: 402583,
    accessChangePct: 12.3,
    attChangePct: 68.8,
    status: 'usable',
  },
  {
    team: 'Seattle Reign FC',
    oldVenue: 'Cheney Stadium',
    newVenue: 'Lumen Field',
    oldPop: 77359,
    newPop: 833559,
    accessChangePct: 977.5,
    attChangePct: 103.5,
    status: 'usable',
  },
  {
    team: 'Washington Spirit',
    oldVenue: 'Maryland SoccerPlex',
    newVenue: 'Audi Field',
    oldPop: 25934,
    newPop: 676306,
    accessChangePct: 2507.8,
    attChangePct: 174.3,
    status: 'usable',
  },
  {
    team: 'Kansas City Current',
    oldVenue: "Children's Mercy Park",
    newVenue: 'CPKC Stadium',
    oldPop: 6028,
    newPop: 123809,
    accessChangePct: 1953.9,
    attChangePct: 31.3,
    status: 'excluded',
    note: 'sells out every game, so its figures reflect the cap rather than demand',
  },
]

// Placebo validation of the synthetic-control design on the two relocations that already happened
// (output/synthetic_control_placebo_significance.png + the SCM-implied lifts in Figure 3).
// The gap between the SCM-implied lift and the raw lift is what separates relocation effect from
// league-wide growth, and it is what the growth-corrected projections in scenarios.ts apply.
export type PlaceboRow = {
  team: string
  scmImpliedLiftPct: number
  actualLiftPct: number
  rmspeRatio: number
  pValue: number
}

export const placebos: PlaceboRow[] = [
  { team: 'Seattle Reign FC', scmImpliedLiftPct: 46.4, actualLiftPct: 103.5, rmspeRatio: 18.0, pValue: 0.2 },
  { team: 'Washington Spirit', scmImpliedLiftPct: 109.1, actualLiftPct: 174.3, rmspeRatio: 10.6, pValue: 0.2 },
]
