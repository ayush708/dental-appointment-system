import { createContext, useContext, useEffect, useReducer } from 'react'
import { useAuth } from './AuthContext'

// Theme types
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Color schemes
const COLOR_SCHEMES = {
  DEFAULT: 'default',
  MEDICAL: 'medical',
  OCEAN: 'ocean',
  FOREST: 'forest',
  SUNSET: 'sunset',
  MINIMAL: 'minimal',
}

// Font sizes
const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
}

// Initial theme state
const initialState = {
  theme: THEMES.SYSTEM,
  colorScheme: COLOR_SCHEMES.DEFAULT,
  fontSize: FONT_SIZES.MEDIUM,
  reducedMotion: false,
  highContrast: false,
  compactMode: false,
  sidebarCollapsed: false,
  systemTheme: 'light',
  effectiveTheme: 'light',
}

// Theme action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_COLOR_SCHEME: 'SET_COLOR_SCHEME',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  TOGGLE_REDUCED_MOTION: 'TOGGLE_REDUCED_MOTION',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  TOGGLE_COMPACT_MODE: 'TOGGLE_COMPACT_MODE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  UPDATE_SYSTEM_THEME: 'UPDATE_SYSTEM_THEME',
  UPDATE_EFFECTIVE_THEME: 'UPDATE_EFFECTIVE_THEME',
  RESET_THEME: 'RESET_THEME',
  IMPORT_PREFERENCES: 'IMPORT_PREFERENCES',
}

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      }

    case THEME_ACTIONS.SET_COLOR_SCHEME:
      return {
        ...state,
        colorScheme: action.payload,
      }

    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      }

    case THEME_ACTIONS.TOGGLE_REDUCED_MOTION:
      return {
        ...state,
        reducedMotion: !state.reducedMotion,
      }

    case THEME_ACTIONS.TOGGLE_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: !state.highContrast,
      }

    case THEME_ACTIONS.TOGGLE_COMPACT_MODE:
      return {
        ...state,
        compactMode: !state.compactMode,
      }

    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      }

    case THEME_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload,
      }

    case THEME_ACTIONS.UPDATE_SYSTEM_THEME:
      return {
        ...state,
        systemTheme: action.payload,
      }

    case THEME_ACTIONS.UPDATE_EFFECTIVE_THEME:
      return {
        ...state,
        effectiveTheme: action.payload,
      }

    case THEME_ACTIONS.RESET_THEME:
      return {
        ...initialState,
        systemTheme: state.systemTheme,
        effectiveTheme: state.systemTheme,
      }

    case THEME_ACTIONS.IMPORT_PREFERENCES:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}

