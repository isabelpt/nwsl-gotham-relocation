export default function SectionHeading({
  index,
  title,
  eyebrow,
}: {
  index: string
  title: string
  eyebrow?: string
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="font-mono-label text-xs text-[var(--color-accent)] mb-2">{eyebrow}</p>
      )}
      <div className="flex items-baseline gap-4">
        <span className="font-mono-label text-sm text-[var(--color-primary)]">{index}</span>
        <h2 className="font-serif-heading text-3xl md:text-4xl font-semibold text-[var(--color-primary-deep)]">
          {title}
        </h2>
      </div>
    </div>
  )
}
