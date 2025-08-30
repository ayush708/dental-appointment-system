import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.pingInterval = null
    this.listeners = new Map()
  }

  // Initialize socket connection
  connect(token, options = {}) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected')
      return this.socket
    }

    const defaultOptions = {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      auth: {
        token: token,
      },
    }

    const socketOptions = { ...defaultOptions, ...options }

    try {
      this.socket = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
        socketOptions
      )

      this.setupEventListeners()
      this.isConnected = true

      return this.socket
    } catch (error) {
      console.error('Failed to create socket connection:', error)
      throw error
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.clearPingInterval()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.reconnectAttempts = 0
      console.log('Socket disconnected')
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', this.onConnect.bind(this))
    this.socket.on('disconnect', this.onDisconnect.bind(this))
    this.socket.on('connect_error', this.onConnectError.bind(this))
    this.socket.on('reconnect', this.onReconnect.bind(this))
    this.socket.on('reconnect_error', this.onReconnectError.bind(this))
    this.socket.on('reconnect_failed', this.onReconnectFailed.bind(this))

    // Authentication events
    this.socket.on('authenticated', this.onAuthenticated.bind(this))
    this.socket.on('authentication_error', this.onAuthenticationError.bind(this))
    this.socket.on('unauthorized', this.onUnauthorized.bind(this))

    // Server events
    this.socket.on('pong', this.onPong.bind(this))
    this.socket.on('server_message', this.onServerMessage.bind(this))
    this.socket.on('server_error', this.onServerError.bind(this))

    // Custom event listeners
    this.restoreListeners()
  }

  // Connection event handlers
  onConnect() {
    console.log('Socket connected:', this.socket.id)
    this.isConnected = true
    this.reconnectAttempts = 0
    this.startPing()
    this.emit('client_connected', { timestamp: Date.now() })
  }

  onDisconnect(reason) {
    console.log('Socket disconnected:', reason)
    this.isConnected = false
    this.clearPingInterval()

    // Auto-reconnect if not intentional disconnect
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't reconnect
      return
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect()
    }
  }

  onConnectError(error) {
    console.error('Socket connection error:', error)
    this.isConnected = false
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect()
    }
  }

  onReconnect(attemptNumber) {
    console.log('Socket reconnected after', attemptNumber, 'attempts')
    this.isConnected = true
    this.reconnectAttempts = 0
  }

  onReconnectError(error) {
    console.error('Socket reconnection error:', error)
    this.reconnectAttempts++
  }

  onReconnectFailed() {
    console.error('Socket reconnection failed after maximum attempts')
    this.isConnected = false
  }

  // Authentication event handlers
  onAuthenticated(data) {
    console.log('Socket authenticated:', data)
  }

  onAuthenticationError(error) {
    console.error('Socket authentication error:', error)
    this.disconnect()
  }

  onUnauthorized(error) {
    console.error('Socket unauthorized:', error)
    this.disconnect()
  }

  // Server event handlers
  onPong(data) {
    console.log('Received pong:', data)
  }

  onServerMessage(message) {
    console.log('Server message:', message)
  }

  onServerError(error) {
    console.error('Server error:', error)
  }

  // Reconnection logic
  attemptReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  // Ping mechanism to keep connection alive
  startPing() {
    this.clearPingInterval()
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping', { timestamp: Date.now() })
      }
    }, 30000) // Ping every 30 seconds
  }

  clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  // Event management
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Storing listener for later.')
      this.storeListener(event, callback)
      return
    }

    this.socket.on(event, callback)
    this.storeListener(event, callback)
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
    this.removeListener(event, callback)
  }

  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn(`Cannot emit '${event}': Socket not connected`)
      return false
    }

    if (callback) {
      this.socket.emit(event, data, callback)
    } else {
      this.socket.emit(event, data)
    }
    return true
  }

  // Store listeners for reconnection
  storeListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  restoreListeners() {
    if (!this.socket) return

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback)
      })
    })
  }

  // Room management
  joinRoom(room) {
    return this.emit('join_room', { room })
  }

  leaveRoom(room) {
    return this.emit('leave_room', { room })
  }

  // Typing indicators
  startTyping(room) {
    return this.emit('typing', { room })
  }

  stopTyping(room) {
    return this.emit('stop_typing', { room })
  }

  // Message management
  sendMessage(room, message) {
    return this.emit('message', {
      room,
      message,
      timestamp: Date.now(),
    })
  }

  sendPrivateMessage(userId, message) {
    return this.emit('private_message', {
      userId,
      message,
      timestamp: Date.now(),
    })
  }

  // File sharing
  sendFile(room, fileData) {
    return this.emit('file_share', {
      room,
      fileData,
      timestamp: Date.now(),
    })
  }

  // Video call methods
  initiateVideoCall(userId, callData) {
    return this.emit('video_call_initiate', {
      userId,
      callData,
      timestamp: Date.now(),
    })
  }

  acceptVideoCall(callId) {
    return this.emit('video_call_accept', {
      callId,
      timestamp: Date.now(),
    })
  }

  rejectVideoCall(callId, reason) {
    return this.emit('video_call_reject', {
      callId,
      reason,
      timestamp: Date.now(),
    })
  }

  endVideoCall(callId) {
    return this.emit('video_call_end', {
      callId,
      timestamp: Date.now(),
    })
  }

  sendICECandidate(callId, candidate) {
    return this.emit('video_call_ice_candidate', {
      callId,
      candidate,
    })
  }

  sendOffer(callId, offer) {
    return this.emit('video_call_offer', {
      callId,
      offer,
    })
  }

  sendAnswer(callId, answer) {
    return this.emit('video_call_answer', {
      callId,
      answer,
    })
  }

  // Notification methods
  sendNotification(userId, notification) {
    return this.emit('send_notification', {
      userId,
      notification,
      timestamp: Date.now(),
    })
  }

  markNotificationRead(notificationId) {
    return this.emit('notification_read', {
      notificationId,
      timestamp: Date.now(),
    })
  }

  // Appointment methods
  appointmentUpdate(appointmentData) {
    return this.emit('appointment_update', {
      appointmentData,
      timestamp: Date.now(),
    })
  }

  appointmentReminder(appointmentId) {
    return this.emit('appointment_reminder', {
      appointmentId,
      timestamp: Date.now(),
    })
  }

  emergencyAlert(alertData) {
    return this.emit('emergency_alert', {
      alertData,
      priority: 'urgent',
      timestamp: Date.now(),
    })
  }

  // User status methods
  updateUserStatus(status) {
    return this.emit('user_status', {
      status,
      timestamp: Date.now(),
    })
  }

  setUserOnline() {
    return this.updateUserStatus('online')
  }

  setUserOffline() {
    return this.updateUserStatus('offline')
  }

  setUserAway() {
    return this.updateUserStatus('away')
  }

  setUserBusy() {
    return this.updateUserStatus('busy')
  }

  // Queue management
  joinQueue(queueData) {
    return this.emit('queue_join', {
      queueData,
      timestamp: Date.now(),
    })
  }

  leaveQueue(queueId) {
    return this.emit('queue_leave', {
      queueId,
      timestamp: Date.now(),
    })
  }

  // Utility methods
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name,
    }
  }

  // Error handling
  handleError(error, context = '') {
    console.error(`Socket error ${context}:`, error)
    
    // Emit error event for application to handle
    if (this.socket) {
      this.socket.emit('client_error', {
        error: error.message || error,
        context,
        timestamp: Date.now(),
      })
    }
  }

  // Cleanup
  cleanup() {
    this.clearPingInterval()
    this.listeners.clear()
    
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.reconnectAttempts = 0
  }
}

// Create singleton instance
const socketService = new SocketService()

// Export singleton instance
export { socketService }

// Export class for testing
export default SocketService
