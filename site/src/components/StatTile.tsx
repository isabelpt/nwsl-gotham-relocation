export default function StatTile({
  value,
  label,
  variant = 'measured',
}: {
  value: string
  label: string
  /** 'measured' = directly computed from data (isochrones, ratios). 'estimate' = a
   * modeled/projected figure this project reports as a range, not a fact — styled
   * distinctly (dashed border, softer fill, an "est." flag) so a skimming reader
   * doesn't mistake a scenario range for a measured number. */
  variant?: 'measured' | 'estimate'
}) {
  const isEstimate = variant === 'estimate'
  return (
    <div
      className={
        isEstimate
          ? 'border border-dashed border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4 relative'
          : 'border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-4'
      }
    >
      {isEstimate && (
        <span className="font-mono-label text-[9px] text-[var(--color-primary)]/70 absolute top-1.5 right-2">
          est.
        </span>
      )}
      <p className="font-serif-heading text-2xl md:text-3xl font-semibold text-[var(--color-primary-deep)]">
        {value}
      </p>
      <p className="font-mono-label text-[11px] text-[var(--color-primary)] mt-1">{label}</p>
    </div>
  )
}
