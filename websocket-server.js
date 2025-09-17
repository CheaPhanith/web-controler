const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8000 });

const connectedRobots = new Map(); // Stores connected robots with their IDs and WebSocket instances
let robotCounter = 0;

console.log("WebSocket server starting on port 8000...");

wss.on("connection", function connection(ws, req) {
  const robotId = `robot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  connectedRobots.set(robotId, ws);
  ws.isAlive = true; // For heartbeat
  ws.robotId = robotId; // Assign robotId to WebSocket instance

  console.log(`New robot connected: ${robotId} from ${req.socket.remoteAddress}`);
  ws.send(JSON.stringify({ type: "welcome", message: "Connected to Robot Controller", robotId }));

  // Send current connected robots list to the new client
  broadcastToClients({
    type: "connected_robots",
    robots: Array.from(connectedRobots.keys()),
  });

  ws.on("message", function message(data) {
    try {
      const parsedMessage = JSON.parse(data.toString());
      console.log(`Message from ${robotId}:`, parsedMessage);

      switch (parsedMessage.type) {
        case "location":
          // Handle location updates from the robot
          console.log(`Robot ${robotId} location:`, parsedMessage.data);
          // Broadcast location to all connected web clients (if any)
          broadcastToClients({ type: "robot_location", robotId, data: parsedMessage.data });
          break;
        case "status":
          // Handle status updates from the robot
          console.log(`Robot ${robotId} status:`, parsedMessage.data);
          broadcastToClients({ type: "robot_status", robotId, data: parsedMessage.data });
          break;
        case "ping":
          // Respond to ping with pong
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
        case "command_response":
          // Handle command responses from the robot
          console.log(`Command response from ${robotId}:`, parsedMessage.data);
          broadcastToClients({ type: "command_response", robotId, data: parsedMessage.data });
          break;
        case "command":
          // Handle commands from web interface to robot
          console.log(`Command sent to robot ${robotId}:`, parsedMessage.command);
          // Forward command to the specific robot
          ws.send(JSON.stringify({
            type: "command_received",
            command: parsedMessage.command,
            timestamp: parsedMessage.timestamp,
            source: parsedMessage.source
          }));
          break;
        case "voice_command":
          // Handle voice commands from web interface
          console.log(`Voice command sent to robot ${robotId}:`, parsedMessage.action);
          ws.send(JSON.stringify({
            type: "voice_command_received",
            action: parsedMessage.action,
            timestamp: parsedMessage.timestamp,
            source: parsedMessage.source
          }));
          break;
        case "location_request":
          // Handle location requests from web interface
          console.log(`Location request sent to robot ${robotId}:`, parsedMessage.data);
          ws.send(JSON.stringify({
            type: "location_request_received",
            data: parsedMessage.data,
            timestamp: parsedMessage.timestamp,
            source: parsedMessage.source
          }));
          break;
        default:
          console.log(`Unknown message type from ${robotId}: ${parsedMessage.type}`);
          // Optionally, broadcast unknown messages or log them
          broadcastToClients({ type: "unknown_message", robotId, data: parsedMessage });
      }
    } catch (error) {
      console.error(`Failed to parse message from ${robotId}:`, data.toString(), error);
    }
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("close", () => {
    console.log(`Robot ${robotId} disconnected`);
    connectedRobots.delete(robotId);
    broadcastToClients({
      type: "connected_robots",
      robots: Array.from(connectedRobots.keys()),
    });
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for ${robotId}:`, error);
  });
});

// Heartbeat mechanism to detect broken connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log(`Removing inactive robot: ${ws.robotId}`);
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
console.log("Waiting for robot connections...");

// Function to broadcast messages to all connected web clients (not robots)
function broadcastToClients(message) {
  wss.clients.forEach((client) => {
    // Only send to clients that are not robots (or if you have a way to distinguish)
    // For now, we'll send to all connected clients
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Export for potential use in other server-side logic (e.g., API routes)
module.exports = {
  wss,
  getConnectedRobots: () => Array.from(connectedRobots.keys()),
  broadcastToClients,
};
