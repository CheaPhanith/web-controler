# 🔒 HTTPS Setup for Robot Controller

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup-https.sh
   ```

2. **Start with HTTPS:**
   ```bash
   npm run dev:full:https
   ```

3. **Access your app:**
   - **HTTPS**: `https://localhost:3000`
   - **WSS**: `wss://localhost:8000/web`

## What the Script Does

- ✅ Generates SSL certificates (valid for 365 days)
- ✅ Creates HTTPS WebSocket server
- ✅ Configures Next.js for HTTPS
- ✅ Updates package.json with HTTPS scripts
- ✅ Sets up environment for secure connections

## Available Commands

- `npm run dev:full:https` - Start with HTTPS (recommended)
- `npm run dev:full` - Start with HTTP (fallback)
- `npm run websocket:https` - HTTPS WebSocket server only
- `npm run websocket` - HTTP WebSocket server only

## Browser Security

When you first access `https://localhost:3000`, your browser will show a security warning because we're using a self-signed certificate. This is normal for development.

**To proceed:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. Your app will load with HTTPS enabled

## Features

- 🔒 **Secure WebSocket**: WSS instead of WS
- 🔒 **HTTPS Frontend**: Encrypted communication
- 🔒 **Auto IP Detection**: Works on any host
- 🔒 **Production Ready**: SSL certificates included

## Troubleshooting

**If OpenSSL is not installed:**
- **macOS**: `brew install openssl`
- **Ubuntu**: `sudo apt-get install openssl`
- **CentOS**: `sudo yum install openssl`

**To regenerate certificates:**
```bash
./setup-https.sh
```

## Deployment

For production deployment, replace the self-signed certificates with real SSL certificates from a trusted Certificate Authority (CA) like Let's Encrypt.
