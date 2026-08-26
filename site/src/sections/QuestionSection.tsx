import SectionHeading from '../components/SectionHeading'

// The three predictions I test. Results (04) answers them one at a time, in this order.
const HYPOTHESES = [
  {
    id: 'H1',
    short: 'Reach drives attendance',
    text: 'Across the whole league, teams that more people can reach draw more fans.',
  },
  {
    id: 'H2',
    short: 'Access, not novelty',
    text: 'Reach is the biggest factor in attendance increases after stadium relocations.',
  },
  {
    id: 'H3',
    short: 'Bigger gain, bigger lift',
    text: 'When a team moves, the size of its attendance jump tracks the size of its reach gain.',
  },
]

export default function QuestionSection() {
  return (
    <section id="question" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="01" title="The Question" eyebrow="Motivation" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4 text-[var(--color-ink)]/85 leading-relaxed">
            <p>
              Gotham FC is dominant on the pitch, but you wouldn't know it from looking at the stands.
              That will hopefully change in 2028 when they move to Etihad Park in Willets Point, Queens from Harrison, New Jersey. 
              That number of people who can reach a home game in an hour will go from 1.05 million to 3.20 million, more than <strong>2x the reach of any current NWSL stadium</strong>.
            </p>
            <p>
              A good sign: Gotham's July 2026 game at Citi Field,
              across the street from their new venue, drew <strong>42,175</strong> fans, <strong>5x</strong> their average attendance.
            </p>
            <p>
              That brings me to my question: does making a stadium easier to get to actually put more
              people in it? I test that three ways.
            </p>
          </div>

          <div className="border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-5 shadow-offset-accent self-start">
            <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-3">Why this question is difficult to answer with confidence</p>
            <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
              Only four NWSL teams have moved recently, and a new stadium changes many factors beyond accessibility.
              On top of that the whole league is growing fast, from
              5,711 average attendance in 2016 to 10,243 in 2025. Making a confident estimate requires separating
              all of these competing factors.
            </p>
          </div>
        </div>

        <div>
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-4">
            Three predictions, based on existing literature
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HYPOTHESES.map((h) => (
              <div
                key={h.id}
                className="border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-offset-sm"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-mono text-sm font-semibold text-white bg-[var(--color-primary-deep)] px-2.5 py-1">
                    {h.id}
                  </span>
                  <span className="font-serif-heading text-base font-semibold text-[var(--color-primary-deep)]">
                    {h.short}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
