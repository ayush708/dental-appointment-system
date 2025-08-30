import { createContext, useContext, useEffect, useReducer } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { socketService } from '../services/socketService'

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointments: true,
      reminders: true,
      marketing: false,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
}

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
  VERIFY_EMAIL_SUCCESS: 'VERIFY_EMAIL_SUCCESS',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  ENABLE_2FA_SUCCESS: 'ENABLE_2FA_SUCCESS',
  DISABLE_2FA_SUCCESS: 'DISABLE_2FA_SUCCESS',
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user?.permissions || [],
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        preferences: state.preferences,
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || state.user,
        isAuthenticated: true,
        error: null,
      }

    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...initialState,
        isLoading: false,
        preferences: state.preferences,
      }

    case AUTH_ACTIONS.UPDATE_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      }

    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          emailVerified: true,
          emailVerifiedAt: action.payload.verifiedAt,
        },
      }

    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          passwordChangedAt: action.payload.changedAt,
        },
        error: null,
      }

    case AUTH_ACTIONS.ENABLE_2FA_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          twoFactorEnabled: true,
          twoFactorBackupCodes: action.payload.backupCodes,
        },
      }

    case AUTH_ACTIONS.DISABLE_2FA_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          twoFactorEnabled: false,
          twoFactorBackupCodes: null,
        },
      }

    default:
      return state
  }
}

// Create auth context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('dental_token')
        const userData = localStorage.getItem('dental_user')
        const preferences = localStorage.getItem('dental_preferences')

        if (preferences) {
          dispatch({
            type: AUTH_ACTIONS.UPDATE_PREFERENCES,
            payload: JSON.parse(preferences),
          })
        }

        if (token && userData) {
          const user = JSON.parse(userData)
          
          // Verify token is still valid
          try {
            const response = await authAPI.verifyToken()
            if (response.data.valid) {
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user, token },
              })
              
              // Initialize socket connection
              socketService.connect(token)
            } else {
              // Token is invalid, try to refresh
              await refreshToken()
            }
          } catch (error) {
            // Token verification failed, try to refresh
            await refreshToken()
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Save token and user data to localStorage
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem('dental_token', state.token)
      localStorage.setItem('dental_user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('dental_token')
      localStorage.removeItem('dental_user')
    }
  }, [state.token, state.user])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('dental_preferences', JSON.stringify(state.preferences))
  }, [state.preferences])

  // Login function
  const login = async (credentials, rememberMe = false) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await authAPI.login(credentials)
      const { user, token, refreshToken } = response.data

      if (rememberMe && refreshToken) {
        localStorage.setItem('dental_refresh_token', refreshToken)
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      })

      // Initialize socket connection
      socketService.connect(token)

      toast.success(`Welcome back, ${user.firstName}!`)
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard')
      } else {
        navigate('/dashboard')
      }

      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })

      const response = await authAPI.register(userData)
      const { user, token, message } = response.data

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      })

      // Initialize socket connection
      socketService.connect(token)

      toast.success(message || 'Registration successful!')
      navigate('/dashboard')

      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: message,
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      localStorage.removeItem('dental_refresh_token')
      socketService.disconnect()
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('dental_refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refreshToken)
      const { user, token } = response.data

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: { user, token },
      })

      return { success: true, token }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE })
      localStorage.removeItem('dental_refresh_token')
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const { user } = response.data

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: user,
      })

      toast.success('Profile updated successfully')
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Update preferences
  const updatePreferences = (preferences) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PREFERENCES,
      payload: preferences,
    })
  }

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token)
      const { message, verifiedAt } = response.data

      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
        payload: { verifiedAt },
      })

      toast.success(message || 'Email verified successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      const { message } = response.data

      toast.success(message || 'Password reset email sent')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password)
      const { message } = response.data

      dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS })

      toast.success(message || 'Password reset successful')
      navigate('/login')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword)
      const { message, changedAt } = response.data

      dispatch({
        type: AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS,
        payload: { changedAt },
      })

      toast.success(message || 'Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Enable 2FA
  const enable2FA = async () => {
    try {
      const response = await authAPI.enable2FA()
      const { qrCode, backupCodes } = response.data

      dispatch({
        type: AUTH_ACTIONS.ENABLE_2FA_SUCCESS,
        payload: { backupCodes },
      })

      return { success: true, qrCode, backupCodes }
    } catch (error) {
      const message = error.response?.data?.message || '2FA setup failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Disable 2FA
  const disable2FA = async (password) => {
    try {
      const response = await authAPI.disable2FA(password)
      const { message } = response.data

      dispatch({ type: AUTH_ACTIONS.DISABLE_2FA_SUCCESS })

      toast.success(message || '2FA disabled successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || '2FA disable failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Check permissions
  const hasPermission = (permission) => {
    if (!state.user || !state.permissions) return false
    if (state.user.role === 'admin') return true
    return state.permissions.includes(permission)
  }

  // Check multiple permissions (AND logic)
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false
    return permissions.every(permission => hasPermission(permission))
  }

  // Check multiple permissions (OR logic)
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false
    return permissions.some(permission => hasPermission(permission))
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    updatePreferences,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    enable2FA,
    disable2FA,
    clearError,
    
    // Utility functions
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export const withAuth = (Component, requiredPermissions = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, hasAllPermissions } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          navigate('/login')
          return
        }

        if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
          navigate('/unauthorized')
          return
        }
      }
    }, [isAuthenticated, isLoading, navigate, hasAllPermissions])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
      return null
    }

    return <Component {...props} />
  }
}

export default AuthContext
