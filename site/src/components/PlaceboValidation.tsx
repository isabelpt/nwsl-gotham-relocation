import { placebos } from '../data/relocations'
import scmPlacebo from '../assets/figures/scm-placebo-validation.png'

export default function PlaceboValidation() {
  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm">
      <div className="bg-white border-b border-[var(--color-line)]">
        <img
          src={scmPlacebo}
          alt="Two line charts, Seattle Reign and Washington Spirit, each showing actual home attendance against a synthetic no-move counterfactual from 2016 through 2026, with the relocation season marked by a vertical line. Both actual series rise well above their counterfactual after the move."
          className="w-full h-auto block"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 p-5 items-start">
        <div className="overflow-x-auto -mx-1 px-1">
        <table className="border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line)]">
              {['Team', 'Method says', 'Really did', 'Gap'].map((h, i) => (
                <th
                  key={h}
                  className={
                    'font-mono-label text-[10px] font-medium text-[var(--color-primary)] px-3 py-2 leading-tight ' +
                    (i === 0 ? 'text-left' : 'text-right')
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {placebos.map((p, i) => (
              <tr key={p.team} className={i !== placebos.length - 1 ? 'border-b border-[var(--color-line)]' : ''}>
                <td className="px-3 py-2 text-[13px] font-serif-heading text-[var(--color-primary-deep)] whitespace-nowrap">
                  {p.team}
                </td>
                <td className="px-3 py-2 text-[13px] font-mono text-right">+{p.scmImpliedLiftPct}%</td>
                <td className="px-3 py-2 text-[13px] font-mono text-right">+{p.actualLiftPct}%</td>
                <td className="px-3 py-2 text-[13px] font-mono text-right text-[var(--color-primary)]">
                  {(p.actualLiftPct - p.scmImpliedLiftPct).toFixed(1)} pp
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="space-y-2.5">
          <p className="text-[15px] text-[var(--color-ink)]/85 leading-snug">
            Gotham's move is in the future, so there is nothing to check it against. Refitting the same
            method on Seattle and Washington Spirit gives me that check, and both pull away from their
            no-move twin the moment they relocate.
          </p>
          <p className="text-[15px] text-[var(--color-ink)]/85 leading-snug">
            The method lands 57 to 65 points below what each team really did. That gap is the useful part:
            it separates growth they would have gotten anyway from lift that came from moving, and only the
            second half gets applied to Gotham.
          </p>
        </div>
      </div>

      <p className="px-5 py-2.5 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
        Both look strong against their donor pools, but a permutation test returns p = 0.2 for each, which
        is not significant. With only four teams available to permute, it cannot rule out chance. Too few
        NWSL teams have moved, and no modeling choice fixes that.
      </p>
    </div>
  )
}
