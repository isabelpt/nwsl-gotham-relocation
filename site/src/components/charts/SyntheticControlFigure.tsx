import { donorWeights, projection2028, syntheticControlFit } from '../../data/syntheticControl'
import { placebos } from '../../data/relocations'

const MAX_WEIGHT = Math.max(...donorWeights.map((d) => d.weight))

// Categorical x: the five fitted seasons plus 2028, with a visual break standing in for the
// 2027 season this project doesn't have a fitted point for -- Etihad Park opens between the two,
// not on a specific season inside this chart. Same break idiom as LeagueGrowthChart's COVID gap.
const YEARS = [2022, 2023, 2024, 2025, 2026, 2028] as const
// Sized larger than a typical inline chart -- this is the project's headline figure, and at the
// old 640x260 the line work and the fan-out projection read as clutter rather than a story.
// The viewBox's own aspect ratio is taller than a typical line chart's, close to the aspect of
// the space next to the donor-weights column it sits beside: with `preserveAspectRatio="meet"`
// scaling to fill that column's height, a flatter box would letterbox and leave the same dead
// space above/below the plot that stretching the SVG element was meant to remove.
const W = 760
const H = 640
const PAD_L = 80
const PAD_R = 20
const PAD_T = 30
const PAD_B = 36
const Y_MAX = 26000
const Y_TICKS = [0, 5000, 10000, 15000, 20000, 25000]

/** For each placebo team, the share of its real post-move rise that the growth-only synthetic
 * control did NOT predict -- i.e. how much of what actually happened looks like the move itself
 * rather than the league getting more popular anyway. Condensed down from the full placebo
 * figure (dumbbell chart + table) into the one number that matters here: growth explains some of
 * it, the move explains the rest, and this is the rest as a share of the whole. */
// FIXED 2026-08-29: this was computing (actual - scmImplied) / actual, which is growth's
// share of the rise, not the move's -- the opposite of the "not explained by growth" label
// and this comment's own stated intent. scmImpliedLiftPct is already the growth-corrected,
// move-attributable lift (see data/relocations.ts and the paper's Discussion), so the move's
// share of the total observed rise is scmImplied / actual, not the complement of that.
const placeboSeparation = placebos.map((p) => ({
  team: p.team,
  pct: (p.scmImpliedLiftPct / p.actualLiftPct) * 100,
}))

function xPos(year: number) {
  const i = YEARS.indexOf(year as (typeof YEARS)[number])
  return PAD_L + (i / (YEARS.length - 1)) * (W - PAD_L - PAD_R)
}
function yPos(v: number) {
  return H - PAD_B - (v / Y_MAX) * (H - PAD_T - PAD_B)
}

const fitYears = syntheticControlFit.map((p) => p.year)
const lastFit = syntheticControlFit[syntheticControlFit.length - 1]

/** The chart Answer 1 was missing: what synthetic control actually looks like over time, not
 * just the range it produces. Rebuilt natively (not a dropped-in matplotlib PNG) using the
 * weights output/synthetic_control_weights.csv actually assigned, applied to each donor's own
 * season average -- see data/syntheticControl.ts for exactly how each number was derived. */
