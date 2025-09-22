// components/LiveTrackingMapMapLibre.tsx
'use client';

import { useEffect, useRef } from 'react';
import maplibregl, {
  Map,
  Marker,
  GeoJSONSource,
  LngLatLike,
  StyleSpecification,
} from 'maplibre-gl';

// --- STATIC STYLE (outside component so it never changes) ---
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

type LatLng = { lat: number; lng: number; timestamp: string };

interface Props {
  robotLocation?: LatLng | null;        // push new points here
  initialCenter?: [number, number];     // [lat, lng]
  initialZoom?: number;
  heightClass?: string;                 // e.g. "h-96"
}

export default function LiveTrackingMapMapLibre({
  robotLocation,
  initialCenter = [37.7749, -122.4194],
  initialZoom = 16,
  heightClass = 'h-96',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const readyRef = useRef(false);

  // Keep the line GeoJSON in a ref; mutate + setData (no React state)
  const trackRef = useRef<GeoJSON.FeatureCollection<GeoJSON.LineString>>({
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
    ],
  });

  // ---------- INIT MAP (run once on mount) ----------
  useEffect(() => {
    if (!containerRef.current) return;
    // guard: if already initialized, do nothing
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [initialCenter[1], initialCenter[0]] as LngLatLike, // lng, lat
      zoom: initialZoom,
      cooperativeGestures: true,
      attributionControl: { compact: true, customAttribution: '© OpenStreetMap contributors' },
    });
    mapRef.current = map;

    map.once('load', () => {
      // Add empty source + styled line layer
      map.addSource('track', { type: 'geojson', data: trackRef.current });

      map.addLayer({
        id: 'track-line',
        type: 'line',
        source: 'track',
        paint: {
          'line-color': '#ef4444',
          'line-opacity': 0.95,
          'line-width': 5.5,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Create the live marker
      const el = document.createElement('div');
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.border = '3px solid #fff';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 6px 16px rgba(59,130,246,.6)';
      el.style.background = 'linear-gradient(135deg,#3b82f6,#1d4ed8)';

      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([initialCenter[1], initialCenter[0]])
        .addTo(map);

      readyRef.current = true;
    });

    return () => {
      readyRef.current = false;
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
    // INTENTIONALLY empty deps: we do not want to re-init on prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- APPLY LIVE UPDATES ----------
  useEffect(() => {
    if (!robotLocation) return;
    if (!readyRef.current) return;

    const map = mapRef.current;
    const mk = markerRef.current;
    if (!map || !mk) return;

    const src = map.getSource('track') as GeoJSONSource | undefined;
    if (!src) return; // source not ready yet (shouldn't happen after readyRef true)

    const lngLat: [number, number] = [robotLocation.lng, robotLocation.lat];

    // Move marker (no re-render)
    mk.setLngLat(lngLat);

    // Append to line only if it's a new coordinate
    const line = trackRef.current.features[0].geometry;
    const last = line.coordinates[line.coordinates.length - 1];
    if (!last || last[0] !== lngLat[0] || last[1] !== lngLat[1]) {
      line.coordinates.push(lngLat);
      src.setData(trackRef.current); // atomic update; map does NOT refresh
    }
  }, [robotLocation]);

  return (
    <div className={`relative ${heightClass} rounded-2xl overflow-hidden shadow-xl border border-slate-200`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-slate-700">Live</span>
        </div>
      </div>
      <style jsx global>{`
        .maplibregl-canvas { will-change: transform; }
      `}</style>
    </div>
  );
}
