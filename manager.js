const Client = require('./client')
const OtpManager = require('./otp')
const EventTypes = require('./events')

class Manager {
  constructor() {
    this.clients = new Map()
    this.handlers = new Map()
    this.otpManager = new OtpManager(30000) // 30 seconds retention
    this.setupEventHandlers()
  }

  setupEventHandlers() {
    this.handlers.set(EventTypes.SEND_MESSAGE, this.sendMessage.bind(this))
    this.handlers.set(EventTypes.CHANGE_CHATROOM, this.changeChatRoom.bind(this))
  }

  handleConnection(ws, name, otp) {
    // Consume the OTP (it gets deleted after verification)
    if (!this.otpManager.verifyOtp(otp)) {
      ws.close(1008, 'Invalid OTP')
      return
    }

    const client = new Client(ws, this, name)
    this.addClient(client)

    // Start client message handling
    client.startListening()
  }

  addClient(client) {
    this.clients.set(client, true)
    console.log(`Client ${client.name} added. Total clients: ${this.clients.size}`)
  }

  removeClient(client) {
    if (this.clients.has(client)) {
      this.clients.delete(client)
      client.close()
      console.log(`Client ${client.name} removed. Total clients: ${this.clients.size}`)
    }
  }

  routeEvent(event, client) {
    const handler = this.handlers.get(event.type)
    if (handler) {
      try {
        handler(event, client)
      } catch (error) {
        console.error(`Error handling event ${event.type}:`, error)
      }
    } else {
      console.error(`No handler found for event type: ${event.type}`)
    }
  }

  sendMessage(event, client) {
    try {
      const messageData = event.payload

      // Create broadcast message
      const broadcastMessage = {
        message: messageData.message,
        from: messageData.from,
        sent: new Date().toISOString(),
      }

      // Create outgoing event
      const outgoingEvent = {
        type: EventTypes.NEW_MESSAGE,
        payload: broadcastMessage,
      }

      // Broadcast to all clients in the same chatroom except sender
      for (const [targetClient] of this.clients) {
        if (targetClient.chatroom === client.chatroom && targetClient.name !== client.name) {
          targetClient.send(outgoingEvent)
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
    }
  }

  changeChatRoom(event, client) {
    try {
      const changeChatRoomData = event.payload
      client.chatroom = changeChatRoomData.name
      console.log(`Client ${client.name} changed to chatroom: ${client.chatroom}`)
    } catch (error) {
      console.error('Error in changeChatRoom:', error)
    }
  }

  loginHandler(req, res) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' })
      }

      // Predefined users
      const validUsers = ['balu', 'yaswanth', 'person1', 'person2']

      if (validUsers.includes(username) && password === '123') {
        const otp = this.otpManager.generateOtp()
        return res.status(200).json({ otp })
      }

      return res.status(401).json({ error: 'Invalid credentials' })
    } catch (error) {
      console.error('Error in loginHandler:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  verifyOtp(otp) {
    return this.otpManager.verifyOtp(otp)
  }

  checkOtp(otp) {
    return this.otpManager.checkOtp(otp)
  }
}

module.exports = Manager
