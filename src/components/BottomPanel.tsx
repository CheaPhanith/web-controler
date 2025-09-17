'use client';

import { useState } from 'react';

interface BottomPanelProps {
  onVoiceCommand: () => void;
  onSendLocation: () => void;
  isConnected: boolean;
}

export default function BottomPanel({ onVoiceCommand, onSendLocation, isConnected }: BottomPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);

  const handleVoiceCommand = async () => {
    if (!isConnected) return;
    
    setIsRecording(true);
    onVoiceCommand();
    
    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
    }, 2000);
  };

  const handleSendLocation = async () => {
    if (!isConnected) return;
    
    setIsSendingLocation(true);
    onSendLocation();
    
    // Simulate sending duration
    setTimeout(() => {
      setIsSendingLocation(false);
    }, 1000);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
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
              : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:shadow-xl'
            }
            ${!isConnected || isRecording 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 active:scale-95'
            }
          `}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Icon with enhanced animation */}
          <div className={`
            relative w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 z-10
            ${isRecording ? 'animate-pulse' : 'group-hover:scale-110 group-hover:rotate-3'}
          `}>
            <svg 
              fill="currentColor" 
              viewBox="0 0 24 24"
              className="w-full h-full drop-shadow-sm"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            
            {/* Recording pulse effect */}
            {isRecording && (
              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            )}
          </div>
          
          {/* Button text */}
          <span className="text-sm sm:text-base font-medium relative z-10 drop-shadow-sm">
            {isRecording ? 'Recording...' : 'Voice'}
          </span>
          
          {/* Recording wave effect */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-5 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          
          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Corner accent */}
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
              : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:shadow-xl'
            }
            ${!isConnected || isSendingLocation 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 active:scale-95'
            }
          `}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Icon with enhanced animation */}
          <div className={`
            relative w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 z-10
            ${isSendingLocation ? 'animate-spin' : 'group-hover:scale-110 group-hover:-rotate-3'}
          `}>
            <svg 
              fill="currentColor" 
              viewBox="0 0 24 24"
              className="w-full h-full drop-shadow-sm"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            
            {/* Sending pulse effect */}
            {isSendingLocation && (
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            )}
          </div>
          
          {/* Button text */}
          <span className="text-sm sm:text-base font-medium relative z-10 drop-shadow-sm">
            {isSendingLocation ? 'Sending...' : 'Send Location'}
          </span>
          
          {/* Sending progress effect */}
          {isSendingLocation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          
          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Corner accent */}
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
      
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-slate-500">
          {isConnected 
            ? 'Use voice commands or send your current location to the robot' 
            : 'Connect to robot to use these features'
          }
        </p>
      </div>
    </div>
  );
}
