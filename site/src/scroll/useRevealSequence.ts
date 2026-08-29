import { useEffect, useState } from 'react'

/** Walks an index from 0 to `count - 1` once `active` turns true, pausing `intervalMs` between
 * steps. Used by the graphics that tell a short story on arrival: the stadium bowl filling
 * through its four attendance scenarios, and the map blooming out through its travel-time rings.
 *
 * This is the project's answer to scroll-driven storytelling without pinning the graphic: the
 * sequence plays when the reader reaches it, then leaves the final frame on screen with manual
 * controls, so nothing is trapped behind a scroll position.
 *
 * `reducedMotion` skips straight to the last frame -- the information is in the final state, so
 * a reader who has asked for less motion loses nothing but the animation. */
export function useRevealSequence(
  count: number,
  { active, intervalMs = 900, reducedMotion = false }: { active: boolean; intervalMs?: number; reducedMotion?: boolean },
) {
  const last = Math.max(0, count - 1)
  const [index, setIndex] = useState(0)
  /** Set once the sequence has finished (or been skipped), so callers can hand control back
   * to the reader without the timer fighting their clicks. */
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active || done) return

    if (reducedMotion) {
      setIndex(last)
      setDone(true)
      return
    }

    if (index >= last) {
      setDone(true)
      return
    }

    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), intervalMs)
    return () => clearTimeout(timer)
  }, [active, done, index, intervalMs, last, reducedMotion])

  /** Lets a click take over: cancels the sequence and pins the graphic to the reader's choice. */
  function takeControl(next: number) {
    setDone(true)
    setIndex(next)
  }

  return { index, done, takeControl }
}
