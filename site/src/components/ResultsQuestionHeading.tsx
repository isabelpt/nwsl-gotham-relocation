/**
 * Marks one of the three questions the Results section is structured around:
 * the struggle to build a model -> does accessibility improve reach -> will
 * attendance increase. Every figure in the section should be answering one
 * of these, so each gets its own visible "chapter" marker, not just another
 * Figure-N label at the same visual weight as everything else.
 */
export default function ResultsQuestionHeading({
  index,
  question,
  sub,
}: {
  index: string
  question: string
  sub?: string
}) {
  return (
    <div className="mt-20 mb-10 first:mt-0">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono-label text-xs text-white bg-[var(--color-primary-deep)] px-2.5 py-1">
          {index}
        </span>
        <h3 className="font-serif-heading text-2xl md:text-3xl font-semibold text-[var(--color-primary-deep)]">
          {question}
        </h3>
      </div>
      {sub && <p className="text-sm text-[var(--color-ink)]/60 leading-relaxed">{sub}</p>}
      <div className="w-full h-px bg-[var(--color-line)] mt-5" />
    </div>
  )
}
