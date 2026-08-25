import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import maplibregl, { Map as MapLibreMap, type ExpressionSpecification, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { SITE_CONFIG, type SiteLabel, type Threshold } from './types'

// NYC-metro bounding box, biases (and roughly restricts) Nominatim geocoding results so a
// street name that also exists elsewhere in the US doesn't fly the map across the country.
const GEOCODE_VIEWBOX = '-74.35,40.90,-73.65,40.60'

export interface IsochroneMapHandle {
  /** Geocode an address via Nominatim, fly there, drop a pin, and report the tract underneath
   * it through onTractHover (same panel the hover interaction already fills in). */
  searchAddress: (query: string) => Promise<{ ok: true } | { ok: false; error: string }>
}

// CARTO Positron, labeled version -- street/place names visible for orientation. Free, no API
// key. Raster tiles, so this is a plain MapLibre raster style rather than a vector style.
const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: ['a', 'b', 'c', 'd'].map((s) => `https://${s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`),
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'carto-light-layer', type: 'raster', source: 'carto-light' }],
}

const NYC_CENTER: [number, number] = [-73.97, 40.72]
const UNREACHABLE = 999 // sentinel for tracts beyond r5py's routing window (null minutes)

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

interface Props {
  threshold: Threshold
  onTractHover: (props: Record<string, unknown> | null) => void
}

// Accessibility-comparison view only -- the demographic-cluster layer from the standalone
// map app (web/) is intentionally left out here; that k-means analysis isn't part of what
// this project defends as its modeling approach (see the README).
const IsochroneMap = forwardRef<IsochroneMapHandle, Props>(function IsochroneMap(
  { threshold, onTractHover },
  ref,
) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const loadedRef = useRef(false)
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: NYC_CENTER,
      zoom: 9.3,
      minZoom: 8,
      maxZoom: 14,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', async () => {
      const [tracts, transitLines] = await Promise.all([
        fetch('/data/tracts.geojson').then((r) => r.json()),
        fetch('/data/transit_lines.geojson').then((r) => r.json()),
      ])

      map.addSource('tracts', { type: 'geojson', data: tracts })
      map.addSource('transit-lines', { type: 'geojson', data: transitLines })

      map.addLayer({
        id: 'tracts-fill',
        type: 'fill',
        source: 'tracts',
        paint: {
          'fill-color': compareColorExpr(),
          'fill-opacity': compareOpacityExpr(threshold),
        },
      })

      map.addLayer({
        id: 'tracts-outline',
        type: 'line',
        source: 'tracts',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.2,
          'line-opacity': 0.3,
        },
      })

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
          onTractHover(e.features[0].properties ?? null)
        }
      })
      map.on('mouseleave', 'tracts-fill', () => {
        map.getCanvas().style.cursor = ''
        onTractHover(null)
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

  // Update fill opacity when the threshold changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getLayer('tracts-fill')) return
    map.setPaintProperty('tracts-fill', 'fill-opacity', compareOpacityExpr(threshold))
  }, [threshold])

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
        return { ok: false, error: "Couldn't reach the geocoder — check your connection." }
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
      onTractHover(features[0]?.properties ?? null)

      return { ok: true }
    },
  }))

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
})

export default IsochroneMap
