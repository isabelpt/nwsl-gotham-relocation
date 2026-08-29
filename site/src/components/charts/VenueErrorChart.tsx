import { venueErrors } from '../../data/chartData'
import ChartFrame from './ChartFrame'

// Built from CSS-sized divs rather than SVG: a 17-row bar chart in a fixed viewBox either
// squashes its labels on a phone or wastes half the width on a desktop. Percentage widths solve
// both, and every label stays real, selectable text.
const MAX = Math.max(...venueErrors.map((v) => v.mae))
/** The three biggest misses -- which are the three best-drawing grounds, the point of the chart. */
const WORST = new Set(
  [...venueErrors]
    .sort((a, b) => b.mae - a.mae)
    .slice(0, 3)
    .map((v) => `${v.team}|${v.venue}`),
)

export default function VenueErrorChart({ label }: { label?: string }) {
  return (
    <ChartFrame
      label={label}
      title="The model misses hardest where the crowds are biggest"
      deck={
        <>
          Each venue in turn is removed from training, then predicted from the other 16. The three
          worst misses are the three best-drawing grounds, which the model has no way to reach once
          it has never seen them.
        </>
      }
      note={
        <>
          Leave-one-venue-out cross-validation across {venueErrors.length} team–venue pairs. Bars
          show the average miss in fans; the figure in brackets is that venue's own average crowd.
        </>
      }
    >
      <ul className="space-y-1.5">
        {venueErrors.map((v) => {
          const worst = WORST.has(`${v.team}|${v.venue}`)
          return (
            <li key={`${v.team}-${v.venue}`} className="grid grid-cols-[1fr] sm:grid-cols-[15rem_1fr] gap-x-3 items-center">
              <p className="text-[12px] leading-tight text-[var(--color-ink)]/85 sm:text-right">
                {v.team} <span className="text-[var(--color-ink)]/55">&middot; {v.venue}</span>{' '}
                <span className="font-mono text-[11px] text-[var(--color-ink)]/50">
                  ({v.meanAttendance.toLocaleString()})
                </span>
              </p>
              {/* The bar lives in its own flexible track and the value in a fixed-width column,
                  so the longest bar can reach 100% of the track without shoving its own label
                  off the end of the row. */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div
                    className="h-4"
                    style={{
                      width: `${(v.mae / MAX) * 100}%`,
                      backgroundColor: worst ? 'var(--color-no)' : 'var(--color-primary)',
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[11px] text-[var(--color-ink)]/75 whitespace-nowrap">
                  {v.mae.toLocaleString()}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] text-[var(--color-ink)]/60 mt-3">
        Average miss, in fans, when that venue is held out of training entirely.
      </p>
    </ChartFrame>
  )
}
