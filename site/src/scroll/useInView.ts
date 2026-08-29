import { useEffect, useRef, useState } from 'react'

/** Fires when an element scrolls into the viewport. Same IntersectionObserver idiom Nav.tsx
 * already uses for section highlighting, kept deliberately simple: this project takes no
 * animation dependency, and an observer is all the scroll-awareness the story needs.
 *
 * `once` (the default) disconnects after the first entry, so a graphic that animates itself
 * on arrival doesn't replay every time the reader scrolls back past it. */
export function useInView<T extends HTMLElement>(
  { once = true, rootMargin = '-15% 0px -15% 0px' }: { once?: boolean; rootMargin?: string } = {},
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver (very old browser, some test envs): show the content rather
    // than leaving it permanently hidden behind an animation that will never trigger.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold: 0 },
    )
    observer.observe(el)

    // Fallback for environments where the observer never gets to run -- an uncomposited
    // webview, a background tab, a screenshot capture. IntersectionObserver is driven by the
    // rendering lifecycle, so where painting is suspended it stays silent indefinitely and
    // anything gated on it would never appear. Geometry checks aren't throttled the same way,
    // so a timer plus a passive scroll listener (the same idiom Nav.tsx uses for its progress
    // bar) lets the content through. Both detach as soon as the element has been seen.
    let fallbackTimer = 0

    function checkGeometry() {
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < viewportH && rect.bottom > 0) {
        setInView(true)
        detachFallback()
      }
    }

    function detachFallback() {
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('scroll', checkGeometry)
    }

    fallbackTimer = window.setTimeout(checkGeometry, 1200)
    window.addEventListener('scroll', checkGeometry, { passive: true })

    return () => {
      observer.disconnect()
      detachFallback()
    }
  }, [once, rootMargin])

  return [ref, inView] as const
}

/** True when the reader has asked the OS to minimise motion. Read once at mount and kept in
 * state so a change in the setting re-renders. Every animated affordance on this site checks
 * this and jumps straight to its final state instead. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
