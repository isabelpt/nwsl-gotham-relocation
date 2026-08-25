export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="font-mono-label text-[11px] text-[var(--color-ink)]/60">
          Full data sources &amp; methodology notes in the repo
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com/isabelpt/nwsl_geospatial"
            className="text-sm underline decoration-2 decoration-[var(--color-accent)] underline-offset-4"
          >
            GitHub repo
          </a>
          <a
            href="https://github.com/isabelpt/nwsl-project"
            className="text-sm underline decoration-2 decoration-[var(--color-accent)] underline-offset-4"
          >
            Baseline attendance project
          </a>
        </div>
      </div>
    </footer>
  )
}
