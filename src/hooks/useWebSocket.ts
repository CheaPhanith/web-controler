import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  message?: string;
  clientId?: string;
  isWebClient?: boolean;
  robotConnected?: boolean;
  robots?: string[];
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedRobots, setConnectedRobots] = useState<string[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isRobotConnected, setIsRobotConnected] = useState(false);
  const [robotLocation, setRobotLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: string;
  } | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get the current host IP dynamically
  const getWebSocketURL = () => {
    // Check if we're in a deployment environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // For deployment platforms, use the current domain
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `${protocol}//${hostname}/web`;
      }
      
      // For local development, try to use the current hostname or fallback to localhost
      return `ws://${hostname}:8000/web`;
    }
    
    // Server-side fallback
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/web';
  };

  const connect = () => {
    try {
      const wsUrl = getWebSocketURL();
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          console.log('📨 WebSocket message received:', message);

          switch (message.type) {
            case 'welcome':
              console.log('🎉 Welcome message:', message.message);
              if (message.robotConnected) {
                setIsRobotConnected(true);
              }
              break;
            case 'robot_connected':
              console.log('🤖 Robot connected:', message.robotId);
              setIsRobotConnected(true);
              setConnectedRobots(prev => [...prev, message.robotId]);
              break;
            case 'robot_disconnected':
              console.log('🤖 Robot disconnected:', message.robotId);
              setIsRobotConnected(false);
              setConnectedRobots(prev => prev.filter(id => id !== message.robotId));
              break;
            case 'robot_location':
              console.log('📍 Robot location update:', message.data);
              setRobotLocation(message.data);
              break;
            case 'robot_status':
              console.log('📊 Robot status update:', message.data);
              // Handle robot status updates
              break;
            case 'error':
              console.error('❌ WebSocket error message:', message);
              break;
            default:
              console.warn('⚠️ Unknown WebSocket message type:', message.type, message);
              break;
          }
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setIsRobotConnected(false);
        setConnectedRobots([]);
        setRobotLocation(null);
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('📤 Sending WebSocket message:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', message);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectedRobots,
    lastMessage,
    sendMessage,
    isRobotConnected,
    robotLocation
  };
}
