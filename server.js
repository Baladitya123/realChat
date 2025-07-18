const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const cors = require('cors')
const Manager = require('./manager')

const app = express()
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')))

// Initialize WebSocket manager
const manager = new Manager()

// Routes
app.post('/login', (req, res) => {
  console.log('Login attempt:', req.body)
  manager.loginHandler(req, res)
})

// Serve static files (frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'))
})

// WebSocket server
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    // Extract OTP from query params for verification
    const url = new URL(info.req.url, `http://${info.req.headers.host}`)
    const otp = url.searchParams.get('otp')
    const name = url.searchParams.get('name')

    if (!otp || !name) {
      return false
    }

    // Verify OTP
    return manager.checkOtp(otp)
  },
})

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const name = url.searchParams.get('name')
  const otp = url.searchParams.get('otp')

  console.log('New WebSocket connection established')
  manager.handleConnection(ws, name, otp)
})

const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = { app, server, wss }
