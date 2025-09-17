'use client';

interface ControlPanelProps {
  onButtonPress: (button: string) => void;
  sendMessage: (message: any) => void;
  isConnected: boolean;
}

export default function ControlPanel({ onButtonPress, sendMessage, isConnected }: ControlPanelProps) {
  const buttons = [
    { id: 'A', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
    { id: 'B', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
    { id: 'C', color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/25' },
    { id: 'D', color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/25' },
    { id: 'E', color: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/25' },
    { id: 'F', color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/25' },
  ];

  const handleButtonClick = (buttonId: string) => {
    if (!isConnected) return;
    
    onButtonPress(buttonId);
    
    // Send WebSocket message
    const message = {
      type: 'command',
      command: buttonId,
      timestamp: new Date().toISOString(),
      source: 'web_interface'
    };
    sendMessage(message);
    console.log(`Sent command ${buttonId} to robot via WebSocket`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => handleButtonClick(button.id)}
          disabled={!isConnected}
          className={`
            group relative aspect-square rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300
            hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
            ${!isConnected 
              ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
              : `bg-gradient-to-br ${button.color} text-white hover:shadow-${button.color.split('-')[1]}-500/40`
            }
            transform-gpu overflow-hidden
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative z-10 drop-shadow-sm font-bold">{button.id}</span>
          </div>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      ))}
    </div>
  );
}
