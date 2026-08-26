import SectionHeading from '../components/SectionHeading'

const STEPS = [
  {
    step: '01',
    title: 'Isochrones',
    text: 'r5py transit+walk networks (5.0 km/h walk speed, a real fix over the default) build 30/45/60/90-min isochrones for Sports Illustrated Stadium, Etihad Park, and every other current NWSL venue.',
  },
  {
    step: '02',
    title: 'Feature engineering',
    text: "Reachable population within a 60-min transit+walk trip (metro_size) per venue, joined to a game-level table (table_rank, opponent, schedule, venue/capacity features) built for every current NWSL venue.",
  },
  {
    step: '03',
    title: 'Linear + CatBoost residual model',
    text: "A linear stage predicts log(attendance) from log(metro_size) alone — log-transformed so it can extrapolate safely to Etihad Park's catchment population, since tree models can't. CatBoost then predicts the leftover residual from every other feature. Checked with Leave-One-Venue-Out (holding one team/venue pair out at a time) to see if the fit survives on a venue it hasn't seen.",
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
          Game-level attendance data (2016–2026, COVID seasons 2020–2021 excluded) feeds two
          parts: a predictive attendance model (a linear accessibility stage plus CatBoost on the
          residual, with SHAP analysis of the residual's own drivers), and a synthetic-control
          comparison against the other NWSL teams that recently relocated.
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
