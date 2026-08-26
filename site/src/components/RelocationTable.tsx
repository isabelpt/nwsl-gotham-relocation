import { relocations } from '../data/relocations'

function fmtPop(n: number) {
  return n.toLocaleString()
}

function fmtPct(n: number) {
  return `+${n.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
}

export default function RelocationTable() {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[760px]">
        <thead>
          <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
            {['Team', 'Move', 'Old 60-min pop.', 'New 60-min pop.', 'Access. change', 'Raw att. change'].map(
              (h, i) => (
                <th
                  key={h}
                  className={
                    'font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 leading-tight ' +
                    (i >= 2 ? 'text-right' : 'text-left')
                  }
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {relocations.map((r, i) => (
            <tr
              key={r.team}
              className={
                (i !== relocations.length - 1 ? 'border-b border-[var(--color-line)] ' : '') +
                (r.status === 'future' ? 'bg-[var(--color-accent)]/10' : '')
              }
              style={r.status === 'excluded' ? { opacity: 0.5 } : undefined}
            >
              <td className="px-3 py-3 font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)] whitespace-nowrap">
                {r.team}
              </td>
              <td className="px-3 py-3 text-xs text-[var(--color-ink)]/70">
                {r.oldVenue} → {r.newVenue}
              </td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap">{fmtPop(r.oldPop)}</td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap">{fmtPop(r.newPop)}</td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap text-[var(--color-primary)]">
                {fmtPct(r.accessChangePct)}
              </td>
              <td className="px-3 py-3 text-sm font-mono text-right whitespace-nowrap">
                {r.attChangePct === null ? (
                  <span className="text-[var(--color-ink)]/50">not yet moved</span>
                ) : (
                  <>
                    {fmtPct(r.attChangePct)}
                    {r.status === 'excluded' && <span className="text-[var(--color-ink)]/50">*</span>}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        San Diego, Seattle, and Washington Spirit are listed in ascending order of reach gain, and their
        attendance changes rise in the same order. <strong>*Kansas City is excluded</strong> because every
        2024 to 2026 home game reports the identical sellout figure, so its change reflects the cap rather
        than demand. Its huge reach gain also comes off almost nothing: one hourly Saturday bus route
        serves the old stadium, putting just two tracts within an hour. These changes are raw, not
        corrected for league growth.
      </p>
    </div>
  )
}
