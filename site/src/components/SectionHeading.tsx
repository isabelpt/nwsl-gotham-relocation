export default function SectionHeading({
  index,
  title,
  eyebrow,
}: {
  /** Optional. The numbered "01 / 02 / 03" rail was dropped from the page: it announced a lab
   * report before the reader had read a word. The narrative arc it marked is still there and
   * still in order — the eyebrow names each stage instead, quietly. */
  index?: string
  title: string
  eyebrow?: string
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="font-mono-label text-xs text-[var(--color-accent)] mb-2">{eyebrow}</p>
      )}
      <div className="flex items-baseline gap-4">
        {index && (
          <span className="font-mono-label text-sm text-[var(--color-primary)]">{index}</span>
        )}
        <h2 className="font-serif-heading text-3xl md:text-4xl font-semibold text-[var(--color-primary-deep)]">
          {title}
        </h2>
      </div>
    </div>
  )
}
