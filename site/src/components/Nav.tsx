import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#question', label: 'Question' },
  { href: '#data', label: 'Data' },
  { href: '#method', label: 'Method' },
  { href: '#results', label: 'Results' },
  { href: '#takeaway', label: 'Takeaway' },
]

export default function Nav() {
  const [active, setActive] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => el !== null,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
          setActive(`#${topMost.target.id}`)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((el) => observer.observe(el))

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      setProgress(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)]">
          Gotham FC → Queens
        </a>
        <ul className="hidden md:flex items-center gap-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono-label text-xs transition-colors"
                style={{
                  color: active === link.href ? 'var(--color-primary)' : 'var(--color-ink)',
                  borderBottom: active === link.href ? '2px solid var(--color-accent)' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="md:hidden font-mono-label text-xs border border-[var(--color-primary)] text-[var(--color-primary)] px-3 py-1.5"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>
      {menuOpen && (
        <ul id="mobile-nav-menu" className="md:hidden border-t border-[var(--color-line)] bg-[var(--color-paper)]">
          {LINKS.map((link) => (
            <li key={link.href} className="border-b border-[var(--color-line)] last:border-b-0">
              <a
                href={link.href}
                className="font-mono-label text-xs block px-6 py-3"
                style={{ color: active === link.href ? 'var(--color-primary)' : 'var(--color-ink)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="h-[2px] bg-[var(--color-line)]">
        <div
          className="h-full bg-[var(--color-accent)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
