import { mechanismNetPct, mechanismShift } from '../../data/chartData'
import ChartFrame from './ChartFrame'

// Diverging bars, again in CSS rather than SVG so the 21 category labels stay readable at any
// width. Each row is a full-width track with a zero line down the middle; the bar grows left or
// right from there.
const SPAN = Math.max(...mechanismShift.map((b) => Math.abs(b.pct)))
/** Position of the zero line across the track. Off-center rather than at 50%: the biggest
 * negative bar (-3.1%) is tiny next to the biggest positive one (+21.8%), so a centered zero
 * line left almost the entire left half of every row empty. Both directions share one scale
 * (see `width` below), so this just gives the side that actually has data the room. */
const HALF = 14
/** How far the longest bar is allowed to travel from the zero line, leaving a track-only margin
 * on each side for the zero line itself. */
const MAX_EXTENT = 84

const ACCESSIBILITY = 'People who can reach the stadium'

/** One decimal reads fine down at the "+21.8%" end, but it flattens the five smallest bars into
 * "-0.0%"/"+0.0%" -- indistinguishable from zero and from each other. Two decimals below 1%
 * keeps those real, if tiny, effects legible instead of dropping their labels altogether. */
function formatPct(pct: number) {
  const decimals = Math.abs(pct) < 1 ? 2 : 1
  return `${pct > 0 ? '+' : ''}${pct.toFixed(decimals)}%`
}

export default function MechanismChart({ label }: { label?: string }) {
  return (
    <ChartFrame
      label={label}
      title="Reach drives almost the whole predicted jump"
      deck={
        <>
          Everything else the model knows about a match — the opponent, the weather, the day of the
          week, the team's form — barely moves the answer. Reach is also the one input I gave its
          own model, so it had the best chance to matter.
        </>
      }
      note={
        <>
          Linear accessibility stage plus TreeSHAP on the CatBoost residual, averaged over 54
          matched fixtures. Effects combine multiplicatively to a net {mechanismNetPct.toFixed(0)}%
          change.
        </>
      }
    >
      <ul className="space-y-1">
        {mechanismShift.map((b) => {
          const width = (Math.abs(b.pct) / SPAN) * MAX_EXTENT
          const positive = b.pct >= 0
          const isReach = b.label === ACCESSIBILITY
          const color = isReach
            ? 'var(--color-accent)'
            : positive
              ? 'var(--color-primary)'
              : 'var(--color-no)'
          const valueText = formatPct(b.pct)
          return (
            <li key={b.label} className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5">
              <p
                className={
                  'text-[12px] leading-tight sm:w-56 sm:shrink-0 sm:text-right ' +
                  (isReach
                    ? 'text-[var(--color-primary-deep)] font-semibold'
                    : 'text-[var(--color-ink)]/80')
                }
              >
                {b.label}
              </p>
              {/* Value labels live in their own fixed-width columns outside the track, rather
                  than floating at the bar's own tip -- a long bar (the reach bar reaches 84% of
                  the track) left no room for an outside label there, and the only fix that didn't
                  either clip the text or print it on top of the bar's own fill was to stop
                  anchoring the label to the bar at all. */}
              <div className="flex-1 grid grid-cols-[2.75rem_1fr_3.25rem] items-center gap-x-2">
                <span className="font-mono text-[11px] text-[var(--color-ink)]/75 text-right whitespace-nowrap">
                  {!positive ? valueText : ''}
                </span>
                <div className="relative h-4">
                  {/* Zero line */}
                  <div
                    className="absolute inset-y-0 w-px bg-[var(--color-ink)]/30"
                    style={{ left: `${HALF}%` }}
                  />
                  <div
                    className="absolute inset-y-0"
                    style={{
                      backgroundColor: color,
                      width: `${width}%`,
                      left: positive ? `${HALF}%` : `${HALF - width}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-[var(--color-ink)]/75 whitespace-nowrap">
                  {positive ? valueText : ''}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] text-[var(--color-ink)]/60 mt-3">
        Effect on predicted attendance, moving from Harrison to Queens.
      </p>
    </ChartFrame>
  )
}
