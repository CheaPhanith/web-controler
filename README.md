# Robot Controller

A modern, responsive Next.js web application for controlling robots with real-time communication via WebSocket.

## ✨ Features

- **🗺️ Interactive Map**: Modern map interface with real-time robot location tracking
- **🎮 Control Panel**: Six colorful control buttons (A, B, C, D, E, F) with smooth animations
- **🎤 Voice & Location**: Modern voice command and location sharing with visual feedback
- **🔌 WebSocket Communication**: Real-time communication with robots on port 8000
- **📱 Mobile-First Design**: Responsive design optimized for mobile devices
- **🎨 Modern UI**: Clean, contemporary design with glassmorphism effects and smooth animations

## 🎨 Design Features

### Modern Visual Elements
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur effects
- **Gradient Buttons**: Colorful gradient buttons with hover animations
- **Smooth Animations**: Micro-interactions and smooth transitions
- **Modern Typography**: Clean, readable fonts with proper hierarchy
- **Status Indicators**: Animated connection status with color-coded feedback

### User Experience
- **Touch-Friendly**: Large, accessible buttons optimized for mobile
- **Visual Feedback**: Immediate response to user interactions
- **Loading States**: Elegant loading animations and progress indicators
- **Error Handling**: Clear error messages and connection status

## 🏗️ Components

### 1. Map Component
- Interactive map with modern styling
- Real-time location updates with smooth animations
- User location detection with permission handling
- Loading states with dual-spinner animations
- Live status indicator overlay

### 2. Control Panel
- Six gradient control buttons (A, B, C, D, E, F)
- Color-coded buttons with unique gradients
- Smooth hover and press animations
- Connection status with animated indicators
- Disabled state styling when disconnected

### 3. Bottom Panel
- Modern voice command button with recording animation
- Location sharing button with sending animation
- Gradient backgrounds with hover effects
- Visual feedback for all actions

### 4. WebSocket Server
- Runs on port 8000
- Handles robot connections with modern logging
- Message routing and broadcasting
- Connection management with ping/pong
- Supports various message types

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the WebSocket server:
```bash
npm run websocket
```

3. In another terminal, start the Next.js development server:
```bash
npm run dev
```

4. Or run both simultaneously:
```bash
npm run dev:full
```

## 📱 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. The WebSocket server will be running on `ws://localhost:8000`
3. Connect your robot to the WebSocket server
4. Use the colorful control panel to send commands to the robot
5. Monitor robot location on the modern map interface
6. Use voice commands or send your location to the robot

## 🔌 WebSocket Protocol

### Robot Connection
Robots should connect to `ws://localhost:8000` and send messages in JSON format:

```json
{
  "type": "location",
  "data": {
    "lat": 37.7749,
    "lng": -122.4194
  }
}
```

### Command Types
- `location`: Robot location update
- `status`: Robot status update
- `ping`: Keep-alive ping
- `command_response`: Response to commands

### Commands from Web Interface
- Button presses (A, B, C, D, E, F)
- Voice commands
- Location sharing

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with modern layout
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Modern CSS with animations
├── components/
│   ├── MapComponent.tsx  # Modern interactive map
│   ├── ControlPanel.tsx  # Gradient control buttons
│   └── BottomPanel.tsx   # Voice and location buttons
└── hooks/
    └── useWebSocket.ts   # WebSocket connection hook
websocket-server.js       # WebSocket server
```

## 🛠️ Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS with modern design system
- **React Leaflet**: Interactive maps with custom styling
- **WebSocket**: Real-time communication
- **Node.js**: WebSocket server

## 🎯 Modern Design Principles

### Visual Design
- **Glassmorphism**: Semi-transparent elements with backdrop blur
- **Gradient Overlays**: Subtle gradients for depth and visual interest
- **Rounded Corners**: Modern rounded corners throughout the interface
- **Shadow System**: Layered shadows for depth perception
- **Color System**: Carefully chosen color palette with semantic meaning

### Animation & Interaction
- **Smooth Transitions**: 300ms cubic-bezier transitions
- **Hover Effects**: Scale and shadow changes on interaction
- **Loading States**: Dual-spinner animations for better UX
- **Micro-interactions**: Button press feedback and state changes
- **Transform GPU**: Hardware-accelerated animations

### Accessibility
- **Focus States**: Clear focus indicators for keyboard navigation
- **Color Contrast**: High contrast ratios for readability
- **Touch Targets**: Large, accessible touch targets
- **Screen Reader**: Semantic HTML structure
- **Responsive Design**: Works on all screen sizes

## 📱 Mobile-First Design

The application is designed with a mobile-first approach:
- **Responsive Layout**: Adapts to all screen sizes
- **Touch Optimization**: Large buttons and touch-friendly controls
- **Performance**: Optimized for mobile devices
- **Modern Aesthetics**: Contemporary design language
- **Intuitive Navigation**: Clear visual hierarchy and flow

## 🔧 Development

To start development:

1. Run the WebSocket server: `npm run websocket`
2. Run the Next.js dev server: `npm run dev`
3. Or use: `npm run dev:full` to run both

The application will be available at `http://localhost:3000` and the WebSocket server at `ws://localhost:8000`.

## 🎨 Customization

The modern design can be easily customized by modifying:
- **Colors**: Update the gradient colors in component files
- **Animations**: Adjust transition durations in globals.css
- **Layout**: Modify spacing and sizing in Tailwind classes
- **Typography**: Change font weights and sizes
- **Effects**: Add or remove glassmorphism and shadow effects
