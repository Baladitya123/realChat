const WebSocket = require('ws')
const EventTypes = require('./events')

class Client {
  constructor(connection, manager, name) {
    this.connection = connection
    this.manager = manager
    this.name = name
    this.chatroom = 'general' // Default chatroom
    this.isAlive = true

    // Ping-pong for connection health
    this.pingInterval = null
    this.setupPingPong()
  }

  setupPingPong() {
    // Set up ping interval (9 seconds, similar to Go version)
    this.pingInterval = setInterval(() => {
      if (!this.isAlive) {
        console.log(`Client ${this.name} is not responding, terminating connection`)
        this.manager.removeClient(this)
        return
      }

      this.isAlive = false
      this.connection.ping()
      console.log(`Ping sent to ${this.name}`)
    }, 9000)

    // Handle pong response
    this.connection.on('pong', () => {
      console.log(`Pong received from ${this.name}`)
      this.isAlive = true
    })
  }

  startListening() {
    this.connection.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString())
        this.manager.routeEvent(event, this)
      } catch (error) {
        console.error(`Error parsing message from ${this.name}:`, error)
      }
    })

    this.connection.on('close', (code, reason) => {
      console.log(`Connection closed for ${this.name}. Code: ${code}, Reason: ${reason}`)
      this.cleanup()
    })

    this.connection.on('error', (error) => {
      console.error(`WebSocket error for ${this.name}:`, error)
      this.cleanup()
    })
  }

  send(event) {
    if (this.connection.readyState === WebSocket.OPEN) {
      try {
        this.connection.send(JSON.stringify(event))
        console.log(`Message sent to ${this.name}`)
      } catch (error) {
        console.error(`Error sending message to ${this.name}:`, error)
      }
    }
  }

  close() {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.close()
    }
    this.cleanup()
  }

  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    this.manager.removeClient(this)
  }
}

module.exports = Client
