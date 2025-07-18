# Testing Guide for Node.js WebSocket Chat Application

## Prerequisites

- Node.js installed on your system
- All dependencies installed (`npm install` in the nodejs-backend directory)

## Starting the Server

1. Navigate to the nodejs-backend directory:

   ```bash
   cd nodejs-backend
   ```

2. Start the server:

   ```bash
   node server.js
   ```

   Or use npm:

   ```bash
   npm start
   ```

3. You should see: "Server is running on port 8080"

## Testing the Application

### 1. Access the Application

- Open your browser and go to: `http://localhost:8080`
- You should see the chat application interface

### 2. Login

Use one of these valid accounts:

- **Username**: `balu`, **Password**: `123`
- **Username**: `yaswanth`, **Password**: `123`
- **Username**: `bhagya lakshmi`, **Password**: `123`
- **Username**: `gopala krishna`, **Password**: `123`

### 3. Test Basic Chat

1. Login with one of the valid accounts
2. Once connected, the "connection to the websockets" should show "true"
3. Type a message and press "Send Message"
4. You should see your message appear in the chat

### 4. Test Multiple Users

1. Open another browser tab/window (or use incognito mode)
2. Go to `http://localhost:8080`
3. Login with a different username
4. Send messages from both windows
5. Messages should appear in real-time on both windows

### 5. Test Chat Rooms

1. In one window, change the chatroom by typing a room name (e.g., "test-room") and clicking "Change Chatroom"
2. Send a message from that window
3. Messages should only be visible to users in the same chatroom
4. Switch the other window to the same chatroom to see the messages

## API Testing with curl

### Test Login Endpoint

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "balu", "password": "123"}'
```

Expected response:

```json
{ "otp": "some-uuid-string" }
```

### Test Invalid Login

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "invalid", "password": "wrong"}'
```

Expected response: 401 Unauthorized

## WebSocket Testing with wscat (Optional)

If you have wscat installed:

1. First, get an OTP by logging in via the API
2. Connect to WebSocket:

   ```bash
   wscat -c "ws://localhost:8080/ws?otp=YOUR_OTP&name=testuser"
   ```

3. Send a message:
   ```json
   { "type": "send_message", "payload": { "message": "Hello World", "from": "testuser" } }
   ```

## Expected Behavior

1. **Authentication**: Only valid users can get OTPs
2. **OTP Expiration**: OTPs expire after 5 seconds
3. **Real-time Messaging**: Messages appear instantly across connected clients
4. **Chat Rooms**: Users only see messages from their current room
5. **Connection Health**: Ping-pong mechanism keeps connections alive
6. **Auto-cleanup**: Disconnected clients are automatically removed

## Troubleshooting

1. **Server won't start**: Make sure port 8080 is not in use
2. **Connection failed**: Check browser console for WebSocket errors
3. **Login fails**: Verify you're using valid username/password combinations
4. **Messages not appearing**: Check that both users are in the same chatroom

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.
