import { accessibilityEffect as fx } from '../../data/chartData'
import ChartFrame from './ChartFrame'

// Drawn in SVG rather than CSS because everything here sits at a precise position on a numeric
// axis -- the point estimate, the two interval ends and the zero line all have to land exactly.
const W = 720
const H = 128
// Wide enough on the left for the right-anchored "no effect" caption and the lower-bound label,
// both of which sit outside the zero line and were being clipped by the viewBox.
const PAD_L = 72
const PAD_R = 46
const AXIS_Y = 56

/** Axis runs from zero so the reader can see how close the lower bound gets to "no effect at
 * all", which is the honest reading of this interval. */
const X_MAX = 30
const TICKS = [0, 5, 10, 15, 20, 25, 30]

function x(pct: number) {
  return PAD_L + (pct / X_MAX) * (W - PAD_L - PAD_R)
}

export default function CoefficientChart({ label }: { label?: string }) {
  return (
    <ChartFrame
      label={label}
      title="More people within reach, more fans in the stands"
      deck={
        <>
          Each doubling of the population that can reach a stadium within an hour is worth about{' '}
          <strong>{Math.round(fx.pointPct)}% more fans</strong>. The interval stays above zero,
          which is what makes the effect real — and it is wide, which is why every estimate built
          on it is reported as a range.
        </>
      }
      note={
        <>
          Ordinary least squares of log attendance on log reachable population,{' '}
          {fx.games.toLocaleString()} home games, 2016–2026. Standard errors clustered by team; p ={' '}
          {fx.pValue.toFixed(2)}. Bar shows the 95% confidence interval, converted from the log-log
          coefficient to the change per doubling of reach.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Effect of accessibility on attendance. Each doubling of the reachable population is associated with ${fx.pointPct.toFixed(1)} percent more fans, with a 95 percent confidence interval running from ${fx.lowPct.toFixed(1)} to ${fx.highPct.toFixed(1)} percent. The interval stays above zero.`}
      >
        {TICKS.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={22}
              y2={AXIS_Y + 22}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
            <text
              x={x(t)}
              y={AXIS_Y + 40}
              textAnchor="middle"
              className="font-mono-label"
              fontSize={11}
              fill="var(--color-ink)"
              opacity={0.6}
            >
              {t === 0 ? '0%' : `+${t}%`}
            </text>
          </g>
        ))}

        {/* Zero line, called out: the whole question is whether the interval clears it. */}
        <line
          x1={x(0)}
          x2={x(0)}
          y1={16}
          y2={AXIS_Y + 22}
          stroke="var(--color-ink)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.55}
        />
        <text
          x={x(0) - 6}
          y={20}
          textAnchor="end"
          fontSize={11}
          fill="var(--color-ink)"
          opacity={0.6}
        >
          no effect
        </text>

        <line
          x1={x(fx.lowPct)}
          x2={x(fx.highPct)}
          y1={AXIS_Y}
          y2={AXIS_Y}
          stroke="var(--color-primary)"
          strokeWidth={12}
          opacity={0.28}
        />
        <circle cx={x(fx.pointPct)} cy={AXIS_Y} r={9} fill="var(--color-primary)" />

        <text
          x={x(fx.pointPct)}
          y={AXIS_Y - 18}
          textAnchor="middle"
          className="font-serif-heading"
          fontSize={20}
          fontWeight={600}
          fill="var(--color-primary-deep)"
        >
          +{Math.round(fx.pointPct)}%
        </text>
        <text x={x(fx.lowPct) - 8} y={AXIS_Y + 5} textAnchor="end" fontSize={11} fill="var(--color-ink)" opacity={0.7}>
          +{fx.lowPct.toFixed(1)}%
        </text>
        <text x={x(fx.highPct) + 8} y={AXIS_Y + 5} fontSize={11} fill="var(--color-ink)" opacity={0.7}>
          +{Math.round(fx.highPct)}%
        </text>

        <text
          x={W / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={12}
          fill="var(--color-ink)"
          opacity={0.75}
        >
          Change in attendance each time the reachable population doubles
        </text>
      </svg>
    </ChartFrame>
  )
}
