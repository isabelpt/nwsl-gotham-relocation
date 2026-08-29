import { relocations } from '../../data/relocations'
import ChartFrame from './ChartFrame'

// Log-x because the five reach gains span two and a half orders of magnitude (12% to 2,508%) --
// a linear axis would crush the three usable points into the first few pixels.
const W = 720
const H = 260
const PAD_L = 72
const PAD_R = 24
const PAD_T = 20
const PAD_B = 40
const X_MIN = 10
const X_MAX = 3000
const Y_MIN = 0
const Y_MAX = 190

const X_TICKS = [10, 30, 100, 300, 1000, 3000]
const Y_TICKS = [0, 50, 100, 150]

function x(pct: number) {
  const t = (Math.log10(pct) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))
  return PAD_L + t * (W - PAD_L - PAD_R)
}
function y(pct: number) {
  const t = (pct - Y_MIN) / (Y_MAX - Y_MIN)
  return H - PAD_B - t * (H - PAD_T - PAD_B)
}

const usable = relocations.filter((r) => r.status === 'usable')
const gotham = relocations.find((r) => r.status === 'future')!
const excluded = relocations.filter((r) => r.status === 'excluded')

export default function RelocationScatter({ label }: { label?: string }) {
  return (
    <ChartFrame
      label={label}
      title="Bigger reach gain, bigger attendance jump"
      deck={
        <>
          Each of the three usable relocations drew a bigger jump than the last, in the same order as
          its reach gain. That is what H3 predicts, but the sample size is small.
        </>
      }
      note={
        <>
          Reach gain (x-axis, log scale) is the change in 60-minute reachable population; attendance
          change (y-axis) is raw, not corrected for league growth. Kansas City is shown but excluded
          because its huge reach gain comes off almost nothing (two tracts, one hourly bus
          route), and its attendance is capacity-suppressed. Gotham hasn't moved yet, so it has an x
          position and no y.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Scatter plot of reach gain versus attendance change for five NWSL relocations. San Diego, Seattle, and Washington Spirit rise in the same order as their reach gain. Kansas City is shown separately as excluded. Gotham's reach gain is marked with no attendance value, since it has not yet moved.">
        {/* Gridlines */}
        {Y_TICKS.map((t) => (
          <g key={`y-${t}`}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={PAD_L - 8} y={y(t) + 4} textAnchor="end" fontSize={10} fill="var(--color-ink)" opacity={0.6}>
              +{t}%
            </text>
          </g>
        ))}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fontSize={11}
          fill="var(--color-ink)"
          opacity={0.7}
          transform={`translate(16, ${(PAD_T + H - PAD_B) / 2}) rotate(-90)`}
        >
          Attendance change
        </text>
        {X_TICKS.map((t) => (
          <g key={`x-${t}`}>
            <line x1={x(t)} x2={x(t)} y1={PAD_T} y2={H - PAD_B} stroke="var(--color-line)" strokeWidth={0.5} opacity={0.5} />
            <text x={x(t)} y={H - PAD_B + 16} textAnchor="middle" fontSize={10} fill="var(--color-ink)" opacity={0.6}>
              +{t}%
            </text>
          </g>
        ))}
        <text x={(PAD_L + W - PAD_R) / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="var(--color-ink)" opacity={0.7}>
          Reach gain (log scale)
        </text>

        {/* Ordering guide -- connects the three usable points in reach-gain order. Not a fitted
            regression: three points don't support one, and drawing a straight trend line here
            would overstate the confidence H3's own verdict explicitly declines to claim. */}
        <polyline
          points={usable.map((r) => `${x(r.accessChangePct)},${y(r.attChangePct!)}`).join(' ')}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          strokeDasharray="3 4"
          opacity={0.5}
        />

        {usable.map((r) => (
          <g key={r.team}>
            <circle cx={x(r.accessChangePct)} cy={y(r.attChangePct!)} r={7} fill="var(--color-primary)" />
            <text
              x={x(r.accessChangePct)}
              y={y(r.attChangePct!) - 12}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="var(--color-primary-deep)"
            >
              {r.team.replace(' FC', '').replace(' Wave', '').replace(' Current', '').replace(' Reign', '')}
            </text>
          </g>
        ))}

        {excluded.map((r) => (
          <g key={r.team}>
            <circle
              cx={x(r.accessChangePct)}
              cy={y(r.attChangePct!)}
              r={7}
              fill="var(--color-paper)"
              stroke="var(--color-ink)"
              strokeOpacity={0.4}
              strokeWidth={1.5}
            />
            <text
              x={x(r.accessChangePct)}
              y={y(r.attChangePct!) - 12}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-ink)"
              opacity={0.55}
            >
              Kansas City (excluded)
            </text>
          </g>
        ))}

        {/* Gotham: known x, unknown y -- a dashed guide up from the axis rather than a plotted
            point, so it can't be misread as a measured attendance change. */}
        <line
          x1={x(gotham.accessChangePct)}
          x2={x(gotham.accessChangePct)}
          y1={H - PAD_B}
          y2={PAD_T + 10}
          stroke="var(--color-accent)"
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
        <text x={x(gotham.accessChangePct)} y={PAD_T - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-primary-deep)">
          Gotham (not yet moved)
        </text>
      </svg>
    </ChartFrame>
  )
}
