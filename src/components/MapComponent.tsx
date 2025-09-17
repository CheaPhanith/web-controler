'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the map to avoid SSR issues
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

interface RobotLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

interface MapComponentProps {
  robotLocation?: RobotLocation;
  onLocationUpdate?: (location: RobotLocation) => void;
}

export default function MapComponent({ robotLocation, onLocationUpdate }: MapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<RobotLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to San Francisco
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [robotIcon, setRobotIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet and configure icons only on client side
    const setupLeaflet = async () => {
      const L = await import('leaflet');
      
      // Fix for default markers in react-leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/images/marker-icon-2x.png',
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
      });

      // Create custom robot icon
      const customRobotIcon = L.divIcon({
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, #3B82F6, #1E40AF);
            border: 2px solid #1E40AF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #1E40AF;
              border-radius: 50%;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -2px;
                left: -2px;
                width: 4px;
                height: 4px;
                background: #EF4444;
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.2); }
              }
            </style>
          </div>
        `,
        className: 'custom-robot-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });
      
      setRobotIcon(customRobotIcon);
    };
    
    setupLeaflet();
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: RobotLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          };
          setCurrentLocation(userLocation);
          setMapCenter([userLocation.lat, userLocation.lng]);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (robotLocation) {
      setCurrentLocation(robotLocation);
      setMapCenter([robotLocation.lat, robotLocation.lng]);
    }
  }, [robotLocation]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading map...</p>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Initializing location services</p>
        </div>
      </div>
    );
  }

  if (isLoadingLocation) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
          </div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">Getting your location...</p>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Please allow location access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={15}
        className="w-full h-full rounded-2xl"
        scrollWheelZoom={true}
        style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentLocation && robotIcon && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={robotIcon}
          >
            <Popup>
              <div className="text-center p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800">🤖 Robot Location</h3>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Latitude:</span>
                    <span className="font-mono text-slate-800">{currentLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Longitude:</span>
                    <span className="font-mono text-slate-800">{currentLocation.lng.toFixed(6)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map overlay with status */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-lg border border-slate-200/50">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-slate-700">Live</span>
        </div>
      </div>
    </div>
  );
}
