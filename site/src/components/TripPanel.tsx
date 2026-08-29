import { useEffect, useState } from 'react'
import { loadTradeStats, type TradeStats } from '../map/tractData'
import { SITE_CONFIG } from '../map/types'

const UNREACHABLE = 999

function readMinutes(props: Record<string, unknown> | null, field: string): number | null {
  if (!props) return null
  const raw = props[field]
  if (raw == null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function formatMinutes(v: number | null) {
  return v == null ? '90+ min' : `${Math.round(v)} min`
}

/** "Your trip to the game": what one place on the map actually gains or loses from the move.
 *
 * This is deliberately not a prediction of attendance for a clicked location -- no model here
 * maps a point on the map to a crowd size, and inventing one would be dishonest. What the data
 * does support, per tract and directly, is the travel time to each stadium, so that is what
 * this reports. */
export default function TripPanel({ props }: { props: Record<string, unknown> | null }) {
  const [stats, setStats] = useState<TradeStats | null>(null)

  // Only once the reader has actually picked somewhere. The aggregates ride on the ~1.8MB tract
  // file, and this panel spends most of its life showing an empty state that doesn't need them.
  // loadTradeStats memoises, so re-firing as the selection changes costs nothing.
  useEffect(() => {
    if (!props) return
    loadTradeStats().then(setStats).catch(() => setStats(null))
  }, [props])

  if (!props) {
    return (
      <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
        <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-1.5">
          Your trip to the game
        </p>
        <p className="text-sm text-[var(--color-ink)]/50 leading-relaxed">
          Click anywhere on the map, or search an address, to see how that neighbourhood's trip
          changes.
        </p>
      </div>
    )
  }

  const rba = readMinutes(props, SITE_CONFIG.current.minutesField)
  const etihad = readMinutes(props, SITE_CONFIG.future.minutesField)
  const neighborhood = props.neighborhood ? String(props.neighborhood) : null

  // Both legs must be routable for a difference to mean anything. Where one end is outside the
  // routing window the honest answer is "we can't say by how much", not a number built on the
  // 999-minute sentinel.
  const comparable = rba != null && etihad != null && rba < UNREACHABLE && etihad < UNREACHABLE
  const change = comparable ? Math.round(etihad! - rba!) : null
  const closer = change != null && change < 0

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
      <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-1.5">
        Your trip to the game
      </p>

      <p className="font-serif-heading text-base font-semibold text-[var(--color-primary-deep)] leading-snug">
        {neighborhood ?? 'New Jersey side'}
      </p>
      <p className="font-mono-label text-[10px] text-[var(--color-ink)]/50 mb-2.5">
        Tract {String(props.GEOID)}
      </p>

      {change != null && (
        <p
          className="font-serif-heading text-3xl font-semibold leading-none mb-1"
          style={{ color: closer ? SITE_CONFIG.future.color : SITE_CONFIG.current.color }}
        >
          {closer ? `${Math.abs(change)} min closer` : `${change} min farther`}
        </p>
      )}
      {change == null && (
        <p className="text-sm text-[var(--color-ink)]/70 leading-snug mb-1">
          Outside the 90-minute window from at least one stadium, so the two trips can't be
          compared directly.
        </p>
      )}

      <dl className="mt-3 border-t border-[var(--color-line)] pt-2.5 space-y-1">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-[var(--color-ink)]/70">Today, to Harrison</dt>
          <dd className="text-[13px] font-mono whitespace-nowrap">{formatMinutes(rba)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-[var(--color-ink)]/70">From 2028, to Queens</dt>
          <dd className="text-[13px] font-mono whitespace-nowrap">{formatMinutes(etihad)}</dd>
        </div>
      </dl>

      {stats && change != null && (
        <p className="text-xs text-[var(--color-ink)]/60 leading-relaxed mt-2.5 border-t border-[var(--color-line)] pt-2.5">
          {closer ? (
            <>
              One of <strong>{stats.nycBetterPop.toLocaleString()}</strong> people on the New York
              side who end up closer to a home game.
            </>
          ) : (
            <>
              One of <strong>{stats.njWorsePop.toLocaleString()}</strong> people, mostly in New
              Jersey, who end up farther away.
            </>
          )}
        </p>
      )}
    </div>
  )
}
