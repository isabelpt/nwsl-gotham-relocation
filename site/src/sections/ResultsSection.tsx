import SectionHeading from '../components/SectionHeading'
import HypothesisVerdict from '../components/HypothesisVerdict'
import TransitionHeading from '../components/TransitionHeading'
import MapScrolly from './MapScrolly'
import ModelComparisonTable from '../components/ModelComparisonTable'
import RelocationTable from '../components/RelocationTable'
import PlaceboValidation from '../components/PlaceboValidation'
import StadiumScrolly from './StadiumScrolly'
import CoefficientChart from '../components/charts/CoefficientChart'
import MechanismChart from '../components/charts/MechanismChart'
import VenueErrorChart from '../components/charts/VenueErrorChart'

export default function ResultsSection() {
  return (
    <section id="results" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="The results" title="What Gotham can expect in Queens" />

        {/* ================= The answer, first ================= */}
        <div className="border border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white p-8 shadow-offset mb-10">
          <p className="font-mono-label text-[11px] text-[var(--color-accent)] mb-3">The answer</p>
          <p className="font-serif-heading text-3xl md:text-4xl font-semibold leading-snug max-w-3xl">
            Gotham should draw between 17,961 and a sellout at Etihad Park, against 13,116 if they
            had stayed in Harrison.
          </p>
          <p className="text-white/70 leading-relaxed mt-5 max-w-2xl">
            That range comes from what actually happened to comparable teams after they moved, not
            from asking a model to imagine a stadium it has never seen. It is my best estimate, and
            the rest of this section is how I got there.
          </p>
        </div>

        <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
          Figure 1 &middot; What each scenario looks like in the building
        </p>
        <StadiumScrolly />

        {/* ---- Answer 1: synthetic control, the best estimate ---- */}
        <p className="font-mono-label text-xs text-[var(--color-primary)] mt-12 mb-3">Answer 1 of 2</p>
        <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm mb-8">
          <div className="px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-paper-alt)] flex flex-wrap items-center gap-3">
            <span className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)]">
              Comparable teams say
            </span>
            <span
              className="font-mono-label text-[11px] font-semibold px-2.5 py-1 border whitespace-nowrap"
              style={{
                color: 'var(--color-yes)',
                backgroundColor: 'var(--color-yes-soft)',
                borderColor: 'var(--color-yes)',
              }}
            >
              My best estimate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 px-5 py-5 items-center">
            <div>
              <p className="font-serif-heading text-4xl font-semibold text-[var(--color-primary-deep)] whitespace-nowrap">
                +4,845 to +11,884
              </p>
              <p className="font-mono-label text-[11px] text-[var(--color-primary)] mt-1">
                extra fans from the move
              </p>
              <p className="text-xs text-[var(--color-ink)]/60 mt-2 leading-relaxed max-w-[15rem]">
                14 to 88 percent more than the model predicted, on top of the growth Gotham gets either
                way.
              </p>
            </div>
            <div className="border-l-0 md:border-l border-[var(--color-line)] md:pl-8">
              <p className="text-[15px] text-[var(--color-ink)]/85 leading-snug mb-3">
                Rather than ask a model to imagine a stadium, I asked what actually happened to teams
                that moved. Synthetic control builds a fake no-move Gotham out of eight teams that
                stayed put, weighted so their combined history tracks Gotham's own through 2026. North
                Carolina Courage (0.417), Orlando Pride (0.310), and Washington Spirit (0.273) carry
                nearly all of it.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <PlaceboValidation />
        </div>

        {/* ---- Answer 2: the predictive model ---- */}
        <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">Answer 2 of 2</p>
        <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm mb-4">
          <div className="px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-paper-alt)] flex flex-wrap items-center gap-3">
            <span className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)]">
              The predictive model says
            </span>
            <span
              className="font-mono-label text-[11px] font-semibold px-2.5 py-1 border whitespace-nowrap"
              style={{
                color: 'var(--color-no)',
                backgroundColor: 'var(--color-no-soft)',
                borderColor: 'var(--color-no)',
              }}
            >
              Conservative estimate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 px-5 py-5 items-center">
            <div>
              <p className="font-serif-heading text-4xl font-semibold text-[var(--color-primary-deep)] whitespace-nowrap">
                +4,258 to +6,312
              </p>
              <p className="font-mono-label text-[11px] text-[var(--color-primary)] mt-1">
                extra fans from the move
              </p>
              <p className="text-xs text-[var(--color-ink)]/60 mt-2 leading-relaxed max-w-[15rem]">
                A full Etihad Park schedule scores 12,368, or 14,422 after correcting for the bump teams
                usually get in their first season somewhere new.
              </p>
            </div>
            <div className="border-l-0 md:border-l border-[var(--color-line)] md:pl-8">
              <p className="text-[15px] text-[var(--color-ink)]/85 leading-snug mb-3">
                That's a real jump on its own, 52 to 78 percent more fans than Gotham draws now. But this
                model struggles to predict on new venues, and Etihad Park is the most unfamiliar venue it
                could possibly be handed.
              </p>
              <p className="text-[15px] text-[var(--color-ink)]/85 leading-snug">
                Tree models cannot reach past the range they trained on, so when a stadium is bigger and
                better connected than anything in the data, they pull the answer back toward the
                league average. That's why I separated out the accessibility metric.
              </p>
            </div>
          </div>
          <p className="px-5 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
            CatBoost on its own returned the identical
            answer whether I fed it Etihad Park's real catchment or the training maximum, and a plain
            regression on raw population predicted four times the stadium's capacity. Splitting reach into
            its own log-scale stage was the fix for both.
          </p>
        </div>

        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-6 max-w-3xl">
          To keep the two comparable I asked each the same question: how many extra fans is the move
          itself worth? Gotham averaged <strong>8,110</strong> in 2026.
        </p>

        {/* ================= The evidence ================= */}
        <TransitionHeading>Now, the evidence behind those numbers.</TransitionHeading>

        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-6 max-w-3xl">
          First, accessibility really does increase. At the 60-minute mark Etihad Park reaches{' '}
          <strong>3.20 million</strong> people against Sports Illustrated Stadium's{' '}
          <strong>1.05 million</strong>. That's a <strong>3x</strong> increase. The old stadium only
          reached 11% of Manhattan in an hour, while Etihad Park reaches 71%.
        </p>

        <div className="mb-4">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 3 &middot; Who can get there in an hour
          </p>
        </div>
        <MapScrolly />
        <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3 mb-4">
          Travel times are pre-computed with r5py for a Saturday 6pm kickoff, at a corrected 5.0 km/h
          walking speed. <em>Click any tract, or search an address, to see how that trip changes.</em>
        </p>

        {/* ================= H1 ================= */}
        <HypothesisVerdict
          id="H1"
          question="Do teams that more people can reach draw more fans?"
          claim="Across the whole league, teams that more people can reach draw more fans."
          verdict="confirmed"
          answer="Yes. Doubling the number of people who can reach a stadium is worth about 13% more fans, and the effect is statistically significant."
        />

        <p className="text-[15px] text-[var(--color-ink)]/85 leading-relaxed mb-4 max-w-3xl">
          I regressed log(attendance) on log(reachable population) across 950 games, clustering the
          standard errors by team. Double a stadium's reach and you get roughly 13% more fans.
          Triple it, which is what Gotham is doing, and you get about 21% more.
        </p>
        <div className="mb-4">
          <CoefficientChart label="Figure 4 · The reach effect, with its confidence interval" />
        </div>

        {/* ================= H2 ================= */}
        <HypothesisVerdict
          id="H2"
          question="Is it the access, or just the novelty of a new stadium?"
          claim="Reach stays the biggest factor even after controlling for opponent, schedule, weather, and team quality."
          verdict="mixed"
          answer="Access wins, but one could argue I rigged it. It is the largest driver of the predicted jump, but it is also the one feature I gave its own model."
        />

        <p className="text-[15px] text-[var(--color-ink)]/85 leading-relaxed mb-6 max-w-3xl">
          A tree model cannot predict beyond the range it trained on, and Etihad Park's catchment is 2.2
          times larger than anything in the data. To compensate, this model is split into two parts.
          A linear stage regresses log(attendance) on log(reach), and then CatBoost predicts on the residuals,
          what the linear stage doesn't capture, based on 19 additional features.
          Then I used SHAP to see what actually moves the prediction when I swap Sports Illustrated Stadium for
          Etihad Park.
        </p>

        <div className="mb-8">
          <MechanismChart label="Figure 5 · What drives the predicted jump" />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-5 max-w-3xl">
            Reach dominates partly because I handed it its own model.
            That was the only way to let it extrapolate at all, but it means H2 cannot be answered with complete confidence.
          </p>
        </div>

        <TransitionHeading>The model struggles to generalize on new venues.</TransitionHeading>

        <div className="mb-4">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Table 1 &middot; Random split vs. holding out a whole venue
          </p>
          <ModelComparisonTable />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 md:gap-8 items-start mb-4">
          <VenueErrorChart label="Figure 6 · Error by venue" />

          <ul className="space-y-5">
            {[
              {
                head: "The model works until it tries to predict a new venue.",
                body: (
                  <>
                    A normal 80/20 split scores R&sup2; = 0.788. Hold out one whole venue and it collapses
                    to <strong>0.004</strong>, about as good as guessing the league average.
                  </>
                ),
              },
              {
                head: 'It is still my strongest model.',
                body: (
                  <>
                    Better than the linear stage alone (&minus;0.045) and my earlier untuned runs
                    (&minus;0.167). Better than negative is not the same as working.
                  </>
                ),
              },
              {
                head: 'Etihad Park gets a range, not a number.',
                body: (
                  <>
                    No model here can predict a stadium it has never seen, and the error swing bears that
                    out: under 1,200 fans at some venues, over 10,000 at others.
                  </>
                ),
              },
            ].map((t) => (
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

        {/* ================= H3 ================= */}
        <HypothesisVerdict
          id="H3"
          question="Do bigger reach gains produce bigger attendance jumps?"
          claim="When a team moves, the size of its attendance jump tracks the size of its reach gain."
          verdict="unproven"
          answer="This is true with all three relocations I looked at, but the sample size is too small to generalize."
        />

        <div className="mb-4">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Table 2 &middot; Reach gain vs. attendance change, all five relocations
          </p>
          <RelocationTable />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3 max-w-3xl">
            Three teams is too small a sample to draw a reliable conclusion from. It is also impossible
            to separate the reach gain from the honeymoon effect. Therefore, despite the trend, H3 is
            unproven.
          </p>
        </div>
      </div>
    </section>
  )
}
