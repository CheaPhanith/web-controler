'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  robotId?: string;
  timestamp?: string;
  robots?: string[];
  robotConnected?: boolean;
  isWebClient?: boolean;
  message?: string;
}

interface RobotLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  error: string | null;
  connectedRobots: string[];
  isRobotConnected: boolean;
  robotLocation: RobotLocation | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedRobots, setConnectedRobots] = useState<string[]>([]);
  const [isRobotConnected, setIsRobotConnected] = useState(false);
  const [robotLocation, setRobotLocation] = useState<RobotLocation | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get WebSocket URL based on current host
  const getWebSocketUrl = useCallback(() => {
    if (typeof window === 'undefined') return 'ws://localhost:8000';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = '8000';
    
    return `${protocol}//${host}:${port}`;
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log(`WebSocket connected to ${wsUrl}`);
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
            case 'welcome':
              // Check if robot is already connected when web client connects
              if (message.robotConnected) {
                setIsRobotConnected(true);
                setConnectedRobots(['robot_001']);
              } else {
                setIsRobotConnected(false);
                setConnectedRobots([]);
              }
              break;
            case 'connected_robots':
              if (message.robots) {
                setConnectedRobots(message.robots);
                setIsRobotConnected(message.robots.length > 0);
              }
              break;
            case 'robot_connected':
              console.log('Robot connected:', message.robotId);
              setIsRobotConnected(true);
              setConnectedRobots([message.robotId || 'robot_001']);
              break;
            case 'robot_disconnected':
              console.log('Robot disconnected:', message.robotId);
              setIsRobotConnected(false);
              setConnectedRobots([]);
              setRobotLocation(null); // Clear location when robot disconnects
              break;
            case 'robot_location':
              console.log('Robot location update:', message.data);
              if (message.data) {
                setRobotLocation({
                  lat: message.data.lat,
                  lng: message.data.lng,
                  timestamp: message.data.timestamp || new Date().toISOString()
                });
              }
              break;
            case 'robot_status':
              console.log('Robot status update:', message.data);
              // Handle robot status updates
              break;
            case 'error':
              console.error('WebSocket error message:', message);
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsRobotConnected(false);
        setConnectedRobots([]);
        setRobotLocation(null);
        
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
  }, [getWebSocketUrl]);

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
    connectedRobots,
    isRobotConnected,
    robotLocation
  };
}