export default function SyntheticControlFigure({ label }: { label?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-6 md:gap-8 items-stretch">
      <div className="flex flex-col">
        {label && (
          <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">{label}</p>
        )}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full flex-1 min-h-0"
          role="img"
          aria-label="Line chart, 2022 through 2028. Gotham FC's actual home attendance and a synthetic no-move counterfactual track each other loosely from 2022 to 2026. From 2026, three dashed lines fan out above the counterfactual toward 2028 -- a low, mid, and high scenario -- shaded as a range, while the counterfactual keeps climbing on its own, slower path to about 13,100."
        >
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yPos(t)} y2={yPos(t)} stroke="var(--color-line)" strokeWidth={1} />
              <text x={PAD_L - 10} y={yPos(t) + 5} textAnchor="end" fontSize={18} fill="var(--color-ink)" opacity={0.75}>
                {t.toLocaleString()}
              </text>
            </g>
          ))}
          {YEARS.map((yr) => (
            <text key={yr} x={xPos(yr)} y={H - PAD_B + 20} textAnchor="middle" fontSize={18} fill="var(--color-ink)" opacity={0.75}>
              {yr}
            </text>
          ))}
          {/* Gap marker standing in for 2027, the way LeagueGrowthChart marks its COVID gap. */}
          <line
            x1={(xPos(2026) + xPos(2028)) / 2}
            x2={(xPos(2026) + xPos(2028)) / 2}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="var(--color-ink)"
            strokeWidth={1}
            strokeDasharray="1 4"
            opacity={0.3}
          />
          <text
            x={(xPos(2026) + xPos(2028)) / 2}
            y={PAD_T - 10}
            textAnchor="middle"
            fontSize={16}
            fill="var(--color-ink)"
            opacity={0.65}
          >
            Etihad Park opens
          </text>

          {/* Projection fan, 2026 -> 2028: shaded low-to-high range plus a mid line, all dashed
              since none of it is observed. Drawn before the solid lines so it sits underneath. */}
          <polygon
            points={`${xPos(2026)},${yPos(lastFit.actual)} ${xPos(2028)},${yPos(projection2028.low)} ${xPos(2028)},${yPos(projection2028.high)}`}
            fill="var(--color-accent)"
            opacity={0.12}
          />
          <line x1={xPos(2026)} y1={yPos(lastFit.actual)} x2={xPos(2028)} y2={yPos(projection2028.low)} stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={xPos(2026)} y1={yPos(lastFit.actual)} x2={xPos(2028)} y2={yPos(projection2028.mid)} stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.65} />
          <line x1={xPos(2026)} y1={yPos(lastFit.actual)} x2={xPos(2028)} y2={yPos(projection2028.high)} stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="4 3" />

          {/* Counterfactual continuing on its own trend, no fan -- it's one baseline, not a range. */}
          <line
            x1={xPos(2026)}
            y1={yPos(lastFit.synthetic)}
            x2={xPos(2028)}
            y2={yPos(projection2028.noMove)}
            stroke="var(--color-ink)"
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          {/* Fitted history, solid: what actually happened, both lines. */}
          <polyline
            points={syntheticControlFit.map((p) => `${xPos(p.year)},${yPos(p.synthetic)}`).join(' ')}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <polyline
            points={syntheticControlFit.map((p) => `${xPos(p.year)},${yPos(p.actual)}`).join(' ')}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
          />
          {fitYears.map((yr) => {
            const p = syntheticControlFit.find((d) => d.year === yr)!
            return (
              <g key={yr}>
                <circle cx={xPos(yr)} cy={yPos(p.synthetic)} r={2.5} fill="var(--color-ink)" fillOpacity={0.6} />
                <circle cx={xPos(yr)} cy={yPos(p.actual)} r={2.5} fill="var(--color-accent)" />
              </g>
            )
          })}
          <circle cx={xPos(2028)} cy={yPos(projection2028.noMove)} r={3} fill="var(--color-paper)" stroke="var(--color-ink)" strokeOpacity={0.6} strokeWidth={1.5} />
          <circle cx={xPos(2028)} cy={yPos(projection2028.high)} r={3.5} fill="var(--color-paper)" stroke="var(--color-accent)" strokeWidth={2} />

          {/* A fixed legend in the empty top-left corner, rather than labels pinned to the lines
              themselves -- the two fitted lines start 2022 only 760 fans apart, so no position
              near the data reads as unambiguously "belonging" to one line over the other. A
              legend that doesn't move with the data has no such problem. */}
          <g transform={`translate(${PAD_L + 14}, ${PAD_T + 8})`}>
            <rect x={-8} y={-8} width={254} height={78} fill="var(--color-paper)" opacity={0.88} />
            <line x1={0} x2={20} y1={6} y2={6} stroke="var(--color-accent)" strokeWidth={3} />
            <text x={28} y={10} fontSize={16} fontWeight={600} fill="var(--color-primary-deep)">
              Gotham FC (actual)
            </text>
            <line x1={0} x2={20} y1={30} y2={30} stroke="var(--color-ink)" strokeOpacity={0.6} strokeWidth={2.5} />
            <text x={28} y={34} fontSize={16} fill="var(--color-ink)" opacity={0.8}>
              Synthetic no-move twin
            </text>
            <line x1={0} x2={20} y1={54} y2={54} stroke="var(--color-ink)" strokeOpacity={0.5} strokeWidth={2} strokeDasharray="4 3" />
            <text x={28} y={58} fontSize={13} fill="var(--color-ink)" opacity={0.6}>
              Dashed = projected, not observed
            </text>
          </g>
        </svg>
        <p className="text-xs text-[var(--color-ink)]/70 leading-relaxed mt-3">
          Gotham's real trajectory and its synthetic no-move twin through 2026, then where each one goes
          from there. The counterfactual keeps rising on league growth alone; the actual line breaks
          away above it once Etihad Park opens.
        </p>
      </div>

      <div>
        <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">
          What the synthetic twin is made of
        </p>
        <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed mb-4">
          Three teams' history, weighted so their combined path tracks Gotham's own before the move.
        </p>
        <ul className="space-y-2.5">
          {donorWeights.map((d) => (
            <li key={d.team} className="grid grid-cols-[7.5rem_1fr_3rem] sm:grid-cols-[9rem_1fr_3rem] items-center gap-2">
              <span className="text-[12px] text-[var(--color-ink)]/80 leading-tight">{d.team}</span>
              <div className="h-3.5 bg-[var(--color-paper-alt)] border border-[var(--color-line)]">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{ width: `${(d.weight / MAX_WEIGHT) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[12px] text-[var(--color-ink)]/70 text-right">
                {d.weight.toFixed(3)}
              </span>
            </li>
          ))}
          <li className="grid grid-cols-[7.5rem_1fr_3rem] sm:grid-cols-[9rem_1fr_3rem] items-center gap-2 opacity-50">
            <span className="text-[12px] text-[var(--color-ink)]/80 leading-tight">Rest of the league</span>
            <div className="h-3.5 bg-[var(--color-paper-alt)] border border-[var(--color-line)]" />
            <span className="font-mono text-[12px] text-[var(--color-ink)]/70 text-right">≈0</span>
          </li>
        </ul>
        <p className="text-[11px] text-[var(--color-ink)]/55 mt-4 leading-relaxed">
          Weights are chosen so the blend's pre-move attendance path matches Gotham's own as closely as
          possible; nine other teams received weights under 0.001 and don't move the result.
        </p>

        <div className="mt-6 pt-5 border-t border-[var(--color-line)]">
          <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-2">
            Does this method actually work?
          </p>
          <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed mb-3">
            Gotham hasn't moved yet, so I refit the same method on the two teams that already have
            and checked it against what they really did.
          </p>
          <ul className="space-y-2">
            {placeboSeparation.map((p) => (
              <li key={p.team} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-[var(--color-ink)]/80">{p.team}</span>
                <span className="font-mono text-[13px] font-semibold text-[var(--color-primary-deep)] whitespace-nowrap">
                  {p.pct.toFixed(0)}% not explained by growth
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[var(--color-ink)]/55 mt-3 leading-relaxed">
            Share of each team's real post-move rise that the growth-only synthetic twin didn't
            predict: the part this project attributes to the move itself, not the league
            getting more popular anyway. Only that share is what gets applied to Gotham.
          </p>
        </div>
      </div>
    </div>
  )
}
