const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8000');

ws.on('open', function open() {
  console.log('✅ Connected to Robot Controller WebSocket Server');
  
  // Send a test location update
  setTimeout(() => {
    const locationMessage = {
      type: 'location',
      data: {
        lat: 37.7749,
        lng: -122.4194,
        timestamp: new Date().toISOString()
      }
    };
    ws.send(JSON.stringify(locationMessage));
    console.log('📡 Sent location update:', locationMessage);
  }, 1000);

  // Send a test status update
  setTimeout(() => {
    const statusMessage = {
      type: 'status',
      data: {
        battery: 85,
        speed: 2.5,
        mode: 'autonomous',
        timestamp: new Date().toISOString()
      }
    };
    ws.send(JSON.stringify(statusMessage));
    console.log('📊 Sent status update:', statusMessage);
  }, 2000);

  // Send a ping
  setTimeout(() => {
    const pingMessage = {
      type: 'ping',
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(pingMessage));
    console.log('🏓 Sent ping:', pingMessage);
  }, 3000);
});

ws.on('message', function message(data) {
  try {
    const parsed = JSON.parse(data.toString());
    console.log('📨 Received message:', parsed);
    
    // Handle different message types
    switch (parsed.type) {
      case 'welcome':
        console.log('🎉 Welcome message:', parsed.message);
        break;
      case 'pong':
        console.log('🏓 Pong received at:', new Date(parsed.timestamp));
        break;
      case 'command_received':
        console.log('🎮 Command received by robot:', parsed.command);
        break;
      case 'voice_command_received':
        console.log('🎤 Voice command received by robot:', parsed.action);
        break;
      case 'location_request_received':
        console.log('📍 Location request received by robot:', parsed.data);
        break;
      default:
        console.log('📋 Other message:', parsed);
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Keep the connection alive and show instructions
console.log('🤖 Robot WebSocket Test Client');
console.log('📝 This simulates a robot connecting to the controller');
console.log('🌐 Open http://localhost:3000 in your browser to test the web interface');
console.log('🎮 Try clicking the control buttons to send commands to this robot');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test client...');
  ws.close();
  process.exit(0);
});
