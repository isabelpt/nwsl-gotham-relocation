import SectionHeading from '../components/SectionHeading'
import ResultsQuestionHeading from '../components/ResultsQuestionHeading'
import FigureCard from '../components/FigureCard'
import TransitionHeading from '../components/TransitionHeading'
import AccessibilityMap from '../components/AccessibilityMap'
import ModelComparisonTable from '../components/ModelComparisonTable'
import ScenarioBars from '../components/ScenarioBars'
import StatFlip from '../components/StatFlip'
import CatBoostModelsExplainer from '../components/CatBoostModelsExplainer'
import leakageCheck from '../assets/figures/leakage-check.png'
import scmGapPlot from '../assets/figures/scm-gap-plot.png'
import shapMechanism from '../assets/figures/shap-mechanism.png'
import shapRbaEtihad from '../assets/figures/shap-rba-etihad.png'
import shapMetroSizeDependence from '../assets/figures/shap-metro-size-dependence.png'
import gbtTreeWalkthrough from '../assets/figures/gbt-tree-walkthrough.png'
import modelDivergence from '../assets/figures/model-divergence-dotplot.png'

export default function ResultsSection() {
  return (
    <section id="results" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="04" title="The Results" eyebrow="Findings" />
        <p className="text-[var(--color-ink)]/70 leading-relaxed">
          1. The trials and tribulations of building a model <br></br>
          2. Quantifying how the move to Queens improves accessibility <br></br>
          3. If accessibility translates to greater attendance
        </p>

        {/* ============================================================ */}
        <ResultsQuestionHeading
          index="Q1"
          question="Building a bad model was easy"
          sub="Does regressing attendance on accessibility work? Yes, but only until the model is asked to predict a team it's never seen."
        />

        <div className="mb-6">
          <StatFlip
            label="GBT model, R² on an unseen team"
            from="0.51"
            to="−1.88"
            fromLabel="naive 80/20 split"
            toLabel="GroupKFold (honest)"
          />
        </div>
        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 1 — Simple regression doesn't work
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FigureCard
              src={leakageCheck}
              alt="Gotham FC actual vs predicted home attendance: GroupKFold (honest) collapses to a flat line while row-shuffled KFold (leaky) tracks the trend"
              caption="Neither model learned Gotham's trajectory, it just learned to recognize Gotham from other seasons of the same team. The linear and GBT models roughly follow Gotham's growth trend under row-shuffled cross validation, but flatten out almost entirely when Gotham is held out of the training data (GroupKFold)."
            />
            <div className="border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-5 shadow-offset-accent flex flex-col justify-center">
              <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-3">Why this matters</p>
              <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
                On the surface, regressing attendance on reachable population seems to work. The coefficient is positive
                and comparable to other effects such as rivalry-matches and the new-stadium boost. It's the GBT model's top SHAP driver by magnitude.
                These models work under a standard 80/20 train-test split, but when tested on a team they haven't seen before (GroupKFold) the models collapse.
                R² drops from
                0.51 to −1.88 for the GBT model, 0.16 to −2.26 for OLS (table below). The model was learning to recognize teams, not the drivers behind attendance.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Table 1 — every model tested, naive fit vs. held-out-team fit
          </p>
          <ModelComparisonTable />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            CatBoost is the only model that doesn't fully collapse when tested on a team it hasn't seen before,
            but its pooled Pearson r of 0.50 on Leave-One-Team-Out is still well below its random-split r of 0.87.
            None of these models can honestly predict an unseen team's attendance.
          </p>
        </div>

        <TransitionHeading>Which CatBoost model are we even talking about?</TransitionHeading>

        <div className="mb-14">
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mb-5">
            "CatBoost" above is actually three separate fits, and mixing them up is an easy way to
            misread every number on this page. Only the third one ever touches the Queens prediction.
          </p>
          <CatBoostModelsExplainer />
        </div>

        <TransitionHeading>What's literally inside one of these trees?</TransitionHeading>

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
        </div>

        {/* ============================================================ */}
        <ResultsQuestionHeading
          index="Q2"
          question="Does accessibility actually improve?"
          sub="Set the modeling struggle aside — what does the move measurably change about who can reach a game, and is that change really what the models are picking up on?"
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

        <TransitionHeading>But is that reach actually what the model is rewarding — or just novelty?</TransitionHeading>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figures 4–5 — 13_shap_mechanism_check.ipynb
          </p>
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mb-4">
            Two features were added here that the earlier models didn't have: <code>team_venue_tenure</code> (seasons
            since this team's actual detected relocation — null unless one occurred, not just "years since 2016")
            and <code>team_league_tenure</code> (seasons since the team's real NWSL expansion, null for founding-era
            franchises misdated to 2016 in the raw data). Without them, a "new venue" effect had nowhere to go
            except metro_size or venue_name, so any accessibility signal was potentially absorbing credit for
            plain novelty. Separating them out both improved LOTO generalization (r = 0.44 → 0.50) and lets the
            SHAP mechanism check below isolate accessibility from newness directly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FigureCard
              src={shapRbaEtihad}
              label="Figure 4"
              alt="Bar chart: mean absolute SHAP value per feature, Red Bull Arena rows vs. Etihad Park rows. year and metro_size are the largest-magnitude features in both scenarios; metro_size ranks 2nd for both."
              caption="Overall driver magnitude, RBA vs. Etihad Park rows: metro_size ranks 2nd in both scenarios, right behind year — a real, consistent driver, not a one-off artifact of the counterfactual swap. team_venue_tenure and team_league_tenure sit lower on overall magnitude, but direction is what matters for the next panel."
            />
            <FigureCard
              src={shapMechanism}
              label="Figure 5"
              alt="SHAP shift plot: team_venue_tenure is the largest negative driver of CatBoost's lower Etihad Park prediction, while metro_size and venue_name are the largest positive drivers"
              caption="Swapping Red Bull Arena for Etihad Park and re-running TreeSHAP: team_venue_tenure (dropping to 0 — Gotham's first season there) is actually the single largest driver of the shift, and it pulls the prediction down, not up — this model finds no generic 'new venue' excitement bump in the training data's own relocations. metro_size still pulls up (+0.036), a real, separate, positive contribution — not proxying for newness, since newness itself is working the other way."
            />
          </div>
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            Read together: this is a more honest version of the mechanism check than one without
            tenure features. Once "just relocated" and "just expanded" have their own outlet,
            metro_size's positive contribution can't be a proxy for stadium-novelty excitement —
            if anything it's rising against that headwind — which is stronger evidence that
            accessibility specifically, not newness generally, is doing the work.
          </p>
        </div>

        <TransitionHeading>That comparison is only two venues. Does the relationship hold across all 14?</TransitionHeading>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 6 — 13_shap_mechanism_check.ipynb
          </p>
          <FigureCard
            src={shapMetroSizeDependence}
            alt="Scatter plot: metro_size (60-minute reachable population) on the x-axis vs. each game's SHAP value for metro_size on the y-axis, one light dot per game and one solid dot per venue mean, rising monotonically from lower left to upper right across 17 real training venues, with Etihad Park plotted separately as a star well beyond the real data's range"
            claim="Every real venue traces the same upward line — but Etihad Park sits past the edge of anything the model has actually seen."
            caption="TreeSHAP run on all ~1,100 real training rows (not the synthetic RBA/Etihad grid). Each light dot is one game; each solid dot is a venue's mean SHAP contribution for metro_size, plotted against that venue's own reachable population. Venue-level correlation between metro_size and its mean SHAP contribution: r = 0.85 across the 17 venues with a real catchment value (5 older venues — SeatGeek Stadium, Yurcak Field, UW Medicine Pitch, Camping World Stadium, Moda Field — predate this project's isochrone build and are excluded from this figure entirely). Red Bull Arena is labeled for reference — it sits right on the line, not off it. The star is Etihad Park, plotted from the same synthetic counterfactual grid as Figure 5, not a real training row: at 3.2M reachable it's 2.2× BMO Stadium's 1.46M, the largest real value in the data — dashed line marks that boundary. Its SHAP value (0.16) actually sits below BMO's (0.20), even though its catchment is over twice as large — a tree can't extrapolate past the split thresholds it learned, so this is the model flattening out beyond its training range, not evidence attendance keeps climbing past what BMO shows. The dependence relationship itself is solid; treat the exact Etihad prediction with more caution than the relationship it's built on."
          />
        </div>

        {/* ============================================================ */}
        <ResultsQuestionHeading
          index="Q3"
          question="Will attendance actually increase?"
          sub="Accessibility tripled, and the mechanism check says that's real, not novelty. Does it show up in attendance — and can any of these models actually say by how much?"
        />

        <div className="mb-6">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 7 — where every model's own Queens prediction lands
          </p>
          <FigureCard
            src={modelDivergence}
            alt="Dumbbell plot: CatBoost and GBT's naive-to-held-out-team predictions both cluster near Gotham's actual 2026 attendance (8,000-12,000); the synthetic control range (22,137-25,000, equal to capacity) sits well above all of them; extended linear regression is excluded as an unusable extrapolation"
            caption="One row per model, naive fit (open dot) to held-out-team fit (filled dot) where both exist. CatBoost's estimate actually moves closer to Gotham's real 2026 average once Gotham is excluded from training (8,361 → 10,852) — GBT barely moves (11,733 → 12,078). Either way, every predictive model lands close to flat, not a meaningful lift. Extended linear regression isn't shown at all: asked to extrapolate to Etihad Park's accessibility value, it predicts 44,890–105,688, over 4× capacity — not because it's a worse model, but because a straight line has no way to cap itself outside the range it was trained on, unlike a tree. None of the predictive models come close to the synthetic control's 22,137–25,000 range, because synthetic control is answering a different question — Gotham's own pre/post trajectory vs. comparable teams' own moves — that these row-level attendance models were never built to answer."
          />
        </div>

        <TransitionHeading>So the number this project actually reports comes from synthetic control.</TransitionHeading>

        <div className="mb-6">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-1">Figure 8 — 05_synthetic_control.ipynb</p>
          <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] mb-3">
            Synthetic control: what staying at Red Bull Arena would have looked like instead.
          </p>
          <FigureCard
            src={scmGapPlot}
            alt="Gotham FC's actual and projected attendance vs. a synthetic no-move control, diverging sharply after Etihad Park opens in 2027, with the post-move Queens projection split into a low-scenario and a capacity-cap-scenario line and the range between them shaded"
            caption="Post-move Gotham is, in feature terms, an unseen team — exactly the case the models above can't predict. Synthetic control sidesteps that: instead of learning a general function across teams, it builds a weighted combination of other real teams (North Carolina Courage, Orlando Pride, and Washington Spirit carry most of the weight) that tracks Gotham's own pre-move trajectory closely through 2026, then reads the causal effect off the post-move divergence — this project's central estimate. The Queens line splits into two explicit post-move scenarios, shaded between them: San Diego's +68.8% lift as the low-scenario floor, the Seattle/Washington Spirit capacity-cap scenario as the ceiling — not a statistical confidence interval, but the range this project's own comparable relocations bound."
          />
        </div>

        <div className="mb-14">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            Figure 8 — 2027 attendance, three scenarios
          </p>
          <ScenarioBars />
          <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed mt-3">
            The two post-move scenarios come directly from three comparable relocating teams'
            own pre/post attendance changes (San Diego +68.8%, Seattle +103.5%, Washington Spirit
            +174.3% — the latter two both round to Etihad Park's capacity cap). Kansas City
            Current is excluded: it sells out its smaller stadium every game, so its raw
            attendance change understates true demand rather than reflecting it.
          </p>
        </div>
      </div>
    </section>
  )
}
