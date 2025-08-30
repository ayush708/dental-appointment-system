import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import toast from 'react-hot-toast'
import { notificationAPI } from '../services/api'
import { useAuth } from './AuthContext'

// Notification types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  APPOINTMENT: 'appointment',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  CHAT: 'chat',
  PAYMENT: 'payment',
  EMERGENCY: 'emergency',
}

// Notification priority levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

// Initial notification state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  preferences: {
    sound: true,
    desktop: true,
    email: true,
    sms: false,
    types: {
      [NOTIFICATION_TYPES.APPOINTMENT]: true,
      [NOTIFICATION_TYPES.REMINDER]: true,
      [NOTIFICATION_TYPES.SYSTEM]: true,
      [NOTIFICATION_TYPES.CHAT]: true,
      [NOTIFICATION_TYPES.PAYMENT]: true,
      [NOTIFICATION_TYPES.EMERGENCY]: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    frequency: {
      immediate: true,
      digest: false,
      digestTime: '09:00',
    },
  },
  filters: {
    type: 'all',
    priority: 'all',
    read: 'all',
    dateRange: 'all',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
}

// Notification action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_NOTIFICATIONS_SUCCESS: 'LOAD_NOTIFICATIONS_SUCCESS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_AS_UNREAD: 'MARK_AS_UNREAD',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  DELETE_ALL_NOTIFICATIONS: 'DELETE_ALL_NOTIFICATIONS',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
  RESET_NOTIFICATIONS: 'RESET_NOTIFICATIONS',
}

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload.append 
          ? [...state.notifications, ...action.payload.notifications]
          : action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        pagination: {
          ...state.pagination,
          ...action.payload.pagination,
        },
        isLoading: false,
        error: null,
      }

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.read ? state.unreadCount : state.unreadCount + 1,
      }

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
      }

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const removedNotification = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(notification => 
          notification.id !== action.payload
        ),
        unreadCount: removedNotification && !removedNotification.read 
          ? state.unreadCount - 1 
          : state.unreadCount,
      }

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          action.payload.includes(notification.id)
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - action.payload.length),
      }

    case NOTIFICATION_ACTIONS.MARK_AS_UNREAD:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          action.payload.includes(notification.id)
            ? { ...notification, read: false, readAt: null }
            : notification
        ),
        unreadCount: state.unreadCount + action.payload.length,
      }

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const deletedNotification = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(notification => 
          notification.id !== action.payload
        ),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? state.unreadCount - 1 
          : state.unreadCount,
      }

    case NOTIFICATION_ACTIONS.DELETE_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      }

    case NOTIFICATION_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      }

    case NOTIFICATION_ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      }

    case NOTIFICATION_ACTIONS.UPDATE_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      }

    case NOTIFICATION_ACTIONS.RESET_NOTIFICATIONS:
      return initialState

    default:
      return state
  }
}

