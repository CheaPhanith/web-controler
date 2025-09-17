'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface MapComponentProps {
  robotLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

// Custom marker component that updates position without re-rendering
function RobotMarker({ position, timestamp }: { position: [number, number]; timestamp: string }) {
  const markerRef = useRef<any>(null);
  const popupRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current && position) {
      // Smoothly animate marker to new position
      markerRef.current.setLatLng(position);
      
      // Update popup content with new timestamp
      if (popupRef.current) {
        popupRef.current.setContent(`
          <div class="text-center p-2">
            <div class="font-semibold text-slate-800 mb-1">Robot Location</div>
            <div class="text-sm text-slate-600">
              <div>Lat: ${position[0].toFixed(6)}</div>
              <div>Lng: ${position[1].toFixed(6)}</div>
              <div class="text-xs text-slate-500 mt-1">
                Last updated: ${new Date(timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        `);
      }
    }
  }, [position, timestamp]);

  return (
    <Marker 
      ref={markerRef}
      position={position} 
      icon={(window as any).robotIcon}
    >
      <Popup ref={popupRef}>
        <div className="text-center p-2">
          <div className="font-semibold text-slate-800 mb-1">Robot Location</div>
          <div className="text-sm text-slate-600">
            <div>Lat: {position[0].toFixed(6)}</div>
            <div>Lng: {position[1].toFixed(6)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Last updated: {new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapComponent({ robotLocation }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([37.7749, -122.4194]);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update location when robotLocation prop changes
  useEffect(() => {
    if (robotLocation) {
      setCurrentLocation([robotLocation.lat, robotLocation.lng]);
      setLastUpdate(robotLocation.timestamp);
      
      // Optionally pan map to follow robot (uncomment if desired)
      // if (mapRef.current) {
      //   mapRef.current.setView([robotLocation.lat, robotLocation.lng], mapRef.current.getZoom());
      // }
    }
  }, [robotLocation]);

  useEffect(() => {
    if (isClient) {
      // Import Leaflet only on client side
      import('leaflet').then((L) => {
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/images/marker-icon-2x.png',
          iconUrl: '/images/marker-icon.png',
          shadowUrl: '/images/marker-shadow.png',
        });

        // Create custom robot icon with smooth animation
        const robotIcon = L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              transition: all 0.3s ease;
              animation: pulse 2s infinite;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 2px;
                transform: rotate(45deg);
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.8); }
                100% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
              }
            </style>
          `,
          className: 'custom-robot-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Store the icon globally for use in markers
        (window as any).robotIcon = robotIcon;
        
        setMapLoaded(true);
      });
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="h-72 sm:h-80 lg:h-96 xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base">Loading map...</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Initializing location services</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="h-72 sm:h-80 lg:h-96 xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base">Loading map...</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Initializing location services</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-72 sm:h-80 lg:h-96 xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
      <MapContainer
        ref={mapRef}
        center={currentLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Robot marker with smooth real-time position updates */}
        <RobotMarker position={currentLocation} timestamp={lastUpdate} />
      </MapContainer>
      
      {/* Real-time status indicator */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-lg border border-slate-200/50">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-slate-700">Live</span>
        </div>
      </div>
    </div>
  );
}
