import SectionHeading from '../components/SectionHeading'

const TAKEAWAYS = [
  {
    eyebrow: 'The honest check',
    headline: 'No model here can predict a team it hasn’t seen.',
    detail:
      'Linear and gradient-boosted alike collapse once team identity can’t leak across folds — that’s the real finding, not a footnote. The synthetic-control range is a small-sample descriptive estimate (3 comparable relocations, one excluded for capacity-suppression), not a precise forecast, and it’s reported as a range for that reason.',
  },
  {
    eyebrow: 'Cut for course scope, not failure',
    headline: 'Panel regression + DiD agreed on direction, never on significance.',
    detail:
      'A team+season fixed-effects model (399 NWSL+MLS team-seasons, clustered SEs) and a DiD cross-check both worked — positive, consistent direction, never significant, because there have only ever been ~4–5 real NWSL relocation events to learn an effect from. Not taught in QSS 45, so cut from the graded pipeline; recoverable from git history.',
  },
  {
    eyebrow: 'Next steps',
    headline: 'More relocations — or panel econometrics back in scope — would tighten this to a confidence interval.',
    detail:
      'Also worth checking whether the ~8% of the panel that’s capacity-censored (teams reporting a fixed "sold out" figure) is undercounting the true lift at venues, like Etihad Park, likely to sell out themselves.',
  },
]

export default function TakeawaySection() {
  return (
    <section id="takeaway" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="05" title="Does better access mean more attendance?" eyebrow="So what" />

        {/* The claim, kept to one sentence someone can read in three seconds, with
            the two headline numbers repeated as anchors rather than re-argued. */}
        <div className="border border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white p-8 shadow-offset">
          <p className="font-mono-label text-[11px] text-[var(--color-accent)] mb-3">The claim</p>
          <p className="font-serif-heading text-3xl md:text-4xl font-semibold leading-snug max-w-3xl">
            Reach tripled. Synthetic control puts 2027 attendance at 22,137–25,000 — up from a
            13,116-seat no-move baseline — but no predictive model here can prove that lift for a
            team it hasn’t seen.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 pt-6 border-t border-white/15">
            <div>
              <p className="font-mono text-2xl font-semibold text-white">3.0×</p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">reach vs. Red Bull Arena — measured</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-[var(--color-accent)]">13,116 → 22,137–25,000</p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">2027 attendance, no-move vs. move — synthetic control</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white">89–100%</p>
              <p className="font-mono-label text-[10px] text-white/60 mt-0.5">2027 capacity-fill — estimated range</p>
            </div>
          </div>
        </div>

        {/* Scannable takeaway cards: one bold, large-type sentence each, with the
            fuller argument underneath in smaller, muted type for anyone who wants it. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-6xl">
          {TAKEAWAYS.map((t) => (
            <div key={t.eyebrow} className="border-t-2 border-[var(--color-accent)] pt-4">
              <p className="font-mono-label text-[10px] text-[var(--color-primary)] mb-2">{t.eyebrow}</p>
              <p className="font-serif-heading text-xl font-semibold leading-snug text-[var(--color-primary-deep)] mb-3">
                {t.headline}
              </p>
              <p className="text-sm text-[var(--color-ink)]/65 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
