'use client';

import { useState, useEffect } from 'react';
import MapComponent from '@/components/MapComponent';
import ControlPanel from '@/components/ControlPanel';
import BottomPanel from '@/components/BottomPanel';
import { useWebSocket } from '@/hooks/useWebSocket';

interface RobotLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export default function Home() {
  const [robotLocation, setRobotLocation] = useState<RobotLocation | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<RobotLocation | null>(null);
  
  // WebSocket connection
  const { isConnected, sendMessage, lastMessage, error, connectedRobots } = useWebSocket('ws://localhost:8000');

  // Handle robot location updates from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'robot_location' && lastMessage.data) {
      setRobotLocation({
        lat: lastMessage.data.lat,
        lng: lastMessage.data.lng,
        timestamp: Date.now()
      });
    }
  }, [lastMessage]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  const handleButtonPress = (button: string) => {
    if (isConnected) {
      sendMessage({
        type: 'command',
        command: button,
        timestamp: new Date().toISOString()
      });
      console.log(`Sent command: ${button}`);
    }
  };

  const handleVoiceCommand = () => {
    if (isConnected) {
      sendMessage({
        type: 'voice_command',
        timestamp: new Date().toISOString()
      });
      console.log('Voice command sent');
    }
  };

  const handleSendLocation = () => {
    if (isConnected && currentUserLocation) {
      sendMessage({
        type: 'send_location',
        location: currentUserLocation,
        timestamp: new Date().toISOString()
      });
      console.log('Location sent to robot:', currentUserLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Responsive Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Robot Controller
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-0.5">Real-time control interface</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-lg animate-pulse`}></div>
              <div className="text-right">
                <p className="text-sm sm:text-base font-medium text-slate-700">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
                {isConnected && (
                  <p className="text-xs sm:text-sm text-slate-500">
                    {connectedRobots.length} robot{connectedRobots.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </header>

      {/* Responsive Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Map Section - Takes full width on mobile, half on desktop */}
          <section className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800">Robot Location</h2>
            </div>
            <div className="h-72 sm:h-80 lg:h-96 xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/50">
              <MapComponent 
                robotLocation={robotLocation}
                onLocationUpdate={setRobotLocation}
              />
            </div>
          </section>

          {/* Control Panel and Bottom Panel - Stacked on mobile, side by side on larger screens */}
          <section className="lg:col-span-1 space-y-6">
            {/* Control Panel */}
            <ControlPanel 
              onButtonPress={handleButtonPress}
              isConnected={isConnected}
            />

            {/* Bottom Panel */}
            <BottomPanel 
              onVoiceCommand={handleVoiceCommand}
              onSendLocation={handleSendLocation}
              isConnected={isConnected}
            />
          </section>
        </div>

        {/* Status Information - Full width below main content */}
        <section className="mt-6 lg:mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800">System Status</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Connection:</span>
                  <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Robots:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                    {connectedRobots.length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {currentUserLocation && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Your Lat:</span>
                      <span className="text-xs sm:text-sm text-slate-800 font-mono">
                        {currentUserLocation.lat.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Your Lng:</span>
                      <span className="text-xs sm:text-sm text-slate-800 font-mono">
                        {currentUserLocation.lng.toFixed(4)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3">
                {robotLocation && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Robot Lat:</span>
                      <span className="text-xs sm:text-sm text-slate-800 font-mono">
                        {robotLocation.lat.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Robot Lng:</span>
                      <span className="text-xs sm:text-sm text-slate-800 font-mono">
                        {robotLocation.lng.toFixed(4)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Update:</span>
                  <span className="text-xs sm:text-sm text-slate-800">
                    {robotLocation ? new Date(robotLocation.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">WebSocket:</span>
                  <span className="text-xs sm:text-sm text-slate-800 font-mono">localhost:8000</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Responsive Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            Robot Controller v1.0 • WebSocket: localhost:8000
          </p>
        </div>
      </footer>
    </div>
  );
}