// Create theme context
const ThemeContext = createContext()

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState)
  const { preferences, updatePreferences } = useAuth()

  // Media query for system theme preference
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')

  // Initialize theme from user preferences or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('dental_theme')
    const savedColorScheme = localStorage.getItem('dental_color_scheme')
    const savedFontSize = localStorage.getItem('dental_font_size')
    const savedReducedMotion = localStorage.getItem('dental_reduced_motion')
    const savedHighContrast = localStorage.getItem('dental_high_contrast')
    const savedCompactMode = localStorage.getItem('dental_compact_mode')
    const savedSidebarCollapsed = localStorage.getItem('dental_sidebar_collapsed')

    // Update system theme
    const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light'
    dispatch({
      type: THEME_ACTIONS.UPDATE_SYSTEM_THEME,
      payload: systemTheme,
    })

    // Import preferences from auth context if available
    if (preferences?.theme) {
      dispatch({
        type: THEME_ACTIONS.IMPORT_PREFERENCES,
        payload: {
          theme: preferences.theme || THEMES.SYSTEM,
          colorScheme: preferences.colorScheme || COLOR_SCHEMES.DEFAULT,
          fontSize: preferences.fontSize || FONT_SIZES.MEDIUM,
          reducedMotion: preferences.reducedMotion || false,
          highContrast: preferences.highContrast || false,
          compactMode: preferences.compactMode || false,
          sidebarCollapsed: preferences.sidebarCollapsed || false,
        },
      })
    } else {
      // Use localStorage values if no user preferences
      dispatch({
        type: THEME_ACTIONS.IMPORT_PREFERENCES,
        payload: {
          theme: savedTheme || THEMES.SYSTEM,
          colorScheme: savedColorScheme || COLOR_SCHEMES.DEFAULT,
          fontSize: savedFontSize || FONT_SIZES.MEDIUM,
          reducedMotion: savedReducedMotion === 'true' || prefersReducedMotion.matches,
          highContrast: savedHighContrast === 'true' || prefersHighContrast.matches,
          compactMode: savedCompactMode === 'true',
          sidebarCollapsed: savedSidebarCollapsed === 'true',
        },
      })
    }
  }, [preferences])

  // Listen for system theme changes
  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      const systemTheme = e.matches ? 'dark' : 'light'
      dispatch({
        type: THEME_ACTIONS.UPDATE_SYSTEM_THEME,
        payload: systemTheme,
      })
    }

    const handleReducedMotionChange = (e) => {
      if (state.theme === THEMES.SYSTEM) {
        dispatch({
          type: THEME_ACTIONS.TOGGLE_REDUCED_MOTION,
        })
      }
    }

    const handleHighContrastChange = (e) => {
      if (state.theme === THEMES.SYSTEM) {
        dispatch({
          type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST,
        })
      }
    }

    prefersDarkScheme.addEventListener('change', handleSystemThemeChange)
    prefersReducedMotion.addEventListener('change', handleReducedMotionChange)
    prefersHighContrast.addEventListener('change', handleHighContrastChange)

    return () => {
      prefersDarkScheme.removeEventListener('change', handleSystemThemeChange)
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange)
      prefersHighContrast.removeEventListener('change', handleHighContrastChange)
    }
  }, [state.theme])

  // Update effective theme when theme or system theme changes
  useEffect(() => {
    let effectiveTheme
    if (state.theme === THEMES.SYSTEM) {
      effectiveTheme = state.systemTheme
    } else {
      effectiveTheme = state.theme
    }

    dispatch({
      type: THEME_ACTIONS.UPDATE_EFFECTIVE_THEME,
      payload: effectiveTheme,
    })
  }, [state.theme, state.systemTheme])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Apply theme class
    if (state.effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply color scheme
    root.setAttribute('data-color-scheme', state.colorScheme)

    // Apply font size
    root.setAttribute('data-font-size', state.fontSize)

    // Apply accessibility preferences
    if (state.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    if (state.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (state.compactMode) {
      body.classList.add('compact-mode')
    } else {
      body.classList.remove('compact-mode')
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        state.effectiveTheme === 'dark' ? '#1e293b' : '#3b82f6'
      )
    }
  }, [state])

  // Save preferences to localStorage and user preferences
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('dental_theme', state.theme)
    localStorage.setItem('dental_color_scheme', state.colorScheme)
    localStorage.setItem('dental_font_size', state.fontSize)
    localStorage.setItem('dental_reduced_motion', state.reducedMotion.toString())
    localStorage.setItem('dental_high_contrast', state.highContrast.toString())
    localStorage.setItem('dental_compact_mode', state.compactMode.toString())
    localStorage.setItem('dental_sidebar_collapsed', state.sidebarCollapsed.toString())

    // Update user preferences if authenticated
    if (updatePreferences) {
      updatePreferences({
        theme: state.theme,
        colorScheme: state.colorScheme,
        fontSize: state.fontSize,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        compactMode: state.compactMode,
        sidebarCollapsed: state.sidebarCollapsed,
      })
    }
  }, [state, updatePreferences])

  // Theme actions
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: theme,
      })
    }
  }

  const setColorScheme = (colorScheme) => {
    if (Object.values(COLOR_SCHEMES).includes(colorScheme)) {
      dispatch({
        type: THEME_ACTIONS.SET_COLOR_SCHEME,
        payload: colorScheme,
      })
    }
  }

  const setFontSize = (fontSize) => {
    if (Object.values(FONT_SIZES).includes(fontSize)) {
      dispatch({
        type: THEME_ACTIONS.SET_FONT_SIZE,
        payload: fontSize,
      })
    }
  }

  const toggleTheme = () => {
    if (state.theme === THEMES.LIGHT) {
      setTheme(THEMES.DARK)
    } else if (state.theme === THEMES.DARK) {
      setTheme(THEMES.LIGHT)
    } else {
      // If system, toggle to opposite of current system theme
      setTheme(state.systemTheme === 'light' ? THEMES.DARK : THEMES.LIGHT)
    }
  }

  const toggleReducedMotion = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_REDUCED_MOTION })
  }

  const toggleHighContrast = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST })
  }

  const toggleCompactMode = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_COMPACT_MODE })
  }

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR })
  }

  const setSidebarCollapsed = (collapsed) => {
    dispatch({
      type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED,
      payload: collapsed,
    })
  }

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME })
  }

  // Utility functions
  const isDarkMode = state.effectiveTheme === 'dark'
  const isLightMode = state.effectiveTheme === 'light'
  const isSystemTheme = state.theme === THEMES.SYSTEM

  // Get theme configuration for components
  const getThemeConfig = () => ({
    theme: state.effectiveTheme,
    colorScheme: state.colorScheme,
    fontSize: state.fontSize,
    reducedMotion: state.reducedMotion,
    highContrast: state.highContrast,
    compactMode: state.compactMode,
    sidebarCollapsed: state.sidebarCollapsed,
  })

  // Get CSS custom properties
  const getCSSCustomProperties = () => {
    const properties = {}

    // Font size scaling
    switch (state.fontSize) {
      case FONT_SIZES.SMALL:
        properties['--font-scale'] = '0.875'
        break
      case FONT_SIZES.LARGE:
        properties['--font-scale'] = '1.125'
        break
      case FONT_SIZES.EXTRA_LARGE:
        properties['--font-scale'] = '1.25'
        break
      default:
        properties['--font-scale'] = '1'
    }

    // Animation duration
    if (state.reducedMotion) {
      properties['--animation-duration'] = '0.01ms'
      properties['--transition-duration'] = '0.01ms'
    } else {
      properties['--animation-duration'] = '300ms'
      properties['--transition-duration'] = '200ms'
    }

    // Spacing scale for compact mode
    if (state.compactMode) {
      properties['--spacing-scale'] = '0.75'
    } else {
      properties['--spacing-scale'] = '1'
    }

    return properties
  }

  // Apply CSS custom properties
  useEffect(() => {
    const properties = getCSSCustomProperties()
    const root = document.documentElement

    Object.entries(properties).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }, [state.fontSize, state.reducedMotion, state.compactMode])

  const value = {
    // State
    ...state,
    
    // Constants
    THEMES,
    COLOR_SCHEMES,
    FONT_SIZES,
    
    // Actions
    setTheme,
    setColorScheme,
    setFontSize,
    toggleTheme,
    toggleReducedMotion,
    toggleHighContrast,
    toggleCompactMode,
    toggleSidebar,
    setSidebarCollapsed,
    resetTheme,
    
    // Utilities
    isDarkMode,
    isLightMode,
    isSystemTheme,
    getThemeConfig,
    getCSSCustomProperties,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Higher-order component for theme-aware components
export const withTheme = (Component) => {
  return function ThemedComponent(props) {
    const theme = useTheme()
    return <Component {...props} theme={theme} />
  }
}

export default ThemeContext