// Create notification context
const NotificationContext = createContext()

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Sound effects
  const playNotificationSound = useCallback((type, priority) => {
    if (!state.preferences.sound) return

    const audio = new Audio()
    
    // Different sounds for different types and priorities
    switch (priority) {
      case PRIORITY_LEVELS.URGENT:
        audio.src = '/sounds/urgent-notification.mp3'
        break
      case PRIORITY_LEVELS.HIGH:
        audio.src = '/sounds/high-notification.mp3'
        break
      default:
        audio.src = '/sounds/default-notification.mp3'
    }

    audio.volume = 0.5
    audio.play().catch(error => {
      console.log('Could not play notification sound:', error)
    })
  }, [state.preferences.sound])

  // Desktop notification
  const showDesktopNotification = useCallback((notification) => {
    if (!state.preferences.desktop || !('Notification' in window)) return

    // Check permission
    if (Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === PRIORITY_LEVELS.URGENT,
        silent: !state.preferences.sound,
        data: {
          notificationId: notification.id,
          type: notification.type,
          url: notification.actionUrl,
        },
      }

      const desktopNotification = new Notification(notification.title, options)

      // Handle notification click
      desktopNotification.onclick = () => {
        window.focus()
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl
        }
        desktopNotification.close()
        markAsRead([notification.id])
      }

      // Auto close after delay
      setTimeout(() => {
        desktopNotification.close()
      }, notification.priority === PRIORITY_LEVELS.URGENT ? 15000 : 8000)
    }
  }, [state.preferences.desktop, state.preferences.sound])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }, [])

  // Check if in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!state.preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = state.preferences.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = state.preferences.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }, [state.preferences.quietHours])

  // Load notifications from server
  const loadNotifications = useCallback(async (options = {}) => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true })

      const params = {
        page: options.page || state.pagination.page,
        limit: options.limit || state.pagination.limit,
        ...state.filters,
        ...options.filters,
      }

      const response = await notificationAPI.getNotifications(params)
      const { notifications, unreadCount, pagination } = response.data

      dispatch({
        type: NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS_SUCCESS,
        payload: {
          notifications,
          unreadCount,
          pagination,
          append: options.append || false,
        },
      })
    } catch (error) {
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to load notifications',
      })
    }
  }, [isAuthenticated, state.filters, state.pagination])

  // Add new notification
  const addNotification = useCallback((notification) => {
    // Check if notification type is enabled
    if (!state.preferences.types[notification.type]) return

    // Check quiet hours for non-urgent notifications
    if (notification.priority !== PRIORITY_LEVELS.URGENT && isInQuietHours()) return

    // Add to state
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: {
        ...notification,
        id: notification.id || Date.now().toString(),
        createdAt: notification.createdAt || new Date().toISOString(),
        read: false,
      },
    })

    // Show toast notification
    const toastOptions = {
      duration: notification.priority === PRIORITY_LEVELS.URGENT ? 8000 : 4000,
    }

    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toast.success(notification.message, toastOptions)
        break
      case NOTIFICATION_TYPES.ERROR:
        toast.error(notification.message, toastOptions)
        break
      case NOTIFICATION_TYPES.WARNING:
        toast.error(notification.message, toastOptions)
        break
      default:
        toast(notification.message, toastOptions)
    }

    // Play sound
    playNotificationSound(notification.type, notification.priority)

    // Show desktop notification
    showDesktopNotification(notification)
  }, [state.preferences, isInQuietHours, playNotificationSound, showDesktopNotification])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds) => {
    try {
      await notificationAPI.markAsRead(notificationIds)
      
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: notificationIds,
      })
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }, [])

  // Mark notifications as unread
  const markAsUnread = useCallback(async (notificationIds) => {
    try {
      await notificationAPI.markAsUnread(notificationIds)
      
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_UNREAD,
        payload: notificationIds,
      })
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead()
      
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ,
      })
      
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId)
      
      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
        payload: notificationId,
      })
      
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }, [])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationAPI.deleteAllNotifications()
      
      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_ALL_NOTIFICATIONS,
      })
      
      toast.success('All notifications deleted')
    } catch (error) {
      toast.error('Failed to delete all notifications')
    }
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (preferences) => {
    try {
      await notificationAPI.updatePreferences(preferences)
      
      dispatch({
        type: NOTIFICATION_ACTIONS.UPDATE_PREFERENCES,
        payload: preferences,
      })
      
      toast.success('Notification preferences updated')
    } catch (error) {
      toast.error('Failed to update preferences')
    }
  }, [])

  // Update filters
  const updateFilters = useCallback((filters) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_FILTERS,
      payload: filters,
    })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR })
  }, [])

  // Load notifications on mount and auth changes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    } else {
      dispatch({ type: NOTIFICATION_ACTIONS.RESET_NOTIFICATIONS })
    }
  }, [isAuthenticated, loadNotifications])

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  // Filter notifications based on current filters
  const filteredNotifications = state.notifications.filter(notification => {
    if (state.filters.type !== 'all' && notification.type !== state.filters.type) {
      return false
    }
    
    if (state.filters.priority !== 'all' && notification.priority !== state.filters.priority) {
      return false
    }
    
    if (state.filters.read === 'read' && !notification.read) {
      return false
    }
    
    if (state.filters.read === 'unread' && notification.read) {
      return false
    }
    
    if (state.filters.dateRange !== 'all') {
      const now = new Date()
      const notificationDate = new Date(notification.createdAt)
      
      switch (state.filters.dateRange) {
        case 'today':
          if (notificationDate.toDateString() !== now.toDateString()) {
            return false
          }
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (notificationDate < weekAgo) {
            return false
          }
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (notificationDate < monthAgo) {
            return false
          }
          break
      }
    }
    
    return true
  })

  const value = {
    // State
    ...state,
    filteredNotifications,
    
    // Constants
    NOTIFICATION_TYPES,
    PRIORITY_LEVELS,
    
    // Actions
    loadNotifications,
    addNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updatePreferences,
    updateFilters,
    clearError,
    requestNotificationPermission,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook for toast notifications
export const useToast = () => {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    warning: (message, options) => toast.error(message, options),
    info: (message, options) => toast(message, options),
    loading: (message, options) => toast.loading(message, options),
    dismiss: (toastId) => toast.dismiss(toastId),
    promise: (promise, options) => toast.promise(promise, options),
  }
}

export default NotificationContext
