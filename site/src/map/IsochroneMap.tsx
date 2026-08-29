import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import maplibregl, { Map as MapLibreMap, type ExpressionSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SITE_CONFIG, type MapView, type SiteLabel, type Threshold } from './types'
import { loadTracts } from './tractData'

// NYC-metro bounding box, biases (and roughly restricts) Nominatim geocoding results so a
// street name that also exists elsewhere in the US doesn't fly the map across the country.
const GEOCODE_VIEWBOX = '-74.35,40.90,-73.65,40.60'

export interface IsochroneMapHandle {
  /** Geocode an address via Nominatim, fly there, drop a pin, and report the tract underneath
   * it through onTractHover (same panel the hover interaction already fills in). */
  searchAddress: (query: string) => Promise<{ ok: true } | { ok: false; error: string }>
}

// CARTO Positron, the *vector* build rather than the raster one. Free and keyless, same as the
// raster tiles it replaces, but it exposes the basemap's own layers by name -- which is what
// fixes the rivers.
//
// Census TIGER tract polygons include the water out to the county line, so a populated tract on
// the Manhattan shore legally extends halfway across the Hudson. Painted over a flat raster
// basemap, that put full-strength colour across the river, the harbour and Newark Bay. Drawing
// the tract fill *underneath* the basemap's `water` layer lets the water paint back over the
// top, so the rivers read as rivers -- without touching the geometry or the travel times.
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

/** Basemap layers the tract fill must sit below, best first. The style is CARTO's and could be
 * re-cut at any time, so this falls through to "draw on top" rather than throwing if none of
 * them is present. */
const WATER_LAYER_CANDIDATES = ['waterway', 'water', 'water_shadow']

const NYC_CENTER: [number, number] = [-73.97, 40.72]
// Keeps the map from ever zooming/panning out to blank grey space beyond the metro area.
const NYC_METRO_BOUNDS: [[number, number], [number, number]] = [
  [-74.9, 40.3],
  [-73.1, 41.2],
]
const UNREACHABLE = 999 // sentinel for tracts beyond r5py's routing window (null minutes)
// Kept in step with map/tractData.ts, which derives the narrative's figures using the same two
// bounds -- the map and the copy have to be describing the same set of tracts.
const MINUTES_CAP = 150
const MODELLED_WINDOW = 90

function rbaField() {
  return ['coalesce', ['get', SITE_CONFIG.current.minutesField], UNREACHABLE] as ExpressionSpecification
}
function etihadField() {
  return ['coalesce', ['get', SITE_CONFIG.future.minutesField], UNREACHABLE] as ExpressionSpecification
}

/** Fill-color: diverging red (RBA faster) <-> purple (Etihad faster), white at a tie. */
function compareColorExpr(): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['-', etihadField(), rbaField()],
    -60,
    SITE_CONFIG.future.color,
    0,
    '#f2f0ea',
    60,
    SITE_CONFIG.current.color,
  ] as ExpressionSpecification
}

/** Fill-opacity: full for tracts reachable within the threshold from at least one stadium. */
function compareOpacityExpr(threshold: Threshold): ExpressionSpecification {
  const withinField = ['min', rbaField(), etihadField()] as ExpressionSpecification
  return ['case', ['<=', withinField, threshold], 0.75, 0.06] as ExpressionSpecification
}

/** Minutes at Etihad Park minus minutes at Sports Illustrated Stadium. Negative means the move
 * brings the game closer. Both legs are capped before subtracting so the 999 "unroutable"
 * sentinel can't manufacture a huge fake swing. */
function deltaExpr(): ExpressionSpecification {
  return [
    '-',
    ['min', etihadField(), MINUTES_CAP],
    ['min', rbaField(), MINUTES_CAP],
  ] as ExpressionSpecification
}

/** Only tracts inside the window this project actually modelled take part in the one-sided
 * views; everything else fades to context. */
function inWindowExpr(): ExpressionSpecification {
  return ['<=', ['min', rbaField(), etihadField()], MODELLED_WINDOW] as ExpressionSpecification
}

/** Gainers: purple, deepening with the number of minutes saved. */
function gainersColorExpr(): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    deltaExpr(),
    -60,
    SITE_CONFIG.future.color,
    -20,
    '#8f7ac4',
    0,
    '#efece6',
  ] as ExpressionSpecification
}

