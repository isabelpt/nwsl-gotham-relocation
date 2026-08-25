import { modelComparison } from '../data/modelComparison'

const th = 'font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight'
const td = 'px-3 py-3 text-sm'

function fmtScore(v: number | null) {
  if (v === null) return '—'
  return v.toFixed(v < 1 && v > -1 ? 3 : 2)
}

function fmtCount(v: number | null) {
  if (v === null) return '—'
  return Math.round(v).toLocaleString()
}

function color(v: number | null) {
  if (v === null) return 'var(--color-ink)'
  return v >= 0.1 ? 'var(--color-primary)' : '#a5453c'
}

export default function ModelComparisonTable() {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className={th}>Model</th>
            <th className={th}>Features</th>
            <th className={th} colSpan={4}>Naive fit</th>
            <th className={th} colSpan={4}>Held-out-venue fit</th>
          </tr>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className={th}></th>
            <th className={th}></th>
            <th className={th}>R²</th>
            <th className={th}>Pearson r</th>
            <th className={th}>MAE</th>
            <th className={th}>RMSE</th>
            <th className={th}>R²</th>
            <th className={th}>Pearson r</th>
            <th className={th}>MAE</th>
            <th className={th}>RMSE</th>
          </tr>
        </thead>
        <tbody>
          {modelComparison.map((row, i) => (
            <tr key={row.model} className={i !== modelComparison.length - 1 ? 'border-b border-[var(--color-line)]' : ''}>
              <td className={`${td} font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)] whitespace-nowrap`}>
                {row.model}
              </td>
              <td className={`${td} text-[var(--color-ink)]/70 text-xs`}>{row.features}</td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.naiveR2) }}>
                {fmtScore(row.naiveR2)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.naivePearsonR) }}>
                {fmtScore(row.naivePearsonR)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.naiveMae)}</td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.naiveRmse)}</td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.groupedR2) }}>
                {row.groupedR2 === null ? '— (not tested)' : fmtScore(row.groupedR2)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.groupedPearsonR) }}>
                {row.groupedPearsonR === null ? '—' : fmtScore(row.groupedPearsonR)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.groupedMae)}</td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.groupedRmse)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        "Naive" fit lets a venue's other games leak into its own held-out fold. "Held-out-venue" fit
        (Leave-One-Venue-Out) never trains and tests on the same (team, venue) pair — the honest test of
        whether the model generalizes to a venue it hasn't seen, which is the question that actually
        matters here: Gotham is always in-sample as a <em>team</em>, only Etihad Park as a <em>venue</em> is
        genuinely novel. R² and Pearson r are computed on pooled out-of-fold predictions (every held-out
        fold's predictions concatenated, then scored once), the same way for every model. MAE/RMSE (raw
        attendance units, fans) are shown alongside R² because R² alone can mislead at this grain — a
        low-variance venue can post a terrible R² on a small absolute error.
      </p>
    </div>
  )
}
