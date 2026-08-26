import shapMechanism from '../assets/figures/shap-mechanism.png'

const PANEL = {
  alt: 'Diverging bar chart showing the shift in predicted log attendance from Sports Illustrated Stadium to Etihad Park. The linear reach term contributes +0.197, venue recognition +0.116, home team recognition +0.035, and every other feature is close to zero.',
  title: 'Reach is the single largest driver of the jump',
  bullets: [
    'Swapping the old stadium for Etihad Park across 54 matched games, reach contributes +0.197 in log attendance. Venue recognition adds +0.116 and home team +0.035.',
    'The other 19 features rounds to roughly nothing.',
    'Etihad Park is a label CatBoost has never seen, so the +0.116 is the model un-correcting for Gothams below average attendance.',
  ],
} as const

export default function MechanismExplainer() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
      <figure className="w-full md:w-[58%] shrink-0 bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm">
        <div className="bg-white">
          <img src={shapMechanism} alt={PANEL.alt} className="w-full h-auto block" />
        </div>
      </figure>
      <div className="w-full md:w-[42%]">
        <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] leading-snug mb-3">
          {PANEL.title}
        </p>
        <ul className="space-y-2.5">
          {PANEL.bullets.map((b) => (
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
  )
}
