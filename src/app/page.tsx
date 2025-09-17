'use client';

import { useWebSocket } from '../hooks/useWebSocket';
import MapComponent from '../components/MapComponent';
import ControlPanel from '../components/ControlPanel';
import BottomPanel from '../components/BottomPanel';

export default function Home() {
  const { isConnected, connectedRobots, sendMessage, isRobotConnected, robotLocation } = useWebSocket();

  const handleButtonPress = (button: string) => {
    console.log(`Button ${button} pressed`);
    // Additional local handling can be added here if needed
  };

  const handleVoiceCommand = () => {
    console.log('Voice command triggered');
    // Additional local handling can be added here if needed
  };

  const handleSendLocation = () => {
    console.log('Send location triggered');
    // Additional local handling can be added here if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Robot Controller
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-0.5">
                Real-time control interface
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <section className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800">
                Robot Location
              </h2>
            </div>
            <MapComponent robotLocation={robotLocation} />
          </section>

          <section className="lg:col-span-1 space-y-6">
            <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                    Control Panel
                  </h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      isRobotConnected ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"
                    } shadow-lg animate-pulse`}
                  ></div>
                  <span className="text-sm sm:text-base font-medium text-slate-600">
                    {isRobotConnected ? "Robot Connected" : "Robot Disconnected"}
                  </span>
                </div>
              </div>
              <ControlPanel
                onButtonPress={handleButtonPress}
                sendMessage={sendMessage}
                isConnected={isRobotConnected}
              />
            </div>

            <BottomPanel
              onVoiceCommand={handleVoiceCommand}
              onSendLocation={handleSendLocation}
              sendMessage={sendMessage}
              isConnected={isRobotConnected}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
