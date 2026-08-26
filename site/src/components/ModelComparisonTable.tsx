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
      <table className="w-full border-collapse min-w-[620px]">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className={th} rowSpan={2}>Model</th>
            <th className={`${th} text-center border-l border-[var(--color-line)]`} colSpan={2}>
              Random split
            </th>
            <th className={`${th} text-center border-l border-[var(--color-line)]`} colSpan={2}>
              Held-out venue
            </th>
          </tr>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className={`${th} border-l border-[var(--color-line)]`}>R&sup2;</th>
            <th className={th}>Off by (fans)</th>
            <th className={`${th} border-l border-[var(--color-line)]`}>R&sup2;</th>
            <th className={th}>Off by (fans)</th>
          </tr>
        </thead>
        <tbody>
          {modelComparison.map((row, i) => (
            <tr
              key={row.model}
              className={i !== modelComparison.length - 1 ? 'border-b border-[var(--color-line)]' : ''}
            >
              <td className={`${td} font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)]`}>
                {row.model}
                <span className="block text-[var(--color-ink)]/55 text-xs font-sans mt-0.5 leading-snug">
                  {row.features}
                </span>
              </td>
              <td
                className={`${td} font-mono whitespace-nowrap border-l border-[var(--color-line)]`}
                style={{ color: color(row.naiveR2) }}
              >
                {fmtScore(row.naiveR2)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.naiveMae)}</td>
              <td
                className={`${td} font-mono whitespace-nowrap border-l border-[var(--color-line)]`}
                style={{ color: color(row.groupedR2) }}
              >
                {row.groupedR2 === null ? 'not tested' : fmtScore(row.groupedR2)}
              </td>
              <td className={`${td} font-mono whitespace-nowrap`}>{fmtCount(row.groupedMae)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        Two metrics, two jobs. R&sup2; answers whether the model beat guessing the league average, where 0
        means it did not. "Off by" is mean absolute error in actual fans, which is the number you can feel.
        A random split lets a venue's other games leak into its own test fold; holding out a venue never
        trains and tests on the same team and venue together, which is the test that matters here, since
        Gotham is a familiar team but Etihad Park is a brand new venue.
      </p>
    </div>
  )
}
