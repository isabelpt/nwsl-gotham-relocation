import { useEffect, useRef, useState } from 'react'

/** Drives a pinned graphic from scroll position.
 *
 * The container is made several screens tall and its child is `position: sticky`, so the
 * graphic holds still while the page scrolls past it. How far the reader has travelled through
 * the container decides which step is showing, which means scrolling back up rewinds the
 * sequence -- the reader is scrubbing it, not watching it play.
 *
 * Deliberately built on a passive scroll listener rather than IntersectionObserver: this needs
 * a continuous position, not a threshold crossing, and it matches the listener Nav.tsx already
 * uses for its reading-progress bar. */
export function useStickySteps(stepCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  /** True while the graphic is actually pinned, so the caller can fade the caption in and out
   * instead of having it pop at the boundaries. */
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || stepCount < 1) return

    function measure() {
      const node = containerRef.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      // Distance scrolled into the container, over the distance it can travel while pinned.
      const travelled = -rect.top
      const total = rect.height - viewportH

      setPinned(rect.top <= 0 && rect.bottom >= viewportH)

      if (total <= 0) {
        setActiveStep(0)
        return
      }

      const progress = Math.min(1, Math.max(0, travelled / total))
      // The last step needs its own share of the scroll rather than only existing at exactly
      // progress === 1, hence stepCount rather than stepCount - 1 here.
      const step = Math.min(stepCount - 1, Math.floor(progress * stepCount))
      setActiveStep(step)
    }

    // Measured straight from the scroll handler rather than coalesced through
    // requestAnimationFrame. rAF looks like the tidier choice, but where its callbacks are
    // throttled to nothing the pending-frame guard latches and the sequence freezes for good.
    // A getBoundingClientRect read is cheap, and React bails out of the re-render whenever the
    // step hasn't actually changed, so the common case costs nothing either way.
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [stepCount])

  return { containerRef, activeStep, pinned }
}
