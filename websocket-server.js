const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8000 });

// One-to-one connection: only one robot and one web client at a time
let connectedRobot = null;
let connectedWebClient = null;

// Fixed robot ID - no auto-generation
const ROBOT_ID = "robot_001";

console.log("WebSocket server starting on port 8000...");

wss.on("connection", function connection(ws, req) {
  ws.isAlive = true; // For heartbeat
  
  // Check if this is a web client or robot based on User-Agent
  const userAgent = req.headers['user-agent'] || '';
  const isWebClient = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
  
  if (isWebClient) {
    // This is a web client
    if (connectedWebClient) {
      console.log("Web client already connected, closing previous connection");
      connectedWebClient.close();
    }
    
    connectedWebClient = ws;
    ws.isRobot = false;
    ws.clientId = `web_client_${Date.now()}`;
    
    console.log(`Web client connected: ${ws.clientId} from ${req.socket.remoteAddress}`);
    
    // Send welcome message to web client
    ws.send(JSON.stringify({ 
      type: "welcome", 
      message: "Connected to Robot Controller", 
      clientId: ws.clientId,
      isWebClient: true,
      robotConnected: connectedRobot ? true : false
    }));
    
    // If robot is already connected, notify web client
    if (connectedRobot) {
      ws.send(JSON.stringify({
        type: "robot_connected",
        robotId: ROBOT_ID
      }));
    }
    
  } else {
    // This is a robot
    if (connectedRobot) {
      console.log("Robot already connected, closing previous connection");
      connectedRobot.close();
    }
    
    connectedRobot = ws;
    ws.isRobot = true;
    ws.robotId = ROBOT_ID; // Use fixed robot ID
    
    console.log(`Robot connected: ${ROBOT_ID} from ${req.socket.remoteAddress}`);
    ws.send(JSON.stringify({ 
      type: "welcome", 
      message: "Connected to Robot Controller", 
      robotId: ROBOT_ID
    }));
    
    // If web client is already connected, notify it about robot connection
    if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
      connectedWebClient.send(JSON.stringify({
        type: "robot_connected",
        robotId: ROBOT_ID
      }));
    }
  }

  ws.on("message", function message(data) {
    try {
      const parsedMessage = JSON.parse(data.toString());
      console.log(`Message from ${ws.isRobot ? ws.robotId : ws.clientId}:`, parsedMessage);

      if (ws.isRobot) {
        // Handle messages from robot
        switch (parsedMessage.type) {
          case "location":
            console.log(`Robot ${ws.robotId} location:`, parsedMessage.data);
            // Send location to web client
            if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
              connectedWebClient.send(JSON.stringify({ 
                type: "robot_location", 
                robotId: ws.robotId, 
                data: parsedMessage.data 
              }));
            }
            break;
          case "status":
            console.log(`Robot ${ws.robotId} status:`, parsedMessage.data);
            // Send status to web client
            if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
              connectedWebClient.send(JSON.stringify({ 
                type: "robot_status", 
                robotId: ws.robotId, 
                data: parsedMessage.data 
              }));
            }
            break;
          case "ping":
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;
          case "command_response":
            console.log(`Command response from ${ws.robotId}:`, parsedMessage.data);
            // Send response to web client
            if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
              connectedWebClient.send(JSON.stringify({ 
                type: "command_response", 
                robotId: ws.robotId, 
                data: parsedMessage.data 
              }));
            }
            break;
          default:
            console.log(`Unknown message type from robot ${ws.robotId}: ${parsedMessage.type}`);
        }
      } else {
        // Handle messages from web client
        switch (parsedMessage.type) {
          case "command":
            console.log(`Command sent from web client ${ws.clientId}:`, parsedMessage.command);
            // Forward command to robot
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "command_received",
                command: parsedMessage.command,
                timestamp: parsedMessage.timestamp,
                source: parsedMessage.source
              }));
            } else {
              // No robot connected, send error back to web client
              ws.send(JSON.stringify({
                type: "error",
                message: "No robot connected"
              }));
            }
            break;
          case "voice_command":
            console.log(`Voice command sent from web client ${ws.clientId}:`, parsedMessage.action);
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "voice_command_received",
                action: parsedMessage.action,
                timestamp: parsedMessage.timestamp,
                source: parsedMessage.source
              }));
            } else {
              ws.send(JSON.stringify({
                type: "error",
                message: "No robot connected"
              }));
            }
            break;
          case "location_request":
            console.log(`Location request sent from web client ${ws.clientId}:`, parsedMessage.data);
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "location_request_received",
                data: parsedMessage.data,
                timestamp: parsedMessage.timestamp,
                source: parsedMessage.source
              }));
            } else {
              ws.send(JSON.stringify({
                type: "error",
                message: "No robot connected"
              }));
            }
            break;
          case "ping":
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;
          default:
            console.log(`Unknown message type from web client ${ws.clientId}: ${parsedMessage.type}`);
        }
      }
    } catch (error) {
      console.error(`Failed to parse message from ${ws.isRobot ? ws.robotId : ws.clientId}:`, data.toString(), error);
    }
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("close", () => {
    if (ws.isRobot) {
      console.log(`Robot ${ws.robotId} disconnected`);
      connectedRobot = null;
      // Notify web client that robot disconnected - include robotId
      if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
        connectedWebClient.send(JSON.stringify({
          type: "robot_disconnected",
          robotId: ROBOT_ID
        }));
      }
    } else {
      console.log(`Web client ${ws.clientId} disconnected`);
      connectedWebClient = null;
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${ws.isRobot ? ws.robotId : ws.clientId}:`, error);
  });
});

// Heartbeat mechanism to detect broken connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log(`Removing inactive ${ws.isRobot ? 'robot' : 'client'}: ${ws.isRobot ? ws.robotId : ws.clientId}`);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Check every 30 seconds

wss.on("close", () => {
  clearInterval(interval);
});

console.log("Robot Controller WebSocket Server running on port 8000");
console.log("Waiting for one robot and one web client connection...");

// Export for potential use in other server-side logic
module.exports = {
  wss,
  getConnectedRobot: () => connectedRobot ? connectedRobot.robotId : null,
  getConnectedWebClient: () => connectedWebClient ? connectedWebClient.clientId : null,
  isRobotConnected: () => connectedRobot !== null,
  isWebClientConnected: () => connectedWebClient !== null,
};
