import SectionHeading from '../components/SectionHeading'

// Mirrors the three verdicts in Results, then the one thing none of them can settle.
const SCORECARD = [
  {
    id: 'H1',
    claim: 'Reach drives attendance league-wide',
    verdict: 'Confirmed',
    color: 'var(--color-yes)',
    bg: 'var(--color-yes-soft)',
    detail:
      'Double a stadium’s reach and you get about 13% more fans (coefficient +0.177, p = 0.038). The interval is wide, so I trust the direction more than the exact size.',
  },
  {
    id: 'H2',
    claim: 'Access beats novelty',
    verdict: 'Confirmed, with a catch',
    color: 'var(--color-maybe)',
    bg: 'var(--color-maybe-soft)',
    detail:
      'Reach is the largest single driver of the predicted jump at +0.197, ahead of everything else combined. But it is also the one feature I gave its own model, so this is not a clean independent test.',
  },
  {
    id: 'H3',
    claim: 'Bigger reach gain, bigger jump',
    verdict: 'Not proven',
    color: 'var(--color-no)',
    bg: 'var(--color-no-soft)',
    detail:
      'All three usable relocations line up in the right order, which is exactly what I predicted and still only three points. Every one of those teams got a nicer stadium at the same time, so novelty and access cannot be separated.',
  },
]

export default function TakeawaySection() {
  return (
    <section id="takeaway" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="05" title="So does better access mean more fans?" eyebrow="So what" />

        <div className="border border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white p-8 shadow-offset">
          <p className="font-mono-label text-[11px] text-[var(--color-accent)] mb-3">The short answer</p>
          <p className="font-serif-heading text-3xl md:text-4xl font-semibold leading-snug max-w-3xl">
            Almost certainly yes, but I cannot concretely pin down the magnitude of this effect. Gotham should
            draw between 17,961 and a sellout in 2028, against 13,116 if they had stayed in Harrison.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-6 border-t border-white/15">
            <div>
              <p className="font-mono text-2xl font-semibold text-white">3.0&times;</p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">more people within an hour</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-[var(--color-accent)]">
                13,116 &rarr; 17,961&ndash;25,000
              </p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">2028 attendance, stay vs. move</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white">72&ndash;100%</p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">of Etihad Park filled</p>
            </div>
          </div>
        </div>

        <p className="font-mono-label text-xs text-[var(--color-primary)] mt-12 mb-4">
          The scorecard
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SCORECARD.map((t) => (
            <div key={t.id} className="border border-[var(--color-line)] bg-[var(--color-paper)] p-5 shadow-offset-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-mono text-sm font-semibold text-white bg-[var(--color-primary-deep)] px-2.5 py-1">
                  {t.id}
                </span>
                <span
                  className="font-mono-label text-[10px] font-semibold px-2 py-1 border"
                  style={{ color: t.color, backgroundColor: t.bg, borderColor: t.color }}
                >
                  {t.verdict}
                </span>
              </div>
              <p className="font-serif-heading text-lg font-semibold leading-snug text-[var(--color-primary-deep)] mb-2">
                {t.claim}
              </p>
              <p className="text-sm text-[var(--color-ink)]/65 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-[var(--color-line)] pt-8">
          <div>
            <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] mb-3">
              What this study can't prove
            </p>
            <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed">
              I am confident that moving raises attendance? Why this happens is something I'm less sure about.
              All of my results suggest that transit access plays a role, but I can't isolate it from
              all of the factors that play into a stadium move (novelty, better facilities, marketing, etc.)
            </p>
          </div>
          <div>
            <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] mb-3">
              What would fix it
            </p>
            <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed">
              More relocations, which means more time. With more data, I want to separate a new
              stadium&rsquo;s honeymoon effect from access, and test whether one-off games in big
              venues, like Gotham&rsquo;s 42,175-fan night at Citi Field, can predict what a team draws
              after it moves. Nobody knows the ceiling on women&rsquo;s sports growth right now, which is
              why I started this in the first place. Needless to say I'm excited to see how Gotham's attendance
              pans out and to enjoy the new stadium!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
