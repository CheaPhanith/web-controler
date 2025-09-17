'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  robotId?: string;
  timestamp?: string;
  robots?: string[];
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  error: string | null;
  connectedRobots: string[];
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedRobots, setConnectedRobots] = useState<string[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      ws.current = new WebSocket('ws://localhost:8000');
      
      ws.current.onopen = () => {
        console.log('WebSocket connected to ws://localhost:8000');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'connected_robots':
              if (message.robots) {
                setConnectedRobots(message.robots);
              }
              break;
            case 'robot_connected':
              setConnectedRobots(prev => [...prev, message.robotId || '']);
              break;
            case 'robot_disconnected':
              setConnectedRobots(prev => prev.filter(id => id !== message.robotId));
              break;
            case 'robot_location':
              // Handle robot location updates
              break;
            case 'robot_status':
              // Handle robot status updates
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Failed to reconnect to WebSocket server');
        }
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket message:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, cannot send message:', message);
    }
  }, []);

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
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    error,
    connectedRobots
  };
}
