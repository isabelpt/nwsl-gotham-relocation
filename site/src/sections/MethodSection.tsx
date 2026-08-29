import SectionHeading from '../components/SectionHeading'

const STEPS = [
  {
    step: '01',
    title: 'Map who can get there',
    text: "I built transit and walking networks for every NWSL metro with r5py and drew 30, 45, 60, and 90 minute travel zones from each stadium for a Saturday 6pm kickoff, then summed the census population inside them. r5py walks people at 3.6 km/h by default, which (as a New Yorker) is far too slow, so I corrected it to 5.0 km/h.",
  },
  {
    step: '02',
    title: 'Model attendance in two stages',
    text: 'A tree model cannot predict past the range it trained on, and Etihad Park is 2.2 times bigger than anything in the data. So reach gets its own regression on a log scale, and CatBoost predicts whatever that stage misses using 19 other features: opponent, table position, day of week, capacity, weather, transit commuter share, venue tenure, and more.',
  },
  {
    step: '03',
    title: 'Try hard to break it',
    text: 'I held out one entire team and venue pair at a time, retrained, and predicted only the venue the model had never seen. This tells us if the model can predict on a venue it has never seen, like Etihad Park. Spoiler alert: the model fails this test, which is why I did the next step.',
  },
  {
    step: '04',
    title: 'Ask comparable teams instead',
    text: 'Synthetic control builds a fake no-move Gotham from eight teams that stayed put, then I validate the approach by rerunning it on Seattle and Washington Spirit, whose moves already happened and can be checked against real post-relocation data.',
  },
]

export default function MethodSection() {
  return (
    <section id="method" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="The method" title="How I tested it" />
        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-10">
          I use game-level attendance from 2016 to 2026, dropping 2020 and 2021 because COVID restrictions
          made those crowds meaningless. Two things run on top of it: a predictive model, and a
          synthetic-control comparison against the NWSL teams that recently relocated.</p>
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
