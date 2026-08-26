import { scenarios } from '../data/scenarios'

const CAPACITY = 25000

function Bar({ row }: { row: (typeof scenarios)[number] }) {
  const widthPct = (row.attendance / CAPACITY) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <p className="text-sm font-medium text-[var(--color-ink)] flex items-center gap-2">
          {row.label}
          {row.note && (
            <span className="font-mono-label text-[10px] text-[var(--color-primary)]/60">{row.note}</span>
          )}
        </p>
        <p className="font-mono text-xs text-[var(--color-ink)]/70 shrink-0">
          {row.attendance.toLocaleString()} · {row.pctOfCapacity.toFixed(0)}% capacity
        </p>
      </div>
      <div
        className={
          row.kind === 'baseline'
            ? 'h-3 bg-[var(--color-paper-alt)] border border-dashed border-[var(--color-line)]'
            : 'h-3 bg-[var(--color-paper-alt)] border border-[var(--color-line)]'
        }
      >
        <div
          className="h-full"
          style={{
            width: `${widthPct}%`,
            backgroundColor: row.kind === 'baseline' ? 'var(--color-ink)' : 'var(--color-primary)',
            opacity: row.kind === 'baseline' ? 0.45 : 1,
            ...(row.kind === 'baseline'
              ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)' }
              : {}),
          }}
        />
      </div>
    </div>
  )
}

export default function ScenarioBars() {
  const baseline = scenarios.filter((r) => r.kind === 'baseline')
  const range = scenarios.filter((r) => r.kind === 'range')

  return (
    <div className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm p-6">
      <div className="space-y-6">
        {baseline.map((row) => (
          <Bar key={row.label} row={row} />
        ))}

        {/* Bracket the two post-move scenarios together: they're one reported range, not
            two independent point forecasts. */}
        <div className="relative pl-5">
          <div className="absolute left-0 top-1 bottom-1 w-3 border-l-2 border-t-2 border-b-2 border-[var(--color-accent)] rounded-none" />
          <span className="font-mono-label text-[9px] text-[var(--color-accent)] absolute -left-0.5 -top-4">
            est. range
          </span>
          <div className="space-y-5">
            {range.map((row) => (
              <Bar key={row.label} row={row} />
            ))}
          </div>
        </div>
      </div>
      <p className="font-mono-label text-[10px] text-[var(--color-ink)]/50 mt-5">
        Projected 2027 home attendance, Etihad Park capacity = 25,000. Hatched bar = counterfactual
        reference (what staying at Sports Illustrated Stadium would look like), not part of the estimate.
        Bracket = the low–capacity-cap range this project actually reports for the move.
      </p>
    </div>
  )
}
