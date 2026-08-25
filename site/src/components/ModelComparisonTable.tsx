import { modelComparison } from '../data/modelComparison'

const th = 'font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight'
const td = 'px-3 py-3 text-sm'

function fmt(v: number | null) {
  if (v === null) return '—'
  return v.toFixed(v < 1 && v > -1 ? 3 : 2)
}

function color(v: number | null) {
  if (v === null) return 'var(--color-ink)'
  return v >= 0.1 ? 'var(--color-primary)' : '#a5453c'
}

export default function ModelComparisonTable() {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className={th}>Model</th>
            <th className={th}>Features</th>
            <th className={th}>Naive fit</th>
            <th className={th}>Held-out-team fit</th>
          </tr>
        </thead>
        <tbody>
          {modelComparison.map((row, i) => (
            <tr key={row.model} className={i !== modelComparison.length - 1 ? 'border-b border-[var(--color-line)]' : ''}>
              <td className={`${td} font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)] whitespace-nowrap`}>
                {row.model}
              </td>
              <td className={`${td} text-[var(--color-ink)]/70 text-xs`}>{row.features}</td>
              <td className={`${td} font-mono whitespace-nowrap`}>
                {row.naiveMetric} = {fmt(row.naiveValue)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.groupedValue) }}>
                {row.groupedValue === null ? '— (not tested)' : `${row.groupedMetric} = ${fmt(row.groupedValue)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        "Naive" fit lets a team's other seasons leak into its own held-out fold. "Held-out-team" fit
        (GroupKFold / Leave-One-Team-Out) never trains and tests on the same team — the honest test of
        whether the model generalizes to a team it hasn't seen.
      </p>
    </div>
  )
}
