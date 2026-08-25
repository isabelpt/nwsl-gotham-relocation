import SectionHeading from '../components/SectionHeading'
import Tag from '../components/Tag'

export default function QuestionSection() {
  return (
    <section id="question" className="border-t border-[var(--color-line)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading index="01" title="The Question" eyebrow="Motivation" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4 text-[var(--color-ink)]/85 leading-relaxed">
            <p>
              Gotham FC currently plays at Red Bull Arena in Harrison, NJ and has the 2nd lowest
              attendance in the NWSL. In 2027, the team will relocate to Etihad Park,
              a new stadium they'll share with NYCFC at Willets Point, Queens.
              The stadium will be directly accesible by the 7 train, 
              in contrast to the PATH ride to Red Bull Arena.
              How much does this move actually change who can get to a game, and does that accessibility gain move
              attendance?
            </p>
            <p>
              We try to predict this attendence lift in three ways. First, we extend <a href="https://nwsl-growth-analysis-e4td.vercel.app/"><strong>nwsl-project</strong></a>'s team-season attendance regression
              (points-per-game, market size, a new-stadium flag, a rivalry flag) by adding a
              transit-accessibility feature computed from real GTFS + OSM isochrones. 
              Second, we conduct a synthetic control analysis of four other NWSL teams' own stadium relocations 
              to estimate what Gotham's attendance would have looked like if they had stayed at Red Bull Arena vs when they move to Etihad Park.
              Third, we build a more robust CatBoost model to predict attendance, 
              and test whether the transit-accessibility feature holds up once we honestly check if the model generalizes to a team it hasn't seen.
            </p>
          </div>
          <div className="border border-[var(--color-line)] bg-[var(--color-paper-alt)] p-5 shadow-offset-accent">
            <p className="font-mono-label text-[11px] text-[var(--color-primary)] mb-3">
              Comparative frame
            </p>
            <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed mb-4">
              Four other current NWSL teams relocated recently (KC, San Diego, Seattle,
              Washington). This is too small a sample for a robust model, but rather a precedent for what 
              stadium moves do to a team's own attendance, 
              and a donor pool for a synthetic-control estimate of what staying at
              Red Bull Arena would look like in comparison to the move to Queens.
            </p>
            <div className="flex flex-wrap gap-2">
              <Tag>KC Current</Tag>
              <Tag>San Diego Wave</Tag>
              <Tag>Seattle Reign</Tag>
              <Tag>Washington Spirit</Tag>
            </div>
            <p className="font-mono-label text-[10px] text-[var(--color-primary)]/60 mt-3">
              → this donor pool becomes the scenario range in Results (04)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
