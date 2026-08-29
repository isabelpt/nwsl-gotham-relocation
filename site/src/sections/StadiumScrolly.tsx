import StadiumFillViz from '../components/StadiumFillViz'
import { scenarios } from '../data/scenarios'
import { useStickySteps } from '../scroll/useStickySteps'

/** One caption per scenario in scenarios.ts, in the same order. The attendance figures are read
 * from that file rather than repeated here, so the words can never disagree with the bowl. */
const CAPTIONS = [
  {
    head: 'If Gotham never moves.',
    body: 'Riding league-wide growth alone from their current home in Harrison, they reach a bit under half the building.',
  },
  {
    head: 'The move, at its most cautious.',
    body: "San Diego's lift, with league growth stripped out. The smallest jump any comparable relocation actually delivered.",
  },
  {
    head: 'The middle case.',
    body: "Seattle's lift, the one relocation whose synthetic control I could validate against what really happened next.",
  },
  {
    head: 'The most optimistic case.',
    body: "Washington Spirit's lift, the largest of the three, close to a full house but not quite there.",
  },
]

export default function StadiumScrolly() {
  const { containerRef, activeStep } = useStickySteps(scenarios.length)
  const caption = CAPTIONS[activeStep] ?? CAPTIONS[0]
  const scenario = scenarios[activeStep] ?? scenarios[0]

  return (
    <div
      ref={containerRef}
      className="relative"
      // One screen to read each step, plus one to arrive on. The graphic stays pinned for the
      // whole run, so this height is what the reader scrolls *through* rather than past.
      style={{ height: `${scenarios.length * 90 + 10}vh` }}
    >
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-2 md:py-6">
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-3 md:mb-4 min-h-[4.5rem] md:min-h-[5.5rem]">
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="font-mono-label text-[11px] text-[var(--color-primary)]">
                {activeStep + 1} / {scenarios.length}
              </span>
              <span className="font-mono-label text-[11px] text-[var(--color-accent)]">
                {scenario.attendance.toLocaleString()} fans
              </span>
            </div>
            <p className="font-serif-heading text-2xl md:text-3xl font-semibold text-[var(--color-primary-deep)] leading-snug">
              {caption.head}
            </p>
            <p className="text-[15px] text-[var(--color-ink)]/75 leading-relaxed mt-1.5">
              {caption.body}
            </p>
          </div>

          <StadiumFillViz activeIndex={activeStep} compact />
        </div>
      </div>
    </div>
  )
}
