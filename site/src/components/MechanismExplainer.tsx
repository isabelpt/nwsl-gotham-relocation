import { useState } from 'react'
import shapRbaEtihad from '../assets/figures/shap-rba-etihad.png'
import shapMechanism from '../assets/figures/shap-mechanism.png'

const PANELS = [
  {
    key: 'magnitude',
    tag: 'Figure 3',
    label: 'What CatBoost is left explaining',
    stat: 'venue_name, 27%',
    img: shapRbaEtihad,
    alt: 'Bar chart of mean absolute SHAP value per feature in the residual stage, comparing Sports Illustrated Stadium rows against Etihad Park rows. venue_name is the largest at roughly 27% of total importance, followed by year and home_team at about 10% each.',
    title: 'Reach is deliberately absent from this chart',
    bullets: [
      'I pulled reach out of CatBoost entirely, so it cannot show up here. What is left is everything that remains after reach is accounted for.',
      'The leftovers are venue identity (about 27%), then year and home team (about 10% each). That is scheduling and branding texture, not access.',
    ],
  },
  {
    key: 'shift',
    tag: 'Figure 4',
    label: 'What moves the Queens prediction',
    stat: 'reach, +0.197',
    img: shapMechanism,
    alt: 'Diverging bar chart showing the shift in predicted log attendance from Sports Illustrated Stadium to Etihad Park. The linear reach term contributes +0.197, venue recognition +0.116, home team recognition +0.035, and every other feature is close to zero.',
    title: 'Reach is the single largest driver of the jump',
    bullets: [
      'Swapping the old stadium for Etihad Park across 54 matched games, reach contributes +0.197 in log attendance. Venue recognition adds +0.116 and home team +0.035.',
      'Every one of the other 19 features rounds to roughly nothing. Almost all of the predicted lift traces back to how many people can get there.',
      'One caveat I will not bury: Etihad Park is a label CatBoost has never seen, so its +0.116 is the model reacting to an unfamiliar name, not a measured venue effect.',
    ],
  },
] as const

export default function MechanismExplainer() {
  const [active, setActive] = useState<(typeof PANELS)[number]['key']>('shift')
  const panel = PANELS.find((p) => p.key === active)!

  return (
    <div>
      <div role="tablist" aria-label="SHAP mechanism panels" className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
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
            <p
              className={
                active === p.key
                  ? 'font-mono-label text-[10px] text-white/70 mb-1'
                  : 'font-mono-label text-[10px] text-[var(--color-primary)]/60 mb-1'
              }
            >
              {p.tag}
            </p>
            <p className="font-mono-label text-[11px] font-semibold mb-1.5 leading-snug">{p.label}</p>
            <p
              className={
                active === p.key
                  ? 'font-mono text-[11px] text-white/85'
                  : 'font-mono text-[11px] text-[var(--color-ink)]/70'
              }
            >
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
                  &rarr;
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
