import SectionHeading from '../components/SectionHeading'

const STEPS = [
  {
    step: '01',
    title: 'Isochrones',
    text: 'r5py transit+walk networks (5.0 km/h walk speed, a real fix over the default) build 30/45/60/90-min isochrones for Red Bull Arena, Etihad Park, and every other current NWSL venue.',
  },
  {
    step: '02',
    title: 'Feature engineering',
    text: "Reachable population within a 60-min transit+walk trip (catchment_pop_60min) per venue, joined to nwsl-project's team-season table alongside ppg, market size, rivalry, and new-stadium flags.",
  },
  {
    step: '03',
    title: 'Regression & SHAP Analysis',
    text: "OLS and gradient-boosted trees predict log(attendance). Checked with KFold and GroupKFold (holding a whole team out) to see if the fit survives when applied to an unseen team.",
  },
  {
    step: '04',
    title: 'Synthetic control',
    text: "A donor pool of non-relocating teams estimates a counterfactual no-move Gotham trajectory.",
  },
]

export default function MethodSection() {
  return (
    <section id="method" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="03" title="The Method" eyebrow="Approach" />
        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-10">
          Team-season attendance data (2016–2026, COVID seasons 2020–2021 excluded) feeds two
          parts: predictive attendance models (OLS-Regression, Gradient-Boosted Trees, CatBoost) with SHAP analysis of feature importance, 
          and a synthetic-control comparison against the other NWSL teams that recently relocated. 
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.step} className="border-l-2 border-[var(--color-accent)] pl-4">
              <p className="font-mono-label text-xs text-[var(--color-primary)] mb-2">{s.step}</p>
              <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
