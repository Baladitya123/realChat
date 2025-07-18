# WebSocket Chat Application - Node.js Backend

This is a Node.js implementation of the WebSocket chat application, providing the same functionality as the Go version.

## Features

- User authentication with OTP-based login
- Real-time WebSocket communication
- Multiple chat rooms support
- Ping-pong heartbeat mechanism
- Auto-cleanup of expired OTPs
- CORS support for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the nodejs-backend directory:

   ```bash
   cd nodejs-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

### Development mode (with auto-restart):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on port 8080 by default. You can access the application at `http://localhost:8080`.

## API Endpoints

### POST /login

Authenticate user and receive OTP for WebSocket connection.

**Request body:**

```json
{
  "username": "balu",
  "password": "123"
}
```

**Response:**

```json
{
  "otp": "generated-uuid-string"
}
```

### WebSocket Connection

Connect to WebSocket at `ws://localhost:8080/ws?otp=YOUR_OTP&name=USERNAME`

## Valid Users

The following users are pre-configured with password "123":

- balu
- yaswanth
- person1
- person2

## WebSocket Events

### Send Message

```json
{
  "type": "send_message",
  "payload": {
    "message": "Hello, World!",
    "from": "username"
  }
}
```

### Change Chat Room

```json
{
  "type": "change_chatroom",
  "payload": {
    "name": "room-name"
  }
}
```

### New Message (Broadcast)

```json
{
  "type": "new_message",
  "payload": {
    "message": "Hello, World!",
    "from": "username",
    "sent": "2023-12-07T10:30:00.000Z"
  }
}
```

## File Structure

- `server.js` - Main server file with Express and WebSocket setup
- `manager.js` - WebSocket connection manager and event routing
- `client.js` - Individual client connection handling
- `otp.js` - OTP generation and verification system
- `events.js` - Event type constants
- `package.json` - Project dependencies and scripts

## Security Features

- OTP-based authentication
- One-time use OTPs with automatic expiration (5 seconds)
- Connection verification before WebSocket upgrade
- Automatic cleanup of expired OTPs

## Differences from Go Version

- Uses HTTP instead of HTTPS (can be easily modified for HTTPS)
- Uses `ws` library instead of Gorilla WebSocket
- Express.js for HTTP server instead of Go's net/http
- UUID v4 for OTP generation instead of Google UUID
