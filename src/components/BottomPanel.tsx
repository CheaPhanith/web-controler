'use client';

import { useState } from 'react';

interface BottomPanelProps {
  onVoiceCommand: () => void;
  onSendLocation: () => void;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

export default function BottomPanel({ onVoiceCommand, onSendLocation, isConnected, sendMessage }: BottomPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);

  const handleVoiceCommand = async () => {
    if (!isConnected) return;
    
    setIsRecording(true);
    onVoiceCommand();
    
    // Send WebSocket message for voice command
    const message = {
      type: 'voice_command',
      action: 'start_recording',
      timestamp: new Date().toISOString(),
      source: 'web_interface'
    };
    sendMessage(message);
    console.log('Sent voice command to robot via WebSocket');
    
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
    }, 2000);
  };

  const handleSendLocation = async () => {
    if (!isConnected) return;
    
    setIsSendingLocation(true);
    onSendLocation();
    
    // Get current location
    const currentLocation = {
      lat: 37.7749,
      lng: -122.4194,
      timestamp: new Date().toISOString()
    };
    
    // Send WebSocket message with location
    const message = {
      type: 'location_request',
      action: 'send_current_location',
      data: currentLocation,
      timestamp: new Date().toISOString(),
      source: 'web_interface'
    };
    sendMessage(message);
    console.log('Sent location to robot via WebSocket:', currentLocation);
    
    // Simulate sending duration
    setTimeout(() => {
      setIsSendingLocation(false);
    }, 1000);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
            Actions
          </h2>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Enhanced Voice Button */}
        <button
          onClick={handleVoiceCommand}
          disabled={!isConnected || isRecording}
          className={`
            group relative flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold
            transition-all duration-300 transform-gpu overflow-hidden
            ${isRecording 
              ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 scale-95' 
              : !isConnected || isRecording
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
                : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95'
            }
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Microphone Icon */}
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          
          <span className="relative z-10 font-bold text-sm sm:text-base">
            {isRecording ? 'Recording...' : 'Voice'}
          </span>
          
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Enhanced Send Location Button */}
        <button
          onClick={handleSendLocation}
          disabled={!isConnected || isSendingLocation}
          className={`
            group relative flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold
            transition-all duration-300 transform-gpu overflow-hidden
            ${isSendingLocation 
              ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 scale-95' 
              : !isConnected || isSendingLocation
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
                : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
            }
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Location Icon */}
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isSendingLocation ? 'animate-pulse' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          
          <span className="relative z-10 font-bold text-sm sm:text-base">
            {isSendingLocation ? 'Sending...' : 'Send Location'}
          </span>
          
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
}
