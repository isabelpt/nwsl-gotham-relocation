import SectionHeading from '../components/SectionHeading'
import Tag from '../components/Tag'

const SOURCES = [
  {
    name: 'nwsl-project (prior work)',
    detail:
      "Cleaned NWSL/MLS game, team, and stadium data (American Soccer Analysis API via itscalledsoccer wrapper) and the existing attendance regression predicting log(attendance) from points-per-game, market size, a new-stadium flag, a rivalry flag, and distance from downtown.",
    tags: ['Games', 'Teams', 'Stadiums'],
  },
  {
    name: 'GTFS transit feeds + OSM extracts',
    detail:
      'GTFS/OSM pulled for all 14 NWSL teams with 1+ completed season. Feeds an r5py transit network for every isochrone in this project. Build new network for each stadium relocation.',
    tags: ['GTFS', 'OSM', 'r5py'],
  },
  {
    name: 'Census tract shapefiles + ACS',
    detail:
      'Census tract geometries with ACS population and demographic (income, race/ethnicity) pulls, joined to isochrone travel times to build reachable-population and demographic-shift numbers at the tract level.',
    tags: ['Census', 'ACS', 'Demographics'],
  },
  
]

export default function DataSection() {
  return (
    <section id="data" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="02" title="The Data" eyebrow="Sources" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SOURCES.map((s) => (
            <div
              key={s.name}
              className="border border-[var(--color-line)] bg-[var(--color-paper)] p-4 shadow-offset-sm transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset"
            >
              <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-primary-deep)] mb-1">
                {s.name}
              </h3>
              <p className="text-sm text-[var(--color-ink)]/75 leading-relaxed mb-3">{s.detail}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
