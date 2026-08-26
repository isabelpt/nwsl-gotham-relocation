import { modelComparison } from '../data/modelComparison'

const th = 'font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight'
const td = 'px-3 py-3 text-sm'

function fmtScore(v: number | null) {
  if (v === null) return '\u2013'
  return v.toFixed(v < 1 && v > -1 ? 3 : 2)
}

function fmtCount(v: number | null) {
  if (v === null) return '\u2013'
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
                {row.groupedR2 === null ? 'not tested' : fmtScore(row.groupedR2)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`} style={{ color: color(row.groupedPearsonR) }}>
                {row.groupedPearsonR === null ? '\u2013' : fmtScore(row.groupedPearsonR)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.groupedMae)}</td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.groupedRmse)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        The naive fit lets a venue's other games leak into its own test fold. The held-out-venue fit never
        trains and tests on the same team and venue together, which is the test that matters here: Gotham
        is a familiar team, but Etihad Park is a brand new venue. MAE and RMSE are in fans, and they sit
        next to R&sup2; because R&sup2; alone can mislead at this grain.
      </p>
    </div>
  )
}
