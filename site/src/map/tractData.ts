/** Shared loader + aggregates for `public/data/tracts.geojson`.
 *
 * Every headline number in the narrative is derived here, at runtime, from the same file the
 * map draws. Nothing is transcribed by hand, so a number on the page cannot drift away from
 * the data behind it -- the same rule this project applies to its notebooks.
 *
 * The file is ~1.9MB, so the fetch is memoised at module scope: the map and the narrative
 * sections share one request and one parse per page load. */

import type { FeatureCollection, Geometry } from 'geojson'

/** A type alias rather than an interface on purpose: MapLibre types its source data as
 * `GeoJsonProperties`, an index-signature type, and TypeScript will not assign an interface
 * to one of those. The alias keeps the same field documentation while staying assignable, so
 * the very same parsed object can be handed straight to the map. */
export type TractProps = {
  GEOID: string
  /** Transit + walk minutes to Sports Illustrated Stadium. `null` = beyond r5py's routing
   * window, not "instant" -- always coalesce before comparing. */
  rba_minutes: number | null
  /** Same, for Etihad Park. */
  etihad_minutes: number | null
  population: number | null
  /** NYC neighbourhood name. `null` for tracts outside NYC, which in this extract means the
   * New Jersey side -- that is how the two sides of the trade are told apart below. */
  neighborhood: string | null
  delta_transit_time: number | null
}

/** The real GeoJSON types, so the parsed file can go straight into MapLibre's `addSource`
 * without a cast or a second copy. */
export type TractCollection = FeatureCollection<Geometry, TractProps>

/** Sentinel for "beyond the routing window", matching IsochroneMap's own UNREACHABLE. */
const UNREACHABLE = 999
/** Minutes are capped before averaging so one unroutable tract can't drag a mean to infinity.
 * Well beyond any real trip in this metro, so it only ever bites on the sentinel. */
const MINUTES_CAP = 150
/** The travel-time window this project actually modelled. */
const MODELLED_WINDOW = 90

let cache: Promise<TractCollection> | null = null

/** Fetches and parses the tract file exactly once per page load. */
export function loadTracts(): Promise<TractCollection> {
  if (!cache) {
    cache = fetch('/data/tracts.geojson').then((r) => {
      if (!r.ok) throw new Error(`tracts.geojson: ${r.status}`)
      return r.json() as Promise<TractCollection>
    })
  }
  return cache
}

function minutes(p: TractProps, key: 'rba_minutes' | 'etihad_minutes'): number {
  const v = p[key]
  return v == null ? UNREACHABLE : v
}

export function rbaMinutes(p: TractProps) {
  return minutes(p, 'rba_minutes')
}

export function etihadMinutes(p: TractProps) {
  return minutes(p, 'etihad_minutes')
}

/** Signed change in travel time, capped at both ends. Negative = Etihad Park is closer. */
export function minutesChange(p: TractProps): number {
  return Math.min(etihadMinutes(p), MINUTES_CAP) - Math.min(rbaMinutes(p), MINUTES_CAP)
}

export interface TradeStats {
  /** People in NYC tracts who get closer to a home game. */
  nycBetterPop: number
  nycBetterTracts: number
  /** People in New Jersey (and other non-NYC) tracts who get farther away. */
  njWorsePop: number
  njWorseTracts: number
  /** Population moving into / out of the 60-minute ring. */
  ringGainedPop: number
  ringGainedTracts: number
  ringLostPop: number
  ringLostTracts: number
  /** Population-weighted minutes, across every tract on that side of the trade. */
  avgMinutesSaved: number
  avgMinutesLost: number
}

let statsCache: Promise<TradeStats> | null = null

/** The trade aggregates, computed once per page load and shared by every consumer. */
export function loadTradeStats(): Promise<TradeStats> {
  if (!statsCache) statsCache = loadTracts().then(computeTradeStats)
  return statsCache
}

/** A tract counts toward the trade if anyone lives there and it is reachable from at least one
 * of the two stadiums inside the window this project modelled. */
function isCounted(p: TractProps) {
  const pop = p.population ?? 0
  return pop > 0 && Math.min(rbaMinutes(p), etihadMinutes(p)) <= MODELLED_WINDOW
}

export function computeTradeStats(collection: TractCollection): TradeStats {
  let nycBetterPop = 0
  let nycBetterTracts = 0
  let njWorsePop = 0
  let njWorseTracts = 0
  let ringGainedPop = 0
  let ringGainedTracts = 0
  let ringLostPop = 0
  let ringLostTracts = 0
  let savedWeighted = 0
  let savedPop = 0
  let lostWeighted = 0
  let lostPop = 0

  for (const f of collection.features) {
    const p = f.properties
    const pop = p.population ?? 0
    const rba = rbaMinutes(p)
    const etihad = etihadMinutes(p)

    // Ring movement is a separate question from "closer or farther", so it is counted over
    // every populated tract rather than only the ones inside the modelled window.
    if (pop > 0) {
      if (etihad <= 60 && rba > 60) {
        ringGainedPop += pop
        ringGainedTracts += 1
      } else if (rba <= 60 && etihad > 60) {
        ringLostPop += pop
        ringLostTracts += 1
      }
    }

    if (!isCounted(p)) continue

    const change = minutesChange(p)
    const isNyc = p.neighborhood != null

    if (change < 0) {
      savedWeighted += -change * pop
      savedPop += pop
      if (isNyc) {
        nycBetterPop += pop
        nycBetterTracts += 1
      }
    } else if (change > 0) {
      lostWeighted += change * pop
      lostPop += pop
      if (!isNyc) {
        njWorsePop += pop
        njWorseTracts += 1
      }
    }
  }

  return {
    nycBetterPop,
    nycBetterTracts,
    njWorsePop,
    njWorseTracts,
    ringGainedPop,
    ringGainedTracts,
    ringLostPop,
    ringLostTracts,
    avgMinutesSaved: savedPop > 0 ? savedWeighted / savedPop : 0,
    avgMinutesLost: lostPop > 0 ? lostWeighted / lostPop : 0,
  }
}
