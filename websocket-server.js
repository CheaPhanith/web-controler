const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server
});

console.log('WebSocket server starting on port 8000...');

// Store connected robots
const connectedRobots = new Map();

wss.on('connection', (ws, req) => {
  const robotId = `robot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientIP = req.socket.remoteAddress;
  
  console.log(`New robot connected: ${robotId} from ${clientIP}`);
  
  // Store robot connection
  connectedRobots.set(robotId, {
    ws,
    id: robotId,
    ip: clientIP,
    connectedAt: new Date(),
    lastPing: new Date()
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    robotId: robotId,
    message: 'Connected to Robot Controller',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages from robot
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Message from ${robotId}:`, message);
      
      // Handle different message types
      switch (message.type) {
        case 'location':
          console.log(`Robot ${robotId} location:`, message.data);
          // Broadcast location to all connected clients (if any)
          broadcastToClients({
            type: 'robot_location',
            robotId: robotId,
            data: message.data,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'status':
          console.log(`Robot ${robotId} status:`, message.data);
          broadcastToClients({
            type: 'robot_status',
            robotId: robotId,
            data: message.data,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'command_response':
          console.log(`Robot ${robotId} command response:`, message.data);
          break;
          
        case 'ping':
          // Update last ping time
          const robot = connectedRobots.get(robotId);
          if (robot) {
            robot.lastPing = new Date();
          }
          // Send pong response
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        default:
          console.log(`Unknown message type from ${robotId}:`, message.type);
      }
    } catch (error) {
      console.error(`Error parsing message from ${robotId}:`, error);
    }
  });

  // Handle robot disconnection
  ws.on('close', () => {
    console.log(`Robot ${robotId} disconnected`);
    connectedRobots.delete(robotId);
    broadcastToClients({
      type: 'robot_disconnected',
      robotId: robotId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for robot ${robotId}:`, error);
    connectedRobots.delete(robotId);
  });
});

// Function to broadcast messages to all connected clients (web interface)
function broadcastToClients(message) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Function to send command to specific robot
function sendCommandToRobot(robotId, command) {
  const robot = connectedRobots.get(robotId);
  if (robot && robot.ws.readyState === WebSocket.OPEN) {
    const message = {
      type: 'command',
      command: command,
      timestamp: new Date().toISOString()
    };
    robot.ws.send(JSON.stringify(message));
    console.log(`Command sent to robot ${robotId}:`, command);
    return true;
  }
  return false;
}

// Function to get connected robots info
function getConnectedRobots() {
  const robots = [];
  connectedRobots.forEach((robot, id) => {
    robots.push({
      id: robot.id,
      ip: robot.ip,
      connectedAt: robot.connectedAt,
      lastPing: robot.lastPing,
      isConnected: robot.ws.readyState === WebSocket.OPEN
    });
  });
  return robots;
}

// Start server
server.listen(8000, '0.0.0.0', () => {
  console.log('Robot Controller WebSocket Server running on port 8000');
  console.log('Waiting for robot connections...');
});

// Cleanup disconnected robots every 30 seconds
setInterval(() => {
  const now = new Date();
  connectedRobots.forEach((robot, id) => {
    if (now - robot.lastPing > 60000) { // 1 minute timeout
      console.log(`Removing inactive robot: ${id}`);
      robot.ws.terminate();
      connectedRobots.delete(id);
    }
  });
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

// Export functions for potential use by other modules
module.exports = {
  sendCommandToRobot,
  getConnectedRobots,
  broadcastToClients
};
