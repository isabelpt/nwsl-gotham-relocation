import SectionHeading from '../components/SectionHeading'
import ResultsQuestionHeading from '../components/ResultsQuestionHeading'
import FigureCard from '../components/FigureCard'
import TransitionHeading from '../components/TransitionHeading'
import AccessibilityMap from '../components/AccessibilityMap'
import ModelComparisonTable from '../components/ModelComparisonTable'
import ScenarioBars from '../components/ScenarioBars'
import StatFlip from '../components/StatFlip'
import CatBoostModelsExplainer from '../components/CatBoostModelsExplainer'
import MechanismExplainer from '../components/MechanismExplainer'
import QueensPredictionTable from '../components/QueensPredictionTable'
import lovoPerVenueMae from '../assets/figures/catboost-lovo-per-venue-mae.png'
import StadiumFillViz from '../components/StadiumFillViz'

export default function ResultsSection() {
  return (
    <section id="results" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="04" title="The Results" eyebrow="Findings" />
        <ResultsQuestionHeading
          index="Q1"
          question="Building a bad model was easy"
          sub="Does regressing attendance on accessibility work? Yes, but only until the model is asked to predict a venue it's never seen."
        />

        {/* <div className="mb-6">
          <StatFlip
            label="GBT model, R² on an unseen team"
            from="0.51"
            to="−1.88"
            fromLabel="naive 80/20 split"
            toLabel="GroupKFold (honest)"
          />
        </div> */}
        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Table 1 — both stages of the current model, naive fit vs. held-out-venue fit
          </p>
          <ModelComparisonTable />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            Neither stage generalizes cleanly to a venue it hasn't seen. The combined model's R² drops from
            0.78 (random split) to −0.17 (Leave-One-Venue-Out) — worse than guessing the mean once a venue
            is genuinely unfamiliar. This isn't a reason to distrust the model's own coefficients (the
            accessibility effect is estimated separately, with its own honest confidence interval — see
            Figure 6 below), but it is a reason to report the Queens prediction as a wide range, not a
            precise point estimate.
          </p>
        </div>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 1 — Held-out-venue error, by venue
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FigureCard
              src={lovoPerVenueMae}
              alt="Horizontal bar chart: mean absolute error in fans for each of 22 (team, venue) pairs under Leave-One-Venue-Out cross-validation, sorted from lowest to highest error, R² labeled per venue"
              caption="Each bar is one real venue, held out entirely from training and predicted using only the other 21 venues' games. Error varies enormously by venue — from under 1,500 fans for some to over 9,000 for others — and R² (labeled per bar) is a misleading way to rank them: a low-variance venue can post a terrible R² on a small absolute miss, while a genuinely volatile venue can post a better R² on a much larger one."
            />
            <div className="flex flex-col justify-center">
              <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] leading-snug mb-3">
                Why this matters
              </p>
              <ul className="space-y-2.5">
                <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                  <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                    →
                  </span>
                  <span>
                    The model's own accessibility coefficient looks real (positive, similar in size to
                    other established effects, and stable whether estimated at the game level with
                    clustered standard errors or aggregated to the team-season) — but that's a separate
                    claim from "the model predicts a new venue's attendance well."
                  </span>
                </li>
                <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                  <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                    →
                  </span>
                  <span>
                    Both stages hold up fine under a random split, but collapse under Leave-One-Venue-Out:
                    R² goes from 0.78 to −0.17 for the combined model, 0.15 to −0.04 for the linear stage
                    alone.
                  </span>
                </li>
                <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                  <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                    →
                  </span>
                  <span>
                    A model that can't reliably predict a venue it's already seen a version of can't be
                    trusted to give a precise point prediction for Etihad Park — which is why the Queens
                    prediction below is reported as a range.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        

        <TransitionHeading>Building a stronger model: CatBoost iterations</TransitionHeading>

        <div className="mb-14">
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mb-5">
            There are three iterations of the CatBoost models and only the third one ever touches the Queens prediction. The only difference is how they are trained.
          </p>
          <CatBoostModelsExplainer />
        </div>

        {/* <TransitionHeading>What's literally inside one of these trees?</TransitionHeading>

        <div className="mb-6">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 2 — Inside tree 1 of 60
          </p>
          <FigureCard
            src={gbtTreeWalkthrough}
            alt="One depth-2 tree from the GBT ensemble: root split on catchment_pop_60min_100k, second split on new_stadium_flag, four leaves with small log-attendance nudges"
            claim="A brand-new stadium gets a lower nudge than an established one — in tree 1 of 60, before any accessibility feature even separates them."
            caption="This is a real tree from the GBT ensemble (60 trees total, each depth 2 — kept shallow specifically to limit how much a tree can memorize about team identity). Both Etihad Park (3.2M reachable) and Red Bull Arena (1.05M) clear the root's accessibility threshold, so this particular tree can't tell them apart on accessibility at all — it's the second split, on new_stadium_flag, that separates them, and it pushes Gotham's first season at a new venue down (+0.159), not up (+0.731 for an established stadium). The final prediction sums a small nudge like this from all 60 trees, shrunk by a 0.05 learning rate — no single tree is the whole story, but this one already echoes the team_venue_tenure finding from the SHAP check below, independently."
          />
        </div> */}

        {/* ============================================================ */}
        <ResultsQuestionHeading
          index="Q2"
          question="How much is accessibility improving?"
          sub="Quantifying the size of Gotham's accessibility increase to see what change the models are being fed."
        />

        <div className="mb-6">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 3 — Etihad Park's reach vs. Red Bull Arena's
          </p>
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen flex justify-center">
            <div className="w-full max-w-[1400px] px-6">
              <AccessibilityMap />
            </div>
          </div>
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            Purple tracts reach Etihad Park faster than Red Bull Arena, while red tracts are the reverse.
            At the 60-minute threshold, Etihad Park reaches <strong>3.20M</strong>{' '}
            people, <strong>3.0×</strong> Red Bull Arena's <strong>1.05M</strong> (both numbers
            already corrected for r5py's too-slow default walking speed).
            Red Bull Arena's only connection to Manhattan connection is PATH, while Etihad Park
            has direct access to the 7 train. 71% of Manhattan is reachable from Etihad Park within 60 minutes,
            versus 11% from Red Bull Arena. Drag the threshold slider or search an address to
            explore the comparison yourself.
          </p>
        </div>

        <TransitionHeading>Does the model reward reach or just the novelty of a new stadium?</TransitionHeading>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figures 4–6 — CatBoost SHAP analysis
          </p>
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mb-4">
            <code>team_venue_tenure</code> (seasons
            since this team's relocation, null unless one occurred)
            and <code>team_league_tenure</code> (seasons since the team's real NWSL expansion, null for original teams)
            were added to the model to try and capture the "honeymoon effect", to try and parse out the novelty of a new stadium
            from the actual accessibility increases. As of 2026-08-25, accessibility itself is no longer a CatBoost
            feature at all — it's a separate linear stage (Figure 6) precisely because a tree model can't extrapolate
            to Etihad Park's catchment population. The tenure features stay in CatBoost's residual stage below, and
            SHAP still isolates their effect there.
          </p>
          <MechanismExplainer />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-5">
            Read together: accessibility's contribution to the Queens prediction is no longer a
            SHAP value competing with stadium-novelty effects for credit — it's a separate linear
            term (+0.20 log-attendance, dominant in the shift) that can't be confounded with
            <code> team_venue_tenure</code> resetting to 0, since that effect lives entirely in
            CatBoost's residual stage and pulls the opposite direction (−0.08). That's cleaner
            separation than sharing one model, but it comes with its own honesty requirement: the
            linear coefficient's confidence interval is wide, which is why the Queens number is
            reported as a range, not a point estimate.
          </p>
        </div>

        {/* ============================================================ */}
        <ResultsQuestionHeading
          index="Q3"
          question="Will attendance actually increase?"
          sub="Accessibility tripled, and the mechanism check says that's real, not novelty. Does it show up in attendance — and can any of these models actually say by how much?"
        />

        <div className="mb-6">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Table 2 — where every model's own Queens prediction lands
          </p>
          <QueensPredictionTable />
        </div>

        <TransitionHeading>The best prediction.</TransitionHeading>
        <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] mb-6">
          Synthetic control: what staying at Red Bull Arena would have looked like instead.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start mb-14">
          <div className="space-y-6">
            <ScenarioBars />
            <StadiumFillViz />
          </div>

          <div>
            <p className="font-serif-heading text-xl font-semibold text-[var(--color-primary-deep)] leading-snug mb-3">
              Find teams whose past looks like Gotham's, then watch what happened after they moved.
            </p>
            <ul className="space-y-2.5">
              <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                  →
                </span>
                <span>
                  Post-move Gotham is, in feature terms, a team the models above have never seen —
                  exactly the case they can't predict. Synthetic control sidesteps the problem
                  instead of solving it head-on.
                </span>
              </li>
              <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                  →
                </span>
                <span>
                  It builds a weighted blend of other real teams (North Carolina Courage, Orlando
                  Pride, and Washington Spirit carry most of the weight) whose combined attendance
                  history tracks Gotham's own trajectory closely through 2026 — a stand-in for
                  "Gotham if it had never moved."
                </span>
              </li>
              <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                  →
                </span>
                <span>
                  Once Gotham actually moves, its real attendance and that synthetic stand-in
                  diverge. The size of that gap is this project's central estimate — not a model
                  guessing a new number, but comparable teams' own history read back.
                </span>
              </li>
              <li className="flex gap-2.5 text-[15px] text-[var(--color-ink)]/90 leading-snug">
                <span className="shrink-0 text-[var(--color-accent)] font-semibold" aria-hidden>
                  →
                </span>
                <span>
                  The two post-move bars aren't a confidence interval — they're bounded by what
                  actually happened at three comparable relocations: San Diego's +68.8% lift as
                  the floor, the Seattle/Washington Spirit scale of lift (both round to capacity)
                  as the ceiling. Kansas City Current is left out; it was already selling out its
                  smaller stadium, so its raw change understates real demand.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
