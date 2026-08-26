export type Verdict = 'confirmed' | 'mixed' | 'unproven'

const STYLES: Record<Verdict, { label: string; fg: string; bg: string; mark: string }> = {
  confirmed: { label: 'Confirmed', fg: 'var(--color-yes)', bg: 'var(--color-yes-soft)', mark: '✓' },
  mixed: { label: 'Confirmed, with a catch', fg: 'var(--color-maybe)', bg: 'var(--color-maybe-soft)', mark: '!' },
  unproven: { label: 'Not proven', fg: 'var(--color-no)', bg: 'var(--color-no-soft)', mark: '?' },
}

/** Opens each Results subsection: the plain question, which hypothesis it tests, whether
 * it held, and the one-sentence answer. A reader who skims only these three blocks should
 * still come away with the finding. */
export default function HypothesisVerdict({
  id,
  question,
  claim,
  verdict,
  answer,
}: {
  id: string
  question: string
  claim: string
  verdict: Verdict
  answer: string
}) {
  const v = STYLES[verdict]
  return (
    <div className="mt-20 first:mt-0 mb-8">
      <div className="w-10 h-0.5 bg-[var(--color-accent)] mb-4" />
      <h3 className="font-serif-heading text-2xl md:text-3xl font-semibold leading-snug text-[var(--color-primary-deep)] mb-5">
        {question}
      </h3>

      <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
          <span className="font-mono text-sm font-semibold text-white bg-[var(--color-primary-deep)] px-2.5 py-1">
            {id}
          </span>
          <span className="text-sm text-[var(--color-ink)]/75 leading-snug flex-1 min-w-[14rem]">{claim}</span>
          <span
            className="font-mono-label text-[11px] font-semibold px-2.5 py-1 border whitespace-nowrap"
            style={{ color: v.fg, backgroundColor: v.bg, borderColor: v.fg }}
          >
            <span aria-hidden className="mr-1.5">
              {v.mark}
            </span>
            {v.label}
          </span>
        </div>
        <div className="px-5 py-4">
          <p
            className="font-serif-heading text-xl md:text-2xl font-semibold leading-snug"
            style={{ color: v.fg }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
