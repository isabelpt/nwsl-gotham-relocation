import SectionHeading from '../components/SectionHeading'
import Tag from '../components/Tag'

const SOURCES = [
  {
    name: 'Game and stadium data',
    detail:
      'NWSL game, team, and stadium records from the American Soccer Analysis API, carried over from my earlier attendance project. Attendance is only reliable from 2016, and 2020 and 2021 are out because of COVID. I scraped missing stadium names, locations, and capacities from Wikipedia.',
    tags: ['Games', 'Teams', 'Stadiums'],
  },
  {
    name: 'Transit feeds and street maps',
    detail:
      'GTFS schedules and OpenStreetMap walking networks for all 14 NWSL metros with more than one season played, including the four recent moves and Gotham\u2019s. These feed the r5py network behind every travel-time zone.',
    tags: ['GTFS', 'OSM', 'r5py'],
  },
  {
    name: 'Census tracts and ACS',
    detail:
      '2020 census tract shapes with ACS population, income, and race data. A tract counts as reachable if its center falls inside the travel-time zone. ACS also supplies each city\u2019s share of transit commuters.',
    tags: ['Census', 'ACS', 'Demographics'],
  },
]

// Table 1 in the paper: which unit of analysis feeds which model, and at what N.
const PANELS = [
  {
    unit: 'Team-game',
    n: '1,132 home games',
    usedBy: 'Linear stage, CatBoost residual, SHAP',
    coverage: '2016-2019, 2022-2026',
    note: '950 of these have a reach value and feed the regression. Older venues without one still go to CatBoost, which handles gaps.',
  },
  {
    unit: 'Team-season',
    n: '~90 team-seasons (14 x 9 panel)',
    usedBy: 'Synthetic control',
    coverage: '2016-2019, 2022-2026 (10-14 teams)',
    note: 'Kansas City is dropped here and from training, because it sells out nearly every game, so its attendance does not represent true demand.',
  },
  {
    unit: 'Census tract',
    n: 'thousands per metro',
    usedBy: 'Isochrone + demographic analysis',
    coverage: '2020 tract geometries, 5-year ACS',
    note: 'Reachable population is just the ACS population summed across every tract inside a stadium\u2019s travel-time zone.',
  },
]

export default function DataSection() {
  return (
    <section id="data" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="The data" title="What I could measure" />
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

        <div className="mt-10">
          <p className="font-mono-label text-xs text-[var(--color-primary)] mb-3">
            What feeds what, by model
          </p>
          <div className="border border-[var(--color-line)] bg-[var(--color-paper)] shadow-offset-sm overflow-x-auto">
            <table className="w-full border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-alt)]">
                  {['Unit', 'N', 'Used by', 'Coverage'].map((h) => (
                    <th
                      key={h}
                      className="font-mono-label text-[10px] lg:text-[11px] font-medium text-[var(--color-primary)] px-3 py-3 text-left leading-tight"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PANELS.map((row, i) => (
                  <tr
                    key={row.unit}
                    className={i !== PANELS.length - 1 ? 'border-b border-[var(--color-line)]' : ''}
                  >
                    <td className="px-3 py-3 font-serif-heading text-[13px] lg:text-sm text-[var(--color-primary-deep)] whitespace-nowrap align-top">
                      {row.unit}
                    </td>
                    <td className="px-3 py-3 text-sm font-mono whitespace-nowrap align-top">{row.n}</td>
                    <td className="px-3 py-3 text-xs text-[var(--color-ink)]/70 align-top">
                      {row.usedBy}
                      <span className="block text-[var(--color-ink)]/55 mt-1 leading-relaxed">{row.note}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--color-ink)]/70 align-top whitespace-nowrap">
                      {row.coverage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2 text-xs text-[var(--color-primary)]/70 border-t border-[var(--color-line)]">
              This project is limited by sample size due to the league's age and some unfortunate events in those years (ahem- COVID). I have 1,132 games with
              only four recent relocations and 
              nine usable seasons.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
