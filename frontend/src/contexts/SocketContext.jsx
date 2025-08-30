import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useNotifications } from './NotificationContext'

// Socket events
const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  
  // Authentication events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  AUTHENTICATION_ERROR: 'authentication_error',
  UNAUTHORIZED: 'unauthorized',
  
  // User events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  USER_UPDATED: 'user_updated',
  
  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  
  // Appointment events
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_UPDATED: 'appointment_updated',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_EMERGENCY: 'appointment_emergency',
  
  // Chat events
  CHAT_MESSAGE: 'chat_message',
  CHAT_MESSAGE_TYPING: 'chat_message_typing',
  CHAT_MESSAGE_STOP_TYPING: 'chat_message_stop_typing',
  CHAT_MESSAGE_READ: 'chat_message_read',
  CHAT_ROOM_JOINED: 'chat_room_joined',
  CHAT_ROOM_LEFT: 'chat_room_left',
  
  // Video call events
  VIDEO_CALL_INITIATED: 'video_call_initiated',
  VIDEO_CALL_ACCEPTED: 'video_call_accepted',
  VIDEO_CALL_REJECTED: 'video_call_rejected',
  VIDEO_CALL_ENDED: 'video_call_ended',
  VIDEO_CALL_ICE_CANDIDATE: 'video_call_ice_candidate',
  VIDEO_CALL_OFFER: 'video_call_offer',
  VIDEO_CALL_ANSWER: 'video_call_answer',
  
  // System events
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  SYSTEM_EMERGENCY: 'system_emergency',
  
  // Queue events
  QUEUE_UPDATED: 'queue_updated',
  QUEUE_POSITION: 'queue_position',
  QUEUE_CALLED: 'queue_called',
  
  // Payment events
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded',
  
  // Clinic events
  CLINIC_STATUS_UPDATED: 'clinic_status_updated',
  CLINIC_SCHEDULE_UPDATED: 'clinic_schedule_updated',
  
  // Doctor events
  DOCTOR_AVAILABLE: 'doctor_available',
  DOCTOR_UNAVAILABLE: 'doctor_unavailable',
  DOCTOR_SCHEDULE_UPDATED: 'doctor_schedule_updated',
}

// Connection states
const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
}

// Create socket context
const SocketContext = createContext()

