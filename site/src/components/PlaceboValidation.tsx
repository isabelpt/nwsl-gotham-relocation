import { placebos } from '../data/relocations'
import scmPlacebo from '../assets/figures/scm-placebo-validation.png'

const TAKEAWAYS = [
  {
    head: 'Gotham has not moved yet, so I tested on teams that have.',
    body: "Normally you check a synthetic control against what actually happened next. Gotham's move is in the future, so there is nothing to check it against. Refitting the same method on Seattle and Washington Spirit gives me that check.",
  },
  {
    head: 'It undershoots both of them, by a lot.',
    body: 'The method lands 57 to 65 points below what each team really did. That gap is the useful part: it separates growth they would have gotten anyway from lift that came from moving, and only the second half gets applied to Gotham.',
  },
  {
    head: 'Neither result is statistically significant.',
    body: 'Both look strong against their donor pools, but a permutation test returns p = 0.2 for each. With only four teams available to permute, it cannot rule out chance. Too few NWSL teams have moved, and no modeling choice fixes that.',
  },
]

export default function PlaceboValidation() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 md:gap-8 items-start">
      <div className="space-y-4">
        <figure className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm">
          <div className="bg-white border-b border-[var(--color-line)]">
            <img
              src={scmPlacebo}
              alt="Two line charts, Seattle Reign and Washington Spirit, each showing actual home attendance against a synthetic no-move counterfactual from 2016 through 2026, with the relocation season marked by a vertical line. Both actual series rise well above their counterfactual after the move."
              className="w-full h-auto block"
            />
          </div>
          <figcaption className="p-3">
            <p className="font-mono-label text-[10px] text-[var(--color-primary)] mb-1.5">
              Figure 6 &middot; The method vs. reality
            </p>
            <p className="text-xs text-[var(--color-ink)]/70 leading-relaxed">
              Both pre-move fits are tight, and both teams pull away from their no-move twin the moment
              they relocate.
            </p>
          </figcaption>
        </figure>

        <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
          <table className="w-full border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
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
      </div>

      <ul className="space-y-5">
        {TAKEAWAYS.map((t) => (
          <li key={t.head}>
            <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] leading-snug">
              {t.head}
            </p>
            <p className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/80 leading-snug mt-1.5">
              <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                &rarr;
              </span>
              <span>{t.body}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
