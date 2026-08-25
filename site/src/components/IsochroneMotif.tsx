// Decorative motif for the hero: expanding isochrone rings radiating out from a stadium point,
// echoing the 30/45/60/90-min bands on the interactive map in the Results section. Replaces the
// earlier soccer-pitch motif — this project's headline finding is a reach comparison, so the
// background should look like one.
//
// Rendered largest-first (outermost band on the bottom of the stack, innermost/darkest on top)
// as solid filled circles, not outlines, so each band reads as a filled color. Colors are
// pre-mixed with the page's own paper-alt cream rather than left saturated + made
// CSS-`opacity`-transparent, so overlapping bands don't muddy into an odd blended color where
// they meet, and the whole thing reads as faded/tinted rather than a bright decal. Each circle
// shares one center origin and uses aspect-ratio:1 so it stays circular (not squashed into an
// ellipse) at any container aspect ratio.
const RINGS = [
  { size: '150vmax', color: '#dbd1ec' }, // ~90 min, lightest/outermost
  { size: '105vmax', color: '#c7b9e4' }, // ~60 min
  { size: '68vmax', color: '#b0a0ca' }, // ~45 min
  { size: '38vmax', color: '#9685b1' }, // ~30 min
  { size: '16vmax', color: '#877a96' }, // stadium catchment, darkest/innermost
]

export default function IsochroneMotif({ className = '' }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {RINGS.map((ring) => (
        <div
          key={ring.size}
          className="pitch-circle"
          style={{
            position: 'absolute',
            top: '50%',
            left: '75%',
            width: ring.size,
            aspectRatio: '1 / 1',
            transform: 'translate(-50%, -50%)',
            background: ring.color,
          }}
        />
      ))}
    </div>
  )
}