// Socket provider component
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const connectionStateRef = useRef(CONNECTION_STATES.DISCONNECTED)
  
  const { user, token, isAuthenticated } = useAuth()
  const { addNotification } = useNotifications()

  // Connection status
  const [connectionState, setConnectionState] = React.useState(CONNECTION_STATES.DISCONNECTED)
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0)
  const [lastSeen, setLastSeen] = React.useState(null)

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (isAuthenticated && !socketRef.current?.connected) {
        connect()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionState(CONNECTION_STATES.DISCONNECTED)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated])

  // Connect to socket server
  const connect = useCallback(() => {
    if (!isAuthenticated || !token || !isOnline) return

    if (socketRef.current?.connected) {
      console.log('Socket already connected')
      return
    }

    console.log('Connecting to socket server...')
    setConnectionState(CONNECTION_STATES.CONNECTING)
    connectionStateRef.current = CONNECTION_STATES.CONNECTING

    // Create socket connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      autoConnect: false,
      auth: {
        token,
      },
      query: {
        userId: user?.id,
        userType: user?.role,
      },
    })

    // Connection event handlers
    socketRef.current.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected')
      setConnectionState(CONNECTION_STATES.CONNECTED)
      connectionStateRef.current = CONNECTION_STATES.CONNECTED
      setReconnectAttempts(0)
      
      // Start ping interval
      startPingInterval()
      
      toast.success('Connected to server', { duration: 2000 })
    })

    socketRef.current.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason)
      setConnectionState(CONNECTION_STATES.DISCONNECTED)
      connectionStateRef.current = CONNECTION_STATES.DISCONNECTED
      setLastSeen(new Date())
      
      // Clear ping interval
      clearPingInterval()
      
      // Auto-reconnect if not intentional disconnect
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return
      }
      
      if (isAuthenticated && isOnline) {
        attemptReconnect()
      }
    })

    socketRef.current.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error)
      setConnectionState(CONNECTION_STATES.ERROR)
      connectionStateRef.current = CONNECTION_STATES.ERROR
      
      if (isAuthenticated && isOnline) {
        attemptReconnect()
      }
    })

    socketRef.current.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setConnectionState(CONNECTION_STATES.CONNECTED)
      connectionStateRef.current = CONNECTION_STATES.CONNECTED
      setReconnectAttempts(0)
      
      toast.success('Reconnected to server', { duration: 2000 })
    })

    socketRef.current.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
      console.error('Socket reconnection error:', error)
      setReconnectAttempts(prev => prev + 1)
    })

    socketRef.current.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
      console.error('Socket reconnection failed')
      setConnectionState(CONNECTION_STATES.ERROR)
      connectionStateRef.current = CONNECTION_STATES.ERROR
      
      toast.error('Failed to reconnect to server', { duration: 5000 })
    })

    // Authentication events
    socketRef.current.on(SOCKET_EVENTS.AUTHENTICATED, (data) => {
      console.log('Socket authenticated:', data)
    })

    socketRef.current.on(SOCKET_EVENTS.AUTHENTICATION_ERROR, (error) => {
      console.error('Socket authentication error:', error)
      toast.error('Authentication failed')
      disconnect()
    })

    socketRef.current.on(SOCKET_EVENTS.UNAUTHORIZED, () => {
      console.error('Socket unauthorized')
      toast.error('Unauthorized access')
      disconnect()
    })

    // Notification events
    socketRef.current.on(SOCKET_EVENTS.NOTIFICATION, (notification) => {
      addNotification(notification)
    })

    // Appointment events
    socketRef.current.on(SOCKET_EVENTS.APPOINTMENT_CREATED, (appointment) => {
      addNotification({
        type: 'appointment',
        title: 'New Appointment',
        message: `Appointment scheduled for ${new Date(appointment.dateTime).toLocaleString()}`,
        data: appointment,
        priority: 'medium',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.APPOINTMENT_UPDATED, (appointment) => {
      addNotification({
        type: 'appointment',
        title: 'Appointment Updated',
        message: `Your appointment has been updated`,
        data: appointment,
        priority: 'medium',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.APPOINTMENT_CANCELLED, (appointment) => {
      addNotification({
        type: 'warning',
        title: 'Appointment Cancelled',
        message: `Your appointment on ${new Date(appointment.dateTime).toLocaleString()} has been cancelled`,
        data: appointment,
        priority: 'high',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.APPOINTMENT_REMINDER, (appointment) => {
      addNotification({
        type: 'reminder',
        title: 'Appointment Reminder',
        message: `You have an appointment in ${appointment.timeUntil}`,
        data: appointment,
        priority: 'high',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.APPOINTMENT_EMERGENCY, (appointment) => {
      addNotification({
        type: 'emergency',
        title: 'Emergency Appointment',
        message: `Emergency appointment scheduled`,
        data: appointment,
        priority: 'urgent',
      })
    })

    // Chat events
    socketRef.current.on(SOCKET_EVENTS.CHAT_MESSAGE, (message) => {
      if (message.senderId !== user?.id) {
        addNotification({
          type: 'chat',
          title: `Message from ${message.senderName}`,
          message: message.content,
          data: message,
          priority: 'medium',
        })
      }
    })

    // Video call events
    socketRef.current.on(SOCKET_EVENTS.VIDEO_CALL_INITIATED, (call) => {
      addNotification({
        type: 'info',
        title: 'Incoming Call',
        message: `${call.callerName} is calling you`,
        data: call,
        priority: 'urgent',
      })
    })

    // System events
    socketRef.current.on(SOCKET_EVENTS.SYSTEM_MAINTENANCE, (maintenance) => {
      addNotification({
        type: 'warning',
        title: 'System Maintenance',
        message: maintenance.message,
        data: maintenance,
        priority: 'high',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.SYSTEM_EMERGENCY, (emergency) => {
      addNotification({
        type: 'emergency',
        title: 'System Emergency',
        message: emergency.message,
        data: emergency,
        priority: 'urgent',
      })
    })

    // Payment events
    socketRef.current.on(SOCKET_EVENTS.PAYMENT_SUCCESS, (payment) => {
      addNotification({
        type: 'success',
        title: 'Payment Successful',
        message: `Payment of $${payment.amount} processed successfully`,
        data: payment,
        priority: 'medium',
      })
    })

    socketRef.current.on(SOCKET_EVENTS.PAYMENT_FAILED, (payment) => {
      addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: `Payment of $${payment.amount} failed`,
        data: payment,
        priority: 'high',
      })
    })

    // Connect to socket
    socketRef.current.connect()
  }, [isAuthenticated, token, isOnline, user, addNotification])

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting from socket server...')
      clearReconnectTimeout()
      clearPingInterval()
      socketRef.current.disconnect()
      socketRef.current = null
      setConnectionState(CONNECTION_STATES.DISCONNECTED)
      connectionStateRef.current = CONNECTION_STATES.DISCONNECTED
    }
  }, [])

  // Attempt to reconnect
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return

    setConnectionState(CONNECTION_STATES.RECONNECTING)
    connectionStateRef.current = CONNECTION_STATES.RECONNECTING

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Exponential backoff, max 30s
    
    console.log(`Attempting to reconnect in ${delay}ms...`)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null
      setReconnectAttempts(prev => prev + 1)
      
      if (reconnectAttempts < 10) { // Max 10 reconnect attempts
        connect()
      } else {
        setConnectionState(CONNECTION_STATES.ERROR)
        connectionStateRef.current = CONNECTION_STATES.ERROR
        toast.error('Maximum reconnect attempts reached')
      }
    }, delay)
  }, [reconnectAttempts, connect])

  // Clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Start ping interval to keep connection alive
  const startPingInterval = useCallback(() => {
    clearPingInterval()
    
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping', { timestamp: Date.now() })
      }
    }, 30000) // Ping every 30 seconds
  }, [])

  // Clear ping interval
  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }, [])

  // Emit socket event
  const emit = useCallback((event, data, callback) => {
    if (socketRef.current?.connected) {
      if (callback) {
        socketRef.current.emit(event, data, callback)
      } else {
        socketRef.current.emit(event, data)
      }
      return true
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
      return false
    }
  }, [])

  // Listen to socket event
  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, handler)
        }
      }
    }
  }, [])

  // Remove socket event listener
  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler)
    }
  }, [])

  // Join room
  const joinRoom = useCallback((room) => {
    return emit('join_room', { room })
  }, [emit])

  // Leave room
  const leaveRoom = useCallback((room) => {
    return emit('leave_room', { room })
  }, [emit])

  // Send typing indicator
  const sendTyping = useCallback((room, isTyping = true) => {
    return emit(isTyping ? 'typing' : 'stop_typing', { room })
  }, [emit])

  // Initialize connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token && isOnline) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, isOnline, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout()
      clearPingInterval()
      disconnect()
    }
  }, [disconnect, clearReconnectTimeout, clearPingInterval])

  const value = {
    // Connection state
    connectionState,
    isConnected: connectionState === CONNECTION_STATES.CONNECTED,
    isConnecting: connectionState === CONNECTION_STATES.CONNECTING,
    isReconnecting: connectionState === CONNECTION_STATES.RECONNECTING,
    isOnline,
    reconnectAttempts,
    lastSeen,
    
    // Socket instance
    socket: socketRef.current,
    
    // Methods
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendTyping,
    
    // Constants
    SOCKET_EVENTS,
    CONNECTION_STATES,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Hook for socket event listeners with automatic cleanup
export const useSocketEvent = (event, handler, dependencies = []) => {
  const { on } = useSocket()
  
  useEffect(() => {
    const cleanup = on(event, handler)
    return cleanup
  }, [event, on, ...dependencies])
}

// Hook for room management
export const useSocketRoom = (room) => {
  const { joinRoom, leaveRoom } = useSocket()
  
  useEffect(() => {
    if (room) {
      joinRoom(room)
      
      return () => {
        leaveRoom(room)
      }
    }
  }, [room, joinRoom, leaveRoom])
}

export default SocketContext
