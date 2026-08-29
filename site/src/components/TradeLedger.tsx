import { useEffect, useState } from 'react'
import { loadTradeStats, type TradeStats } from '../map/tractData'
import { useInView, usePrefersReducedMotion } from '../scroll/useInView'
import { SITE_CONFIG } from '../map/types'

/** Counts a number up when it arrives on screen. Cheap motion that makes the two sides of the
 * trade land as a comparison rather than as two static figures. Skipped entirely under
 * prefers-reduced-motion, which just renders the final value. */
function useCountUp(target: number, { active, reduced }: { active: boolean; reduced: boolean }) {
  /** `null` means "no animation has taken over", and the caller renders the true value. The
   * animation only ever writes a number here once it is genuinely running. This ordering
   * matters: requestAnimationFrame and IntersectionObserver are both throttled to nothing in
   * a background tab, an uncomposited webview, or a thumbnail capture, and in some of those
   * `document.visibilityState` still reports "visible". Starting from 0 instead would leave
   * the headline figures reading 0.00M in exactly those cases -- a wrong number is far worse
   * than a missing animation. */
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    if (!active || reduced) return

    const DURATION = 1100
    let raf = 0
    let start = 0

    function tick(now: number) {
      if (!start) start = now
      const t = Math.min(1, (now - start) / DURATION)
      // Ease-out cubic: fast to begin, settling onto the real figure.
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setValue(null) // hand back to the true value, so it can never end up stale
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, reduced])

  return value ?? target
}

function millions(n: number) {
  return `${(n / 1_000_000).toFixed(2)}M`
}

function Side({
  value,
  headline,
  detail,
  color,
  active,
  reduced,
  ready,
}: {
  value: number
  headline: string
  detail: string
  color: string
  active: boolean
  reduced: boolean
  /** False until the figures have loaded. Renders an en dash rather than a confident 0.00M,
   * which would be a wrong number rather than an absent one. */
  ready: boolean
}) {
  const shown = useCountUp(value, { active, reduced })
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-offset-sm flex-1">
      <p className="font-serif-heading text-4xl md:text-5xl font-semibold tabular-nums" style={{ color }}>
        {ready ? millions(shown) : '–'}
      </p>
      <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] mt-2 leading-snug">
        {headline}
      </p>
      <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-1.5">{detail}</p>
    </div>
  )
}

/** The trade at the centre of the story: nearly all of New York City moves closer to a Gotham
 * home game, while most of the New Jersey side -- the club's current catchment -- moves away.
 * Every figure is computed from tracts.geojson at runtime (see map/tractData.ts), so these can
 * never drift from the map beside them. */
export default function TradeLedger() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const [stats, setStats] = useState<TradeStats | null>(null)
  const [failed, setFailed] = useState(false)

  // Deferred until the reader is near this block. The aggregates come from the same ~1.8MB tract
  // file the map draws, and fetching it on mount meant every visitor paid for it at the top of
  // the page, before anything on screen needed it.
  useEffect(() => {
    if (!inView) return
    loadTradeStats()
      .then(setStats)
      .catch(() => setFailed(true))
  }, [inView])

  if (failed) return null

  const ready = stats != null && inView

  return (
    <div ref={ref}>
      <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
        The trade, in people
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Side
          value={stats?.nycBetterPop ?? 0}
          headline="New Yorkers get closer"
          detail={
            stats
              ? `${stats.nycBetterTracts.toLocaleString()} of the city's tracts move nearer to a home game, by ${Math.round(stats.avgMinutesSaved)} minutes on average.`
              : ''
          }
          color={SITE_CONFIG.future.color}
          active={ready}
          reduced={reduced}
          ready={stats != null}
        />
        <Side
          value={stats?.njWorsePop ?? 0}
          headline="New Jerseyans get farther"
          detail={
            stats
              ? `${stats.njWorseTracts.toLocaleString()} tracts on the club's current side of the river lose ground, by ${Math.round(stats.avgMinutesLost)} minutes on average.`
              : ''
          }
          color={SITE_CONFIG.current.color}
          active={ready}
          reduced={reduced}
          ready={stats != null}
        />
      </div>
      {stats && (
        <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3 max-w-3xl">
          Measured against the one-hour mark specifically,{' '}
          <strong>{stats.ringGainedPop.toLocaleString()}</strong> people move inside it and{' '}
          <strong>{stats.ringLostPop.toLocaleString()}</strong> drop out. Counts cover tracts within
          90 minutes of either stadium, the widest travel-time ring this project modelled.
        </p>
      )}
    </div>
  )
}
