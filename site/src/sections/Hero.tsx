import IsochroneMotif from '../components/IsochroneMotif'
import StatTile from '../components/StatTile'
import Tag from '../components/Tag'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative z-0 min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-[var(--color-paper-alt)]"
    >
      <IsochroneMotif className="absolute inset-0 w-full h-full pointer-events-none -z-10" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <div className="bg-[var(--color-paper)]/70 backdrop-blur-[1px] border border-[var(--color-line)] shadow-offset p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col justify-center">
            <p className="font-mono-label text-xs text-[var(--color-accent)] mb-4">
              Research project · transit accessibility &amp; attendance
            </p>
            <h1 className="font-serif-heading text-4xl md:text-5xl font-semibold leading-tight text-[var(--color-primary-deep)]">
              Gotham FC's Move to Queens: Does transit accessibility translate to attendance?
            </h1>
            <p className="font-mono-label text-xs text-[var(--color-primary)] mt-4">
              By Isabel Prado-Tucker
            </p>
            <p className="mt-5 text-base text-[var(--color-ink)]/80 leading-relaxed max-w-md">
              Gotham FC is moving from Red Bull Arena in Harrison, NJ to Etihad Park in Queens, NY in 2027. 
              The new stadium has a 60-minute reach of 3.2 million people. 
              Check out how it'll impact attendance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#results"
                className="font-mono-label text-xs bg-[var(--color-primary)] text-white border border-[var(--color-primary-deep)] px-5 py-3 shadow-offset-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset"
              >
                See the results
              </a>
              <a
                href="#question"
                className="font-mono-label text-xs border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-3 transition-colors duration-150 hover:bg-[var(--color-primary)] hover:text-white"
              >
                Read the story
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <StatTile value="3.20M" label="Reachable within 60 min, Etihad Park" />
              <StatTile value="3.0×" label="vs. Red Bull Arena's 1.05M" />
              <StatTile value="71%" label="of Manhattan reachable in 60 min" />
              <StatTile value="89–100%" label="projected 2027 capacity-fill" variant="estimate" />
            </div>
            <div className="border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-5 shadow-offset-accent">
              <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-3">
                Methods used
              </p>
              <div className="flex flex-wrap gap-2">
                <Tag>Transit isochrones (r5py)</Tag>
                <Tag>OLS regression</Tag>
                <Tag>Gradient-boosted trees + SHAP</Tag>
                <Tag>Synthetic control</Tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
