export default function FigureCard({
  src,
  alt,
  caption,
  label,
  claim,
  benchmark,
}: {
  src: string
  alt: string
  caption: string
  label?: string
  /** Bold, one-line interpretation shown above the chart — the argument the figure is making, not a description of its axes. */
  claim?: string
  /** Short badge (e.g. "vs. MLS") flagging that this figure includes the cross-league comparison. */
  benchmark?: string
}) {
  return (
    <figure className="bg-[var(--color-paper)] border border-[var(--color-line)] shadow-offset-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset">
      {(label || claim || benchmark) && (
        <div className="p-4 pb-0 flex items-start justify-between gap-3">
          <div>
            {label && <p className="font-mono-label text-[11px] text-[var(--color-accent)] mb-1">{label}</p>}
            {claim && (
              <p className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] leading-snug">
                {claim}
              </p>
            )}
          </div>
          {benchmark && (
            <span className="shrink-0 font-mono-label text-[10px] border border-[var(--color-accent)] text-[var(--color-primary)] px-2 py-1">
              {benchmark}
            </span>
          )}
        </div>
      )}
      <div className="mt-4 border-y border-[var(--color-line)] bg-white">
        <img src={src} alt={alt} className="w-full h-auto block" />
      </div>
      <figcaption className="p-4">
        <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">{caption}</p>
      </figcaption>
    </figure>
  )
}
