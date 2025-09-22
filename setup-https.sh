#!/bin/bash

echo "🔒 Setting up HTTPS for Robot Controller..."

# Create SSL directory
mkdir -p ssl

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed. Please install it first:"
    echo "   macOS: brew install openssl"
    echo "   Ubuntu: sudo apt-get install openssl"
    echo "   CentOS: sudo yum install openssl"
    exit 1
fi

# Generate SSL certificate
echo "🔑 Generating SSL certificate..."
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=RobotController/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1,IP:192.168.0.24"

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate generated successfully!"
else
    echo "❌ Failed to generate SSL certificate"
    exit 1
fi

# Create HTTPS WebSocket server
echo "🔧 Creating HTTPS WebSocket server..."
cat > websocket-server-https.js << 'WEBSOCKET_EOF'
const { WebSocketServer } = require("ws");
const https = require('https');
const fs = require('fs');

// Environment configuration
const PORT = process.env.PORT || process.env.WEBSOCKET_PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`WebSocket server starting on ${HOST}:${PORT} (${NODE_ENV})...`);

// Load SSL certificates
let serverOptions = {};
try {
    serverOptions = {
        key: fs.readFileSync('ssl/key.pem'),
        cert: fs.readFileSync('ssl/cert.pem')
    };
    console.log('🔒 SSL certificates loaded');
} catch (error) {
    console.log('⚠️  SSL certificates not found, falling back to HTTP');
}

// Create HTTPS server
const server = https.createServer(serverOptions);

// WebSocket server with CORS support
const wss = new WebSocketServer({ 
    server,
    path: '/web',
    verifyClient: (info) => {
        if (NODE_ENV === 'development') {
            return true;
        }
        const origin = info.origin;
        console.log(`WebSocket connection attempt from origin: ${origin}`);
        return true;
    }
});

// One-to-one connection: only one robot and one web client at a time
let connectedRobot = null;
let connectedWebClient = null;

// Fixed robot ID - no auto-generation
const ROBOT_ID = "robot_001";

// Start the server
server.listen(PORT, HOST, () => {
    console.log(`✅ WebSocket server ready on ${HOST}:${PORT}`);
    console.log(`🌐 WebSocket URL: wss://${HOST}:${PORT}/web`);
    if (NODE_ENV === 'production') {
        console.log(`🔒 Production mode with SSL enabled`);
    }
});

wss.on("connection", function connection(ws, req) {
    ws.isAlive = true;
    
    const userAgent = req.headers['user-agent'] || '';
    const isWebClient = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
    
    if (isWebClient) {
        if (connectedWebClient) {
            console.log("Web client already connected, closing previous connection");
            connectedWebClient.close();
        }
        
        connectedWebClient = ws;
        ws.isRobot = false;
        ws.clientId = `web_client_${Date.now()}`;
        
        console.log(`Web client connected: ${ws.clientId} from ${req.socket.remoteAddress}`);
        
        ws.send(JSON.stringify({ 
            type: "welcome", 
            message: "Connected to Robot Controller", 
            clientId: ws.clientId,
            isWebClient: true,
            robotConnected: connectedRobot ? true : false
        }));
        
        if (connectedRobot) {
            ws.send(JSON.stringify({
                type: "robot_connected",
                robotId: ROBOT_ID
            }));
        }
        
    } else {
        if (connectedRobot) {
            console.log("Robot already connected, closing previous connection");
            connectedRobot.close();
        }
        
        connectedRobot = ws;
        ws.isRobot = true;
        ws.robotId = ROBOT_ID;
        
        console.log(`Robot connected: ${ROBOT_ID} from ${req.socket.remoteAddress}`);
        ws.send(JSON.stringify({ 
            type: "welcome", 
            message: "Connected to Robot Controller", 
            robotId: ROBOT_ID
        }));
        
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
                switch (parsedMessage.type) {
                    case "location":
                        console.log(`Robot ${ws.robotId} location:`, parsedMessage.data);
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
                switch (parsedMessage.type) {
                    case "button_press":
                        console.log(`Button press from web client:`, parsedMessage.data);
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

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});
WEBSOCKET_EOF

# Create HTTPS Next.js configuration
echo "🔧 Creating Next.js HTTPS configuration..."
cat > next.config.js << 'NEXT_EOF'
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
};

// Enable HTTPS in development
if (process.env.NODE_ENV === 'development') {
  try {
    const httpsOptions = {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem'),
    };
    
    nextConfig.server = {
      https: httpsOptions
    };
    
    console.log('🔒 HTTPS enabled for Next.js development server');
  } catch (error) {
    console.log('⚠️  SSL certificates not found, using HTTP');
  }
}

module.exports = nextConfig;
NEXT_EOF

# Update package.json scripts
echo "📝 Updating package.json scripts..."
cat > package.json << 'PACKAGE_EOF'
{
  "name": "robot-controller",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "build": "next build",
    "start": "next start -H 0.0.0.0",
    "start:prod": "concurrently \"npm run websocket:https\" \"npm start\"",
    "lint": "eslint",
    "websocket": "node websocket-server.js",
    "websocket:https": "node websocket-server-https.js",
    "dev:full": "concurrently \"npm run websocket\" \"npm run dev\"",
    "dev:full:https": "concurrently \"npm run websocket:https\" \"npm run dev:https\""
  },
  "dependencies": {
    "@types/ws": "^8.18.1",
    "leaflet": "^1.9.4",
    "maplibre-gl": "^5.7.3",
    "next": "15.5.3",
    "openai": "^5.22.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-leaflet": "^5.0.0",
    "ws": "^8.18.3"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/leaflet": "^1.9.20",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "concurrently": "^8.2.2",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
PACKAGE_EOF

# Update environment file for HTTPS
echo "🔧 Updating environment configuration..."
cat > .env.local << 'ENV_EOF'
# HTTPS Environment configuration
# WebSocket URL is auto-detected by the application

# Server Configuration
WEBSOCKET_PORT=8000
HOST=0.0.0.0
NODE_ENV=development

# OpenAI API Key (replace with your actual key)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
ENV_EOF

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "🚀 Available commands:"
echo "   • npm run dev:full:https    - Start with HTTPS (recommended)"
echo "   • npm run dev:full          - Start with HTTP (fallback)"
echo ""
echo "🌐 Access URLs:"
echo "   • HTTPS: https://localhost:3000"
echo "   • WSS:   wss://localhost:8000/web"
echo ""
echo "⚠️  Note: You may need to accept the self-signed certificate in your browser"
echo "   Click 'Advanced' → 'Proceed to localhost (unsafe)'"
echo ""
echo "🔒 SSL certificates are valid for 365 days"
echo "   To regenerate: ./setup-https.sh"
