import type { ReactNode } from 'react'
import { CHART_SOURCE } from '../../data/chartData'

/** Shared furniture for every chart on the page: a headline that states the finding, a deck that
 * carries the qualification, the plot itself, then the method note and the source.
 *
 * The text is HTML rather than drawn into the SVG, so it wraps at any width, stays selectable and
 * searchable, and picks up the site's own Source Serif and Inter instead of whichever fonts a
 * plotting library happened to have. */
export default function ChartFrame({
  label,
  title,
  deck,
  note,
  children,
}: {
  /** Figure/table number, e.g. "Figure 4". */
  label?: string
  title: string
  deck?: ReactNode
  note?: ReactNode
  children: ReactNode
}) {
  return (
    <figure className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm p-5">
      {label && (
        <p className="font-mono-label text-[10px] text-[var(--color-primary)] mb-2">{label}</p>
      )}
      <h4 className="font-serif-heading text-xl md:text-2xl font-semibold text-[var(--color-primary-deep)] leading-snug">
        {title}
      </h4>
      {deck && (
        <p className="text-[15px] text-[var(--color-ink)]/75 leading-relaxed mt-1.5 max-w-2xl">
          {deck}
        </p>
      )}

      <div className="mt-5">{children}</div>

      <figcaption className="mt-4 pt-3 border-t border-[var(--color-line)]">
        {note && (
          <p className="text-xs text-[var(--color-ink)]/70 leading-relaxed">{note}</p>
        )}
        <p className="text-[11px] text-[var(--color-ink)]/60 leading-relaxed mt-1">
          Source: {CHART_SOURCE}. Chart by Isabel Prado-Tucker.
        </p>
      </figcaption>
    </figure>
  )
}
