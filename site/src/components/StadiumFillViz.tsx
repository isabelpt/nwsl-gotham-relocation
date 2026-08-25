import { useState } from 'react'

// From output/gotham_2027_projection.csv (05_synthetic_control.ipynb). Etihad Park capacity = 25,000.
const SCENARIOS = [
  { key: 'baseline', label: 'No move', attendance: 13116, pct: 52.5, color: 'var(--color-ink)' },
  { key: 'low', label: 'Etihad — low', attendance: 22137, pct: 88.5, color: 'var(--color-primary)' },
  { key: 'cap', label: 'Etihad — capacity cap', attendance: 25000, pct: 100, color: 'var(--color-accent)' },
] as const

// Real pitch proportions (105m x 68m ~ 1.54:1), scaled down, not a made-up square.
const PITCH_W = 200
const PITCH_H = 130

// Three rectangular seating tiers, each a fixed offset further out from the pitch edge —
// a real stadium bowl, not an oval.
const RING_MARGINS = [22, 46, 70]
const ROOF_MARGIN = 26
const DOT_SPACING = 15 // target distance between adjacent dots, so tiers read as evenly spaced
const DOT_R = 5

const PAD = 22
const LABEL_H = 30

const pitchHalfW = PITCH_W / 2
const pitchHalfH = PITCH_H / 2
const outerHalfW = pitchHalfW + RING_MARGINS[RING_MARGINS.length - 1] + ROOF_MARGIN
const outerHalfH = pitchHalfH + RING_MARGINS[RING_MARGINS.length - 1] + ROOF_MARGIN

const CX = PAD + outerHalfW
const CY = PAD + outerHalfH
const VB_W = CX + outerHalfW + PAD
const VB_H = CY + outerHalfH + PAD + LABEL_H

/** Places dots along a rectangle's perimeter one side at a time, each side spaced
 * independently (rounded to its own nearest fit) and starting exactly at its corner. A single
 * perimeter-length offset instead drifts out of phase at each turn — since the four side
 * lengths rarely divide evenly by the same global count, corners end up with dots crowded
 * together or gapped depending on where the wrap happened to land. Per-side placement puts
 * exactly one dot at every corner and keeps spacing visually even on every edge. */
function buildRing(margin: number) {
  const halfW = pitchHalfW + margin
  const halfH = pitchHalfH + margin
  const corners: [number, number][] = [
    [CX - halfW, CY - halfH],
    [CX + halfW, CY - halfH],
    [CX + halfW, CY + halfH],
    [CX - halfW, CY + halfH],
  ]

  const points: { x: number; y: number }[] = []
  for (let s = 0; s < 4; s++) {
    const [x0, y0] = corners[s]
    const [x1, y1] = corners[(s + 1) % 4]
    const sideLength = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.max(1, Math.round(sideLength / DOT_SPACING))
    for (let k = 0; k < n; k++) {
      const t = k / n
      points.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t })
    }
  }

  const total = points.length
  return points.map((p, i) => ({ ...p, threshold: (i / total) * 100 }))
}

const RINGS = RING_MARGINS.map(buildRing)
const TOTAL_DOTS = RINGS.reduce((sum, ring) => sum + ring.length, 0)

export default function StadiumFillViz() {
  const [activeKey, setActiveKey] = useState<(typeof SCENARIOS)[number]['key']>('cap')
  const active = SCENARIOS.find((s) => s.key === activeKey)!

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm p-6">
      <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-4">
        What the scenario range actually looks like in the bowl
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            className="font-mono-label text-[11px] px-3 py-2 border transition-colors duration-150"
            style={
              activeKey === s.key
                ? { backgroundColor: s.color, borderColor: s.color, color: 'white' }
                : { borderColor: 'var(--color-line)', color: 'var(--color-primary)' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-6 items-center">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Stadium bowl fill visualization"
        >
          <defs>
            <radialGradient id="roofGradient" cx="50%" cy="40%" r="75%">
              <stop offset="65%" stopColor="var(--color-paper)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-line)" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Roof / upper-structure rectangle, purely decorative context around the seating tiers */}
          <rect
            x={CX - outerHalfW}
            y={CY - outerHalfH}
            width={outerHalfW * 2}
            height={outerHalfH * 2}
            fill="url(#roofGradient)"
          />
          <rect
            x={CX - outerHalfW}
            y={CY - outerHalfH}
            width={outerHalfW * 2}
            height={outerHalfH * 2}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={1.5}
          />

          {/* Seating tiers: each dot is one block of fans, evenly spaced by real distance around
              the rectangle, not by angle */}
          {RINGS.map((ring, ringIdx) =>
            ring.map((dot, i) => (
              <circle
                key={`${ringIdx}-${i}`}
                cx={dot.x}
                cy={dot.y}
                r={DOT_R}
                fill={active.pct >= dot.threshold ? active.color : 'var(--color-paper-alt)'}
                stroke={active.pct >= dot.threshold ? 'var(--color-primary-deep)' : 'var(--color-line)'}
                strokeWidth={0.6}
                opacity={active.pct >= dot.threshold ? 1 : 0.85}
                style={{ transition: 'fill 250ms ease' }}
              />
            )),
          )}

          {/* Pitch: true ~105x68m proportions, with real markings */}
          <rect
            x={CX - pitchHalfW}
            y={CY - pitchHalfH}
            width={PITCH_W}
            height={PITCH_H}
            fill="#dff0e4"
            stroke="var(--color-line)"
            strokeWidth={1.5}
          />
          <line x1={CX} y1={CY - pitchHalfH} x2={CX} y2={CY + pitchHalfH} stroke="#b9d6bf" strokeWidth={1.2} />
          <circle cx={CX} cy={CY} r={22} fill="none" stroke="#b9d6bf" strokeWidth={1.2} />
          <circle cx={CX} cy={CY} r={1.6} fill="#b9d6bf" />
          <rect x={CX - pitchHalfW} y={CY - 38} width={30} height={76} fill="none" stroke="#b9d6bf" strokeWidth={1.2} />
          <rect x={CX + pitchHalfW - 30} y={CY - 38} width={30} height={76} fill="none" stroke="#b9d6bf" strokeWidth={1.2} />

          <text
            x={CX}
            y={VB_H - LABEL_H / 2 + 3}
            textAnchor="middle"
            fontSize={9}
            fontFamily="var(--font-mono)"
            letterSpacing="0.1em"
            fill="var(--color-ink)"
            opacity={0.45}
          >
            ETIHAD PARK · CAPACITY 25,000
          </text>
        </svg>

        <div>
          <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-1">{active.label}</p>
          <p className="font-serif-heading text-4xl font-semibold text-[var(--color-primary-deep)]">
            {active.attendance.toLocaleString()}
          </p>
          <p className="text-sm text-[var(--color-ink)]/70 mt-1">
            {active.pct.toFixed(0)}% of Etihad Park's 25,000 capacity
          </p>
        </div>
      </div>

      <p className="font-mono-label text-[10px] text-[var(--color-ink)]/50 mt-5">
        {TOTAL_DOTS} dots across 3 seating tiers, evenly spaced around the bowl, each ≈{' '}
        {(100 / TOTAL_DOTS).toFixed(2)}% of capacity. "No move" and "capacity cap" are this
        project's estimated endpoints, not a literal prediction of exactly which seats fill.
      </p>
    </div>
  )
}
