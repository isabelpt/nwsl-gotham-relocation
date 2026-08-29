import { useEffect, useRef, useState } from 'react'
import IsochroneMap, { type IsochroneMapHandle } from '../map/IsochroneMap'
import {
  MAP_VIEWS,
  SITE_CONFIG,
  type MapView,
  type StatsFile,
  THRESHOLDS,
  type Threshold,
} from '../map/types'
import { useInView, usePrefersReducedMotion } from '../scroll/useInView'
import { useRevealSequence } from '../scroll/useRevealSequence'
import TripPanel from './TripPanel'

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toFixed(0)
}

/** The rings the map blooms through when the reader first reaches it, stopping at 60 minutes --
 * the threshold every headline figure in this project is quoted at. 90 stays available on the
 * slider but isn't part of the opening move. */
const BLOOM: Threshold[] = [30, 45, 60]

const VIEW_LABELS: Record<MapView, string> = {
  compare: 'Compare',
  gainers: 'Who gains',
  losers: 'Who loses',
}

// Live embed of the accessibility-comparison view from the standalone map app in `web/` --
// same data, same MapLibre logic, restyled to match this site and with the demographic-cluster
// view intentionally left out (k-means isn't part of what this project defends as its modeling
// approach; see the README).
export default function AccessibilityMap({
  viewOverride,
  thresholdOverride,
  defaultThreshold,
  fillHeight = false,
  caption,
}: {
  /** Supplied by the pinned scroll sequence. While set, the reader's own view buttons stand
   * down and the scroll position owns what is painted. */
  viewOverride?: MapView
  thresholdOverride?: Threshold
  /** Where the threshold rests once the scroll sequence hands the map over. Without it the
   * opening bloom would restart from 30 minutes at the very moment the reader takes control,
   * yanking them back from the 60-minute view the story just walked them to. Supplying it also
   * stands the bloom down, since the sequence has already done that job. */
  defaultThreshold?: Threshold
  /** Fill the parent's height instead of the standalone component's fixed height. Used when
   * the map is pinned to the viewport. */
  fillHeight?: boolean
  caption?: { head: string; body: string } | null
} = {}) {
  const controlled = viewOverride != null || thresholdOverride != null

  // Two observers, two jobs. The outer one fires a screen early and decides whether the map is
  // mounted at all: MapLibre pulls ~2.8MB of GeoJSON the moment it loads, and the map sits about
  // ten screens down, so mounting it eagerly made every reader pay for it before they had read a
  // word. The inner one fires when the map is genuinely on screen and starts the ring bloom.
  const [mountRef, nearViewport] = useInView<HTMLDivElement>({ rootMargin: '900px 0px 900px 0px' })
  const [containerRef, inView] = useInView<HTMLDivElement>()
  const reducedMotion = usePrefersReducedMotion()

  // The travel-time rings grow outward on arrival, so the reader sees the catchment being built
  // rather than landing on a finished picture. The moment they touch the slider they own it.
  const bloom = useRevealSequence(BLOOM.length, {
    active: inView && !controlled && defaultThreshold == null,
    intervalMs: 800,
    reducedMotion,
  })
  const [userThreshold, setUserThreshold] = useState<Threshold | null>(null)
  const [userView, setUserView] = useState<MapView>('compare')

  const threshold: Threshold =
    thresholdOverride ?? userThreshold ?? defaultThreshold ?? BLOOM[bloom.index] ?? 60
  const view: MapView = viewOverride ?? userView

  const [stats, setStats] = useState<StatsFile | null>(null)
  const [hoverProps, setHoverProps] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null)
  const [searchText, setSearchText] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [searchError, setSearchError] = useState<string | null>(null)
  const mapRef = useRef<IsochroneMapHandle>(null)

  // A committed choice (click or search) wins over whatever the cursor happens to be over, and
  // survives the mouse leaving the map. Hover is only a preview.
  const shown = selected ?? hoverProps

  useEffect(() => {
    fetch('/data/stats.json')
      .then((r) => r.json())
      .then(setStats)
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchText.trim() || !mapRef.current) return
    setSearchStatus('loading')
    setSearchError(null)
    const result = await mapRef.current.searchAddress(searchText.trim())
    if (result.ok) {
      setSearchStatus('idle')
    } else {
      setSearchStatus('error')
      setSearchError(result.error)
    }
  }

  function chooseThreshold(next: Threshold) {
    setUserThreshold(next)
    bloom.takeControl(Math.min(BLOOM.indexOf(next), BLOOM.length - 1))
  }

  return (
    <div
      ref={mountRef}
      className={
        'border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm ' +
        (fillHeight ? 'h-full' : '')
      }
    >
      <div className={'flex flex-col lg:flex-row ' + (fillHeight ? 'h-full' : '')}>
        {/* Map canvas */}
        <div
          ref={containerRef}
          className={
            'relative flex-1 border-b lg:border-b-0 lg:border-r border-[var(--color-line)] ' +
            (fillHeight ? 'h-[55vh] lg:h-full' : 'h-[520px] lg:h-[640px]')
          }
        >
          {nearViewport ? (
            <IsochroneMap
              ref={mapRef}
              threshold={threshold}
              view={view}
              onTractHover={setHoverProps}
              onTractSelect={setSelected}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-paper-alt)]">
              <p className="font-mono-label text-[11px] text-[var(--color-ink)]/40">Map loads as you reach it</p>
            </div>
          )}

          {caption && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm z-10 pointer-events-none">
              <div className="bg-[var(--color-paper)]/95 backdrop-blur-[1px] border border-[var(--color-line)] shadow-offset-sm p-4">
                <p className="font-serif-heading text-xl md:text-2xl font-semibold text-[var(--color-primary-deep)] leading-snug">
                  {caption.head}
                </p>
                <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed mt-1.5">
                  {caption.body}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={
            'w-full lg:w-[300px] shrink-0 p-5 bg-[var(--color-paper-alt)] overflow-y-auto ' +
            (fillHeight ? 'lg:h-full' : '')
          }
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search an address…"
              className="flex-1 min-w-0 border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/40 focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={searchStatus === 'loading'}
              className="font-mono-label text-xs bg-[var(--color-primary)] text-white border border-[var(--color-primary-deep)] px-3 py-2 shrink-0"
            >
              {searchStatus === 'loading' ? '…' : 'Go'}
            </button>
          </form>
          {searchStatus === 'error' && (
            <p className="text-xs mt-1" style={{ color: '#a5453c' }}>
              {searchError}
            </p>
          )}

          <div className="mt-4">
            <TripPanel props={shown} />
          </div>

          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="font-mono-label text-[10px] text-[var(--color-primary)] underline decoration-[var(--color-accent)] underline-offset-4 mt-2"
            >
              Clear selection
            </button>
          )}

          {!controlled && (
            <div className="mt-4">
              <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">
                Show me
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {MAP_VIEWS.map((v) => {
                  const on = view === v
                  return (
                    <button
                      key={v}
                      onClick={() => setUserView(v)}
                      className="font-mono-label text-[10px] border px-2 py-2 transition-colors duration-150"
                      style={
                        on
                          ? {
                              backgroundColor: 'var(--color-primary)',
                              borderColor: 'var(--color-primary-deep)',
                              color: 'white',
                            }
                          : { borderColor: 'var(--color-line)', color: 'var(--color-ink)' }
                      }
                    >
                      {VIEW_LABELS[v]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
            <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">Reading the map</p>
            {view === 'compare' && (
              <>
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.current.color }} />
                  Sports Illustrated Stadium is faster
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.future.color }} />
                  Etihad Park is faster
                </div>
                <p className="text-xs text-[var(--color-ink)]/50 mt-2">Near-white tracts are roughly a wash.</p>
              </>
            )}
            {view === 'gainers' && (
              <>
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.future.color }} />
                  Gets closer to a home game
                </div>
                <p className="text-xs text-[var(--color-ink)]/50 mt-2">
                  Deeper purple means more minutes saved. Everything else is faded out.
                </p>
              </>
            )}
            {view === 'losers' && (
              <>
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.current.color }} />
                  Gets farther from a home game
                </div>
                <p className="text-xs text-[var(--color-ink)]/50 mt-2">
                  Deeper red means more minutes lost. Everything else is faded out.
                </p>
              </>
            )}
          </div>

          {view === 'compare' && (
            <>
              <div className="mt-4">
                <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">
                  Travel time threshold: {threshold} min
                </p>
                <input
                  type="range"
                  min={0}
                  max={THRESHOLDS.length - 1}
                  step={1}
                  disabled={controlled}
                  value={THRESHOLDS.indexOf(threshold)}
                  onChange={(e) => chooseThreshold(THRESHOLDS[Number(e.target.value)])}
                  className="w-full accent-[var(--color-primary)]"
                />
                <div className="flex justify-between font-mono-label text-[10px] text-[var(--color-ink)]/50">
                  {THRESHOLDS.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {(['current', 'future'] as const).map((key) => {
                  const cfg = SITE_CONFIG[key]
                  const stat = stats?.[key]?.by_threshold[String(threshold)]
                  return (
                    <div key={key} className="flex-1 border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
                      <p className="font-mono-label text-[10px] mb-1" style={{ color: cfg.color }}>
                        {cfg.label}
                      </p>
                      {stat ? (
                        <>
                          <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)]">
                            {formatPopulation(stat.reachable_population)}
                          </p>
                          <p className="text-[11px] text-[var(--color-ink)]/60">{stat.reachable_tracts.toLocaleString()} tracts</p>
                        </>
                      ) : (
                        <p className="text-[11px] text-[var(--color-ink)]/40">Loading…</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <p className="text-[11px] text-[var(--color-ink)]/50 mt-4 leading-relaxed">
            Travel times computed with r5py (transit + 5.0 km/h walk speed), Saturday 6pm departure.
            Isochrones are pre-computed, not routed live in-browser.
          </p>
        </div>
      </div>
    </div>
  )
}
