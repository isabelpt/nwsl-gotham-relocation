import IsochroneMotif from '../components/IsochroneMotif'

/** Title card. Deliberately holds back the findings: the reader should arrive at the question
 * and the trade at its centre, not at a grid of results. The measured stats that used to live
 * here now land in section 01, where the map has earned them. */
export default function Hero() {
  return (
    <section
      id="top"
      className="relative z-0 min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-[var(--color-paper-alt)]"
    >
      <IsochroneMotif className="absolute inset-0 w-full h-full pointer-events-none -z-10" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full py-16">
        <div className="bg-[var(--color-paper)]/75 backdrop-blur-[1px] border border-[var(--color-line)] shadow-offset p-8 md:p-14 max-w-3xl">
          <p className="font-mono-label text-xs text-[var(--color-accent)] mb-5">
            New York &middot; Transit and attendance
          </p>

          <h1 className="font-serif-heading text-4xl md:text-6xl font-semibold leading-[1.05] text-[var(--color-primary-deep)]">
            Gotham FC's Move to Queens
          </h1>

          <p className="font-serif-heading text-xl md:text-2xl text-[var(--color-primary)] mt-4 leading-snug">
            Does transit accessibility translate to attendance?
          </p>

          <div className="w-10 h-0.5 bg-[var(--color-accent)] my-7" />

          <p className="text-base md:text-lg text-[var(--color-ink)]/80 leading-relaxed max-w-xl">
            In 2028 Gotham FC leaves Harrison, New Jersey for Willets Point, Queens. Three million
            people will be able to reach a home game within an hour. Two million others will find it
            harder to get there than they do today.
          </p>

          <p className="font-mono-label text-xs text-[var(--color-primary)] mt-8">
            By Isabel Prado-Tucker
          </p>

          <a
            href="#question"
            className="inline-block font-mono-label text-xs bg-[var(--color-primary)] text-white border border-[var(--color-primary-deep)] px-5 py-3 mt-8 shadow-offset-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset"
          >
            ↓ Scroll to begin
          </a>
        </div>
      </div>
    </section>
  )
}
