/**
 * A big before/after number — for the one moment in the story where a metric
 * flips dramatically (naive fit -> honest held-out-team fit). Meant to be felt
 * before it's read, the way the hero's stat tiles work, not just tabulated.
 */
export default function StatFlip({
  label,
  from,
  to,
  fromLabel,
  toLabel,
}: {
  label: string
  from: string
  to: string
  fromLabel: string
  toLabel: string
}) {
  return (
    <div className="border border-[var(--color-primary-deep)] bg-[var(--color-primary-deep)] text-white p-6 shadow-offset-accent">
      <p className="font-mono-label text-[11px] text-[var(--color-accent)] mb-4">{label}</p>
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <p className="font-mono text-3xl md:text-4xl font-medium text-white/50 line-through decoration-2 decoration-white/30">
            {from}
          </p>
          <p className="font-mono-label text-[10px] text-white/50 mt-1">{fromLabel}</p>
        </div>
        <span className="font-serif-heading text-3xl text-[var(--color-accent)] -mt-4">→</span>
        <div>
          <p className="font-mono text-3xl md:text-4xl font-semibold text-white">{to}</p>
          <p className="font-mono-label text-[10px] text-[var(--color-accent)] mt-1">{toLabel}</p>
        </div>
      </div>
    </div>
  )
}
