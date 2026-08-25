// From output/queens_attendance_by_model.csv and output/queens_counterfactual_range_summary.csv.
// Gotham's actual 2026 average attendance: 10,900 (code/11_catboost_attendance_model.ipynb).
const GOTHAM_2026_ACTUAL = 10900

type Row = {
  model: string
  method: string
  naive: number | null
  honest: number | null
  note?: string
}

const ROWS: Row[] = [
  {
    model: 'Linear + CatBoost residual (combined model)',
    method: 'log(metro_size) linear stage + CatBoost on the residual',
    naive: 12796,
    honest: 13656,
  },
  {
    model: 'Synthetic control',
    method: "Gotham's own pre/post trajectory vs. comparable teams",
    naive: null,
    honest: null,
    note: '22,137 – 25,000',
  },
  {
    model: 'CatBoost only (retired 2026-08-25)',
    method: 'metro_size as a raw tree feature',
    naive: 8361,
    honest: 8361,
    note: 'flat — capped and uncapped metro_size gave the identical prediction',
  },
  {
    model: 'Linear, raw metro_size (retired)',
    method: 'row-level regression, no log transform',
    naive: 44890,
    honest: 105688,
    note: 'excluded — unusable extrapolation',
  },
]

function fmt(v: number | null) {
  if (v === null) return '—'
  return v.toLocaleString()
}

export default function QueensPredictionTable() {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            <th className="font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight">
              Model
            </th>
            <th className="font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight">
              Method
            </th>
            <th className="font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-right leading-tight">
              Point estimate
            </th>
            <th className="font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-right leading-tight">
              Debut-adjusted
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr
              key={row.model}
              className={i !== ROWS.length - 1 ? 'border-b border-[var(--color-line)]' : ''}
              style={row.model.includes('retired') ? { opacity: 0.5 } : undefined}
            >
              <td className="px-3 py-3 text-sm font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)] whitespace-nowrap">
                {row.model}
              </td>
              <td className="px-3 py-3 text-xs text-[var(--color-ink)]/70">{row.method}</td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap">{fmt(row.naive)}</td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap">
                {row.note ? row.note : fmt(row.honest)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        Gotham's real 2026 average attendance: <strong>{GOTHAM_2026_ACTUAL.toLocaleString()}</strong>. The
        combined model's own 95%-CI-implied range is wide (roughly 9,200–25,000, capacity-capped at the
        top) — the point estimate above is the center of that range, not a precise figure. The two faded
        rows are retired: CatBoost alone couldn't extrapolate <code>metro_size</code> past its training
        range at all (identical prediction whether fed Etihad's real catchment or the training max, capped
        — a bug, not a feature), and a pure linear fit on raw <code>metro_size</code> ran away in the other
        direction (predicts 4× over stadium capacity). Both problems are why the current model splits
        accessibility into its own log-transformed linear stage and lets CatBoost handle everything else.
        Synthetic control isn't a row-level fit at all: it answers a different question — Gotham's own
        trajectory vs. comparable teams' own moves — which is why its range sits above the predictive models.
      </p>
    </div>
  )
}
