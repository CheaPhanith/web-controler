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
              console.log(`✅ Forwarding location to web client:`, parsedMessage.data);
            } else {
              console.log(`❌ No active web client to forward location to`);
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
            console.log(`Unknown message type from robot: ${parsedMessage.type}`);
            break;
        }
      } else {
        // Handle messages from web client
        switch (parsedMessage.type) {
          case "button_press":
            console.log(`Button press from web client:`, parsedMessage.data);
            // Forward to robot
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "command",
                command: parsedMessage.data.button,
                timestamp: parsedMessage.timestamp
              }));
            }
            break;
          case "voice_command":
            console.log(`Voice command from web client:`, parsedMessage.data);
            // Forward to robot
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "voice_command",
                data: parsedMessage.data,
                timestamp: parsedMessage.timestamp
              }));
            }
            break;
          case "location_request":
            console.log(`Location request from web client:`, parsedMessage.data);
            // Forward to robot
            if (connectedRobot && connectedRobot.readyState === connectedRobot.OPEN) {
              connectedRobot.send(JSON.stringify({
                type: "location_request",
                data: parsedMessage.data,
                timestamp: parsedMessage.timestamp
              }));
            }
            break;
          default:
            console.log(`Unknown message type from web client: ${parsedMessage.type}`);
            break;
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", function close() {
    console.log(`${ws.isRobot ? `Robot ${ws.robotId}` : `Web client ${ws.clientId}`} disconnected`);
    
    if (ws.isRobot) {
      connectedRobot = null;
      // Notify web client about robot disconnection
      if (connectedWebClient && connectedWebClient.readyState === connectedWebClient.OPEN) {
        connectedWebClient.send(JSON.stringify({
          type: "robot_disconnected",
          robotId: ROBOT_ID
        }));
      }
    } else {
      connectedWebClient = null;
    }
  });

  ws.on("error", function error(err) {
    console.error(`WebSocket error for ${ws.isRobot ? `Robot ${ws.robotId}` : `Web client ${ws.clientId}`}:`, err);
  });

  // Heartbeat to keep connection alive
  ws.on("pong", function pong() {
    ws.isAlive = true;
  });
});

// Heartbeat interval
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log(`Terminating inactive connection: ${ws.isRobot ? `Robot ${ws.robotId}` : `Web client ${ws.clientId}`}`);
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

console.log("WebSocket server ready on port 8000");
