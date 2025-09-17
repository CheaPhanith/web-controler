'use client';

import { useState } from 'react';

interface ControlPanelProps {
  onButtonPress: (button: string) => void;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

export default function ControlPanel({ onButtonPress, isConnected, sendMessage }: ControlPanelProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleButtonClick = (button: string) => {
    setPressedButton(button);
    onButtonPress(button);
    
    // Send WebSocket message to robot
    if (isConnected) {
      const message = {
        type: 'command',
        command: button,
        timestamp: new Date().toISOString(),
        source: 'web_interface'
      };
      sendMessage(message);
      console.log(`Sent command ${button} to robot via WebSocket`);
    }
    
    // Reset pressed state after animation
    setTimeout(() => {
      setPressedButton(null);
    }, 200);
  };

  const buttons = [
    { 
      id: 'A', 
      label: 'A', 
      color: 'from-blue-500 via-blue-600 to-blue-700', 
      shadow: 'shadow-blue-500/30', 
      hoverShadow: 'hover:shadow-blue-500/50',
      glow: 'hover:shadow-blue-400/60'
    },
    { 
      id: 'B', 
      label: 'B', 
      color: 'from-emerald-500 via-emerald-600 to-emerald-700', 
      shadow: 'shadow-emerald-500/30', 
      hoverShadow: 'hover:shadow-emerald-500/50',
      glow: 'hover:shadow-emerald-400/60'
    },
    { 
      id: 'C', 
      label: 'C', 
      color: 'from-purple-500 via-purple-600 to-purple-700', 
      shadow: 'shadow-purple-500/30', 
      hoverShadow: 'hover:shadow-purple-500/50',
      glow: 'hover:shadow-purple-400/60'
    },
    { 
      id: 'D', 
      label: 'D', 
      color: 'from-orange-500 via-orange-600 to-orange-700', 
      shadow: 'shadow-orange-500/30', 
      hoverShadow: 'hover:shadow-orange-500/50',
      glow: 'hover:shadow-orange-400/60'
    },
    { 
      id: 'E', 
      label: 'E', 
      color: 'from-pink-500 via-pink-600 to-pink-700', 
      shadow: 'shadow-pink-500/30', 
      hoverShadow: 'hover:shadow-pink-500/50',
      glow: 'hover:shadow-pink-400/60'
    },
    { 
      id: 'F', 
      label: 'F', 
      color: 'from-indigo-500 via-indigo-600 to-indigo-700', 
      shadow: 'shadow-indigo-500/30', 
      hoverShadow: 'hover:shadow-indigo-500/50',
      glow: 'hover:shadow-indigo-400/60'
    },
  ];

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Control Panel</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-lg animate-pulse`}></div>
          <span className="text-sm sm:text-base font-medium text-slate-600">
            {isConnected ? 'Robot Connected' : 'Robot Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Enhanced Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button.id)}
            disabled={!isConnected}
            className={`
              group relative aspect-square rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300
              ${pressedButton === button.id 
                ? 'scale-95 shadow-inner' 
                : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              }
              ${!isConnected 
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400' 
                : `bg-gradient-to-br ${button.color} text-white ${button.shadow} ${button.hoverShadow} ${button.glow} hover:shadow-2xl`
              }
              transform-gpu overflow-hidden
            `}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="relative z-10 drop-shadow-sm font-bold">{button.label}</span>
            </div>
            
            {/* Pressed effect with enhanced ripple */}
            {pressedButton === button.id && (
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/30 animate-pulse">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/40 to-transparent"></div>
              </div>
            )}
            
            {/* Hover glow effect */}
            {isConnected && (
              <div className={`
                absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                bg-gradient-to-br from-white/15 via-transparent to-black/5
              `}></div>
            )}
            
            {/* Subtle border highlight with gradient */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            
            {/* Corner accent */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-slate-500">
          {isConnected 
            ? 'Tap buttons to send commands to the robot' 
            : 'Connect to robot to enable controls'
          }
        </p>
      </div>
    </div>
  );
}
