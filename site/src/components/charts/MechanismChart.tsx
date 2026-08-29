import { mechanismNetPct, mechanismShift } from '../../data/chartData'
import ChartFrame from './ChartFrame'

// Diverging bars, again in CSS rather than SVG so the 21 category labels stay readable at any
// width. Each row is a full-width track with a zero line down the middle; the bar grows left or
// right from there.
const SPAN = Math.max(...mechanismShift.map((b) => Math.abs(b.pct)))
/** Position of the zero line across the track. */
const HALF = 50
/** How far the longest bar is allowed to travel from the zero line. Deliberately short of the
 * full half-width: the value labels sit just past the bar ends, and at a full 50% the biggest
 * bar pushed its own label off the edge of the chart. */
const MAX_EXTENT = 42
/** Below this the bar is visually nothing, so the value label is dropped rather than crowding the
 * zero line with a column of "0.0%". */
const NOISE = 0.15

const ACCESSIBILITY = 'People who can reach the stadium'

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
          change. Bars below 0.2% are drawn but not labelled.
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
          return (
            <li
              key={b.label}
              className="grid grid-cols-[1fr] sm:grid-cols-[14rem_1fr] gap-x-3 items-center"
            >
              <p
                className={
                  'text-[12px] leading-tight sm:text-right ' +
                  (isReach
                    ? 'text-[var(--color-primary-deep)] font-semibold'
                    : 'text-[var(--color-ink)]/80')
                }
              >
                {b.label}
              </p>
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
                {Math.abs(b.pct) >= NOISE && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--color-ink)]/75 whitespace-nowrap"
                    style={
                      positive
                        ? { left: `calc(${HALF + width}% + 6px)` }
                        : { right: `calc(${HALF + width}% + 6px)` }
                    }
                  >
                    {b.pct > 0 ? '+' : ''}
                    {b.pct.toFixed(1)}%
                  </span>
                )}
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