/** Losers: red, deepening with the number of minutes lost. */
function losersColorExpr(): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    deltaExpr(),
    0,
    '#efece6',
    20,
    '#ea8b8a',
    60,
    SITE_CONFIG.current.color,
  ] as ExpressionSpecification
}

function oneSidedOpacityExpr(side: 'gainers' | 'losers'): ExpressionSpecification {
  const onThisSide: ExpressionSpecification =
    side === 'gainers'
      ? (['<', deltaExpr(), 0] as ExpressionSpecification)
      : (['>', deltaExpr(), 0] as ExpressionSpecification)
  return [
    'case',
    ['all', inWindowExpr(), onThisSide],
    0.8,
    0.04,
  ] as ExpressionSpecification
}

function colorExprFor(view: MapView): ExpressionSpecification {
  if (view === 'gainers') return gainersColorExpr()
  if (view === 'losers') return losersColorExpr()
  return compareColorExpr()
}

function opacityExprFor(view: MapView, threshold: Threshold): ExpressionSpecification {
  if (view === 'gainers') return oneSidedOpacityExpr('gainers')
  if (view === 'losers') return oneSidedOpacityExpr('losers')
  return compareOpacityExpr(threshold)
}

interface Props {
  threshold: Threshold
  /** Which painting of the tract layer to show. Changes repaint the existing layer in place. */
  view?: MapView
  onTractHover: (props: Record<string, unknown> | null) => void
  /** Fired when the reader commits to a tract -- a click on the map, or a successful address
   * search. Distinct from hover: the selection persists, which is what the trip readout needs
   * and the only way any of this works on touch, where there is no hover at all. */
  onTractSelect?: (props: Record<string, unknown> | null) => void
}

