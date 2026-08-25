/**
 * A narrative turn between figure blocks — states the question or claim that
 * the next figure answers. Styled like the section headings (small rule +
 * serif line), not a blockquote, so it doesn't read as something someone said.
 */
export default function TransitionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-14">
      <div className="w-10 h-0.5 bg-[var(--color-accent)] mb-4" />
      <h3 className="font-serif-heading text-2xl md:text-3xl font-semibold leading-snug text-[var(--color-primary-deep)]">
        {children}
      </h3>
    </div>
  )
}
