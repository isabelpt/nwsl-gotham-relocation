import { useState } from 'react'
import shapRbaEtihad from '../assets/figures/shap-rba-etihad.png'
import shapMechanism from '../assets/figures/shap-mechanism.png'
import accessibilityCoefficient from '../assets/figures/accessibility-coefficient.png'

const PANELS = [
  {
    key: 'magnitude',
    tag: 'Figure 4',
    label: 'Driver Magnitude',
    stat: "venue_name ranks #1",
    img: shapRbaEtihad,
    alt: 'Bar chart: mean absolute SHAP value per feature (residual stage), Red Bull Arena rows vs. Etihad Park rows. venue_name is the largest-magnitude feature, followed by table_rank and year.',
    title: "Accessibility no longer shows up here at all — and that's on purpose",
    bullets: [
      "metro_size was pulled out of CatBoost entirely on 2026-08-25: it's not a tree feature anymore, so it can't appear in this chart. Accessibility's effect now lives in a separate linear stage — see the third panel.",
      'What CatBoost explains now is the residual left over after accessibility is accounted for: venue_name, table_rank, and year are the largest remaining drivers, in that order.',
    ],
  },
  {
    key: 'shift',
    tag: 'Figure 5',
    label: 'Mechanism Shift',
    stat: 'linear stage: +0.20',
    img: shapMechanism,
    alt: 'Diverging bar chart: shift in prediction, Etihad Park vs Red Bull Arena, split into the linear stage\'s accessibility contribution (gold) and CatBoost residual SHAP for every other feature (green/red)',
    title: "Accessibility is the single largest driver of the predicted increase — as a linear term, not a SHAP value",
    bullets: [
      "Swap Red Bull Arena for Etihad Park: the linear stage's accessibility contribution (+0.20 log-attendance) is the largest single driver of the shift — computed directly from 04's coefficient, not TreeSHAP, since metro_size isn't a CatBoost input anymore.",
      "team_venue_tenure resetting to 0 (Gotham's first season at a new venue) pulls the residual down (−0.08) — consistent with this project's own leave-one-venue-out check finding debut seasons get under-predicted on average. venue_name itself is the largest residual mover (+0.20), but Etihad Park is an unseen category for CatBoost here — a smaller, different caveat from the metro_size fix, worth reading with real caution rather than as a confirmed effect.",
    ],
  },
  {
    key: 'coefficient',
    tag: 'Figure 6',
    label: 'Accessibility Coefficient',
    stat: 'coef = +0.177, p = 0.038',
    img: accessibilityCoefficient,
    alt: 'Coefficient plot with 95% confidence interval: log(metro_size) predicting log(attendance), clustered standard errors by team, coefficient +0.177, 95% CI [0.009, 0.345]',
    title: 'Why accessibility lives in its own linear model now',
    bullets: [
      "CatBoost (any tree model) can't extrapolate past the range of values it trained on — Etihad Park's real catchment population is 2.2× the largest value ever seen in training, and an earlier version of this pipeline found CatBoost gave the identical prediction whether fed that real value or the training max, capped. Silent, not an error.",
      "The fix: a separate linear stage on log(metro_size) — log-transformed specifically so the extrapolation to Etihad Park is only ~0.78 log-units past the training max instead of 2.2× in raw units. The coefficient (+0.177, 95% CI [0.009, 0.345], p=0.038) is only marginally significant, and that uncertainty is real — it's why the Queens prediction is reported as a range, not a single number.",
    ],
  },
] as const

export default function MechanismExplainer() {
  const [active, setActive] = useState<(typeof PANELS)[number]['key']>('magnitude')
  const panel = PANELS.find((p) => p.key === active)!

  return (
    <div>
      <p className="font-mono-label text-[11px] text-[var(--color-primary)] flex items-center gap-2 mb-4">
        <span aria-hidden className="inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
        Click a panel to see its evidence
      </p>

      <div role="tablist" aria-label="SHAP mechanism panels" className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active === p.key}
            onClick={() => setActive(p.key)}
            className={
              active === p.key
                ? 'text-left border-2 px-4 py-3 transition-all duration-150 cursor-pointer border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white shadow-offset-sm -translate-y-0.5'
                : 'text-left border-2 px-4 py-3 transition-all duration-150 cursor-pointer border-[var(--color-line)] bg-[var(--color-paper-alt)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:-translate-y-0.5 hover:shadow-offset-sm'
            }
          >
            <p className={active === p.key ? 'font-mono-label text-[10px] text-white/70 mb-1' : 'font-mono-label text-[10px] text-[var(--color-primary)]/60 mb-1'}>
              {p.tag}
            </p>
            <p className="font-mono-label text-[11px] font-semibold mb-1.5 leading-snug">{p.label}</p>
            <p className={active === p.key ? 'font-mono text-[11px] text-white/85' : 'font-mono text-[11px] text-[var(--color-ink)]/70'}>
              {p.stat}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
        <figure className="w-full md:w-[58%] shrink-0 bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm">
          <div className="bg-white">
            <img src={panel.img} alt={panel.alt} className="w-full h-auto block" />
          </div>
        </figure>
        <div className="w-full md:w-[42%]">
          <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] leading-snug mb-3">
            {panel.title}
          </p>
          <ul className="space-y-2.5">
            {panel.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                  →
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
