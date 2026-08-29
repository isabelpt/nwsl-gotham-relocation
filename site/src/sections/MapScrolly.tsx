import { useEffect, useState } from 'react'
import AccessibilityMap from '../components/AccessibilityMap'
import { loadTradeStats, type TradeStats } from '../map/tractData'
import type { MapView, Threshold } from '../map/types'
import { useInView } from '../scroll/useInView'
import { useStickySteps } from '../scroll/useStickySteps'

type Step = {
  view: MapView
  threshold: Threshold
  head: string
  /** Built from the computed trade figures where the sentence quotes one, so the caption can
   * never drift from the map underneath it. */
  body: (s: TradeStats | null) => string
}

const STEPS: Step[] = [
  {
    view: 'compare',
    threshold: 30,
    head: 'Half an hour from the game.',
    body: () =>
      'Red reaches Harrison faster, purple reaches Queens faster. Inside thirty minutes each stadium still serves its own side of the river.',
  },
  {
    view: 'compare',
    threshold: 60,
    head: 'At an hour, the map turns purple.',
    body: () =>
      'Etihad Park sits on the 7 train, a single ride into Midtown. Sports Illustrated Stadium has PATH, which stops downtown.',
  },
  {
    view: 'gainers',
    threshold: 60,
    head: 'Almost all of New York gets closer.',
    body: (s) =>
      s
        ? `${s.nycBetterPop.toLocaleString()} people on the New York side end up nearer to a home game, saving ${Math.round(s.avgMinutesSaved)} minutes on average. Queens gains the most: Flushing goes from 94 minutes to 22.`
        : 'The New York side moves nearer to a home game, and Queens gains the most of all.',
  },
  {
    view: 'losers',
    threshold: 60,
    head: 'New Jersey pays for it.',
    body: (s) =>
      s
        ? `${s.njWorsePop.toLocaleString()} people, almost all of them on the club's current side of the river, end up farther away, by ${Math.round(s.avgMinutesLost)} minutes on average. ${s.ringLostPop.toLocaleString()} of them fall out of the one-hour ring entirely.`
        : "The club's current side of the river ends up farther from the stadium.",
  },
  {
    view: 'compare',
    threshold: 60,
    head: 'Now find your own trip.',
    body: () =>
      'Click any tract or search an address to see how that neighbourhood’s journey to a Gotham home game changes. The controls are yours from here.',
  },
]

/** The trade, told on one pinned map. The reader scrolls through the same geography five times
 * -- close in, at an hour, the winners, the losers -- and lands with the map handed over to
 * them. Scrolling back up rewinds it, because the step comes from scroll position rather than
 * from a timer. */
export default function MapScrolly() {
  const { containerRef, activeStep } = useStickySteps(STEPS.length)
  const [nearRef, near] = useInView<HTMLDivElement>({ rootMargin: '900px 0px 900px 0px' })
  const [stats, setStats] = useState<TradeStats | null>(null)

  // Held back until the reader is within a screen of the map, for the same reason the map itself
  // is: these captions quote figures derived from the ~1.8MB tract file, and this section sits
  // about ten screens down.
  useEffect(() => {
    if (!near) return
    loadTradeStats().then(setStats).catch(() => setStats(null))
  }, [near])

  const step = STEPS[activeStep] ?? STEPS[0]
  const isFinal = activeStep === STEPS.length - 1

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen"
      style={{ height: `${STEPS.length * 90 + 10}vh` }}
    >
      <div ref={nearRef} className="sticky top-16 h-[calc(100vh-4rem)] px-3 md:px-6 py-3">
        <AccessibilityMap
          // On the last step the overrides are dropped, which hands the view buttons, the
          // threshold slider and the map back to the reader.
          viewOverride={isFinal ? undefined : step.view}
          thresholdOverride={isFinal ? undefined : step.threshold}
          defaultThreshold={60}
          fillHeight
          caption={isFinal ? null : { head: step.head, body: step.body(stats) }}
        />
      </div>
    </div>
  )
}
