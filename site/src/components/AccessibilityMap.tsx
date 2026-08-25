import { useEffect, useRef, useState } from 'react'
import IsochroneMap, { type IsochroneMapHandle } from '../map/IsochroneMap'
import { SITE_CONFIG, type StatsFile, THRESHOLDS, type Threshold } from '../map/types'

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toFixed(0)
}

// Live embed of the accessibility-comparison view from the standalone map app in `web/` --
// same data, same MapLibre logic, restyled to match this site and with the demographic-cluster
// view intentionally left out (k-means isn't part of what this project defends as its modeling
// approach; see the README).
export default function AccessibilityMap() {
  const [threshold, setThreshold] = useState<Threshold>(60)
  const [stats, setStats] = useState<StatsFile | null>(null)
  const [hoverProps, setHoverProps] = useState<Record<string, unknown> | null>(null)
  const [searchText, setSearchText] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [searchError, setSearchError] = useState<string | null>(null)
  const mapRef = useRef<IsochroneMapHandle>(null)

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

  const hoverRba = hoverProps?.[SITE_CONFIG.current.minutesField]
  const hoverEtihad = hoverProps?.[SITE_CONFIG.future.minutesField]

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm">
      <div className="flex flex-col lg:flex-row">
        {/* Map canvas */}
        <div className="relative h-[520px] lg:h-[640px] flex-1 border-b lg:border-b-0 lg:border-r border-[var(--color-line)]">
          <IsochroneMap ref={mapRef} threshold={threshold} onTractHover={setHoverProps} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[300px] shrink-0 p-5 bg-[var(--color-paper-alt)] overflow-y-auto">
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

          <div className="mt-4 border border-[var(--color-line)] bg-[var(--color-paper)] p-3 min-h-[5rem]">
            {hoverProps ? (
              <>
                <p className="font-serif-heading text-sm font-semibold text-[var(--color-primary-deep)]">
                  {hoverProps.neighborhood ? String(hoverProps.neighborhood) : `Tract ${String(hoverProps.GEOID)}`}
                </p>
                <p className="font-mono-label text-[10px] text-[var(--color-ink)]/50 mb-2">
                  {hoverProps.neighborhood ? `Tract ${String(hoverProps.GEOID)}` : 'No NYC neighborhood match (NJ side)'}
                </p>
                <p className="text-sm text-[var(--color-ink)]/80">
                  Red Bull Arena: {hoverRba != null ? `${Math.round(Number(hoverRba))} min` : '90+ min'}
                </p>
                <p className="text-sm text-[var(--color-ink)]/80">
                  Etihad Park: {hoverEtihad != null ? `${Math.round(Number(hoverEtihad))} min` : '90+ min'}
                </p>
                <p className="text-sm text-[var(--color-ink)]/80">
                  Population: {Number(hoverProps.population ?? 0).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-ink)]/40">Hover or search a tract for details</p>
            )}
          </div>

          <div className="mt-4 border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
            <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">Reading the map</p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.current.color }} />
              Red Bull Arena is faster
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]/80">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SITE_CONFIG.future.color }} />
              Etihad Park is faster
            </div>
            <p className="text-xs text-[var(--color-ink)]/50 mt-2">Near-white tracts are roughly a wash.</p>
          </div>

          <div className="mt-4">
            <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">
              Travel time threshold: {threshold} min
            </p>
            <input
              type="range"
              min={0}
              max={THRESHOLDS.length - 1}
              step={1}
              value={THRESHOLDS.indexOf(threshold)}
              onChange={(e) => setThreshold(THRESHOLDS[Number(e.target.value)])}
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

          <p className="text-[11px] text-[var(--color-ink)]/50 mt-4 leading-relaxed">
            Travel times computed with r5py (transit + 5.0 km/h walk speed), Saturday 6pm departure.
            Isochrones are pre-computed, not routed live in-browser.
          </p>
        </div>
      </div>
    </div>
  )
}