// Accessibility-comparison view only -- the demographic-cluster layer from the standalone
// map app (web/) is intentionally left out here; that k-means analysis isn't part of what
// this project defends as its modeling approach (see the README).
const IsochroneMap = forwardRef<IsochroneMapHandle, Props>(function IsochroneMap(
  { threshold, view = 'compare', onTractHover, onTractSelect },
  ref,
) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const loadedRef = useRef(false)
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null)

  // The map is initialised once and never re-mounted, so any handler registered inside that
  // effect would capture the first render's props forever. Keeping the callbacks in refs that
  // are refreshed every render means the handlers always reach the current ones.
  const onHoverRef = useRef(onTractHover)
  const onSelectRef = useRef(onTractSelect)
  onHoverRef.current = onTractHover
  onSelectRef.current = onTractSelect

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: NYC_CENTER,
      zoom: 9.55,
      minZoom: 9,
      maxZoom: 14,
      maxBounds: NYC_METRO_BOUNDS,
      // Wheel-zoom off entirely, so an ordinary page-scroll that happens to pass over the map
      // scrolls the page instead of yanking the map's zoom level out. `cooperativeGestures`
      // achieves the same end but does it by popping a "use ctrl+scroll" hint on every scroll,
      // which fires constantly while this map is pinned during MapScrolly. The zoom buttons
      // and pinch-to-zoom still work either way.
      scrollZoom: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', async () => {
      // Shared with the narrative sections, which derive their headline figures from the same
      // file (see tractData.ts). Going through the memoised loader means this ~1.9MB file is
      // fetched and parsed once per page load rather than once per consumer.
      const [tracts, transitLines] = await Promise.all([
        loadTracts(),
        fetch('/data/transit_lines.geojson').then((r) => r.json()),
      ])

      map.addSource('tracts', { type: 'geojson', data: tracts })
      map.addSource('transit-lines', { type: 'geojson', data: transitLines })

      // Insert below the first water layer the style actually has, so rivers and harbour paint
      // back over the tract polygons that legally extend into them.
      const beforeWater = WATER_LAYER_CANDIDATES.find((id) => map.getLayer(id))

      map.addLayer(
        {
          id: 'tracts-fill',
          type: 'fill',
          source: 'tracts',
          paint: {
            'fill-color': colorExprFor(view),
            'fill-opacity': opacityExprFor(view, threshold),
          },
        },
        beforeWater,
      )

      map.addLayer(
        {
          id: 'tracts-outline',
          type: 'line',
          source: 'tracts',
          paint: {
            'line-color': '#ffffff',
            'line-width': 0.2,
            'line-opacity': 0.3,
          },
        },
        beforeWater,
      )

      map.addLayer({
        id: 'transit-lines-layer',
        type: 'line',
        source: 'transit-lines',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.6,
          'line-opacity': 0.9,
        },
      })

      // Stadium markers, both always visible for orientation.
      for (const key of ['current', 'future'] as SiteLabel[]) {
        const cfg = SITE_CONFIG[key]
        const el = document.createElement('div')
        el.style.width = '14px'
        el.style.height = '14px'
        el.style.borderRadius = '50%'
        el.style.background = cfg.color
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)'
        new maplibregl.Marker({ element: el })
          .setLngLat(cfg.coords)
          .setPopup(new maplibregl.Popup({ offset: 10 }).setText(cfg.label))
          .addTo(map)
      }

      map.on('mousemove', 'tracts-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (e.features && e.features.length > 0) {
          onHoverRef.current(e.features[0].properties ?? null)
        }
      })
      map.on('mouseleave', 'tracts-fill', () => {
        map.getCanvas().style.cursor = ''
        onHoverRef.current(null)
      })

      map.on('click', 'tracts-fill', (e) => {
        if (e.features && e.features.length > 0) {
          onSelectRef.current?.(e.features[0].properties ?? null)
        }
      })

      loadedRef.current = true
    })

    return () => {
      map.remove()
      mapRef.current = null
      loadedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Repaint in place when the threshold or the view changes. Setting paint properties on the
  // existing layer keeps the map instance, its tiles and its camera untouched -- re-creating
  // the layer or the map here would flash and reset the reader's position.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getLayer('tracts-fill')) return
    map.setPaintProperty('tracts-fill', 'fill-color', colorExprFor(view))
    map.setPaintProperty('tracts-fill', 'fill-opacity', opacityExprFor(view, threshold))
  }, [threshold, view])

  // The map only knows its size at construction, so a container that changes shape -- going
  // full-bleed, or being pinned -- leaves it rendering at stale dimensions until it is told.
  useEffect(() => {
    const map = mapRef.current
    const el = mapContainer.current
    if (!map || !el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => map.resize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useImperativeHandle(ref, () => ({
    async searchAddress(query: string) {
      const map = mapRef.current
      if (!map || !loadedRef.current) return { ok: false, error: "Map isn't ready yet" }

      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', query)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '1')
      url.searchParams.set('viewbox', GEOCODE_VIEWBOX)
      url.searchParams.set('bounded', '1')

      let results: { lat: string; lon: string; display_name: string }[]
      try {
        const res = await fetch(url.toString())
        results = await res.json()
      } catch {
        return { ok: false, error: "Couldn't reach the geocoder. Check your connection." }
      }
      if (results.length === 0) {
        return { ok: false, error: 'No match found in the NYC metro area.' }
      }

      const lngLat: [number, number] = [Number(results[0].lon), Number(results[0].lat)]

      if (!searchMarkerRef.current) {
        const el = document.createElement('div')
        el.style.width = '16px'
        el.style.height = '16px'
        el.style.borderRadius = '50% 50% 50% 0'
        el.style.transform = 'rotate(-45deg)'
        el.style.background = '#1e3a5f'
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)'
        searchMarkerRef.current = new maplibregl.Marker({ element: el })
      }
      searchMarkerRef.current.setLngLat(lngLat).addTo(map)

      await new Promise<void>((resolve) => {
        map.once('moveend', () => resolve())
        map.flyTo({ center: lngLat, zoom: 13 })
      })
      await new Promise<void>((resolve) => map.once('idle', () => resolve()))

      const point = map.project(lngLat)
      const features = map.queryRenderedFeatures(point, { layers: ['tracts-fill'] })
      const found = features[0]?.properties ?? null
      onHoverRef.current(found)
      // A search is a deliberate choice of place, so it pins the trip readout the same way a
      // click does rather than evaporating on the next mouse move.
      onSelectRef.current?.(found)

      return { ok: true }
    },
  }))

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
})

export default IsochroneMap
