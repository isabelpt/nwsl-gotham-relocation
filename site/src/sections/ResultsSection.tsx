import SectionHeading from '../components/SectionHeading'
import HypothesisVerdict from '../components/HypothesisVerdict'
import TransitionHeading from '../components/TransitionHeading'
import FigureCard from '../components/FigureCard'
import AccessibilityMap from '../components/AccessibilityMap'
import ModelComparisonTable from '../components/ModelComparisonTable'
import RelocationTable from '../components/RelocationTable'
import MechanismExplainer from '../components/MechanismExplainer'
import PlaceboValidation from '../components/PlaceboValidation'
import StadiumFillViz from '../components/StadiumFillViz'
import lovoPerVenueMae from '../assets/figures/catboost-lovo-per-venue-mae.png'
import accessibilityCoefficient from '../assets/figures/accessibility-coefficient.png'

export default function ResultsSection() {
  return (
    <section id="results" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="04" title="The Results" eyebrow="Findings" />
        {/* ---------- Setup: how big is the change we're testing? ---------- */}
        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-6 max-w-3xl">
          Let's make sure accessibility actually increases, before we proceed.
          At the 60-minute mark Etihad Park reaches <strong>3.20 million</strong>{' '}
          people against Sports Illustrated Stadium's <strong>1.05 million</strong>. That's a <strong>3x</strong> increase!
          The old stadium only reached 11% of Manhattan in an hour, while Etihad Park reaches 71%.
        </p>

        <div className="mb-4">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 1 &middot; Who can get there in an hour
          </p>
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen flex justify-center">
            <div className="w-full max-w-[1400px] px-6">
              <AccessibilityMap />
            </div>
          </div>
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            Purple tracts reach Etihad Park faster, red tracts reach Sports Illustrated Stadium faster. 
            Drag the slider or search an address to try it yourself. 
          </p>
        </div>

        {/* ================= H1 ================= */}
        <HypothesisVerdict
          id="H1"
          question="Do teams that more people can reach draw more fans?"
          claim="Across the whole league, teams that more people can reach draw more fans."
          verdict="confirmed"
          answer="Yes. Doubling the number of people who can reach a stadium is worth about 13% more fans, and the effect is statistically significant."
        />

        <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
          Figure 2 &middot; The reach coefficient, with its confidence interval
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-4">
          <div>
            <p className="text-[15px] text-[var(--color-ink)]/85 leading-relaxed mb-3">
              I regressed log(attendance) on log(reachable population) across 950 games, and clustered the
              standard errors by team.
              The coefficient is <strong>+0.177</strong> (95% CI 0.009 to 0.345, p = 0.038).
            </p>
            <p className="text-[15px] text-[var(--color-ink)]/85 leading-relaxed">
              Double a stadium's reach and you get roughly 13% more fans. Triple it, which
              is what Gotham is doing, and you get about 21% more fans. 
            </p>
          </div>
          <FigureCard
            src={accessibilityCoefficient}
            alt="Coefficient plot with 95% confidence interval for log(reachable population) predicting log(attendance), clustered standard errors by team. The point estimate is 0.177 and the interval runs from 0.009 to 0.345, staying above zero."
            caption="The interval stays above zero, which is what confirms H1. It is also wide, which is why any of my estimates built off this model will be given as a range."
          />
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
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 3 &middot; What drives the predicted jump
          </p>
          <MechanismExplainer />
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
          <figure className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm">
            <div className="bg-white border-b border-[var(--color-line)]">
              <img
                src={lovoPerVenueMae}
                alt="Horizontal bar chart of mean absolute error in fans for each of 17 team-venue pairs under Leave-One-Venue-Out cross-validation, sorted from lowest to highest error, with R-squared labeled per venue."
                className="w-full h-auto block"
              />
            </div>
            <figcaption className="p-3">
              <p className="font-mono-label text-[10px] text-[var(--color-primary)] mb-1.5">
                Figure 4 &middot; Error by venue
              </p>
              <p className="text-xs text-[var(--color-ink)]/70 leading-relaxed">
                Each bar is one venue, held out and predicted from the other 16. The model struggles most
                with teams that draw exceptionally well.
              </p>
            </figcaption>
          </figure>

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

        {/* ================= Payoff: two methods, two answers ================= */}
        <TransitionHeading>So what will Gotham actually draw in 2028?</TransitionHeading>

        <p className="text-[var(--color-ink)]/85 leading-relaxed mb-10 max-w-3xl">
          Here's an answer, and then a slightly better one. To keep them comparable I am asking each one the same question: how many extra
          fans is the move itself worth? Gotham averaged <strong>8,110</strong> in 2026.
        </p>

        {/* ---- Answer 1: the model ---- */}
        <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">Answer 1 of 2</p>
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
                That's a real jump on its own, 52 to 78 percent more fans than Gotham draws now. But, as seen above,
                this model struggles to predict on new venues, Etihad Park is the most
                unfamiliar venue it could possibly be handed.
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

        {/* ---- Answer 2: synthetic control ---- */}
        <p className="font-mono-label text-xs text-[var(--color-primary)] mt-12 mb-3">Answer 2 of 2</p>
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
                So I stopped asking a model to imagine a stadium and asked what actually happened to teams
                that moved. Synthetic control builds a fake no-move Gotham out of eight teams that stayed
                put, weighted so their combined history tracks Gotham's own through 2026. North Carolina
                Courage (0.417), Orlando Pride (0.310), and Washington Spirit (0.273) carry nearly all of
                it.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <PlaceboValidation />
        </div>

        <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
          Figure 6 &middot; What each scenario looks like in the building
        </p>
        <StadiumFillViz />

      </div>
    </section>
  )
}
