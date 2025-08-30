import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Components
import AuthFooter from '../components/auth/AuthFooter'
import AuthHeader from '../components/auth/AuthHeader'
import BackgroundPattern from '../components/ui/BackgroundPattern'

// Contexts
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const AuthLayout = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()
  const { isDarkMode } = useTheme()

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  // Body class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('login')) return 'Login'
    if (path.includes('register')) return 'Register'
    if (path.includes('forgot-password')) return 'Forgot Password'
    if (path.includes('reset-password')) return 'Reset Password'
    if (path.includes('verify-email')) return 'Verify Email'
    if (path.includes('two-factor')) return 'Two Factor Authentication'
    return 'Authentication'
  }

  const getPageDescription = () => {
    const path = location.pathname
    if (path.includes('login')) return 'Sign in to your DentalCare account'
    if (path.includes('register')) return 'Create a new DentalCare account'
    if (path.includes('forgot-password')) return 'Reset your DentalCare password'
    if (path.includes('reset-password')) return 'Set a new password for your account'
    if (path.includes('verify-email')) return 'Verify your email address'
    if (path.includes('two-factor')) return 'Complete two-factor authentication'
    return 'Secure authentication for DentalCare'
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 ${
      isDarkMode ? 'dark' : ''
    }`}>
      <Helmet>
        <title>{getPageTitle()} - DentalCare</title>
        <meta name="description" content={getPageDescription()} />
      </Helmet>

      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Header */}
      <AuthHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full"
            >
              {/* Auth Card */}
              <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                {children || <Outlet />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />

      {/* Floating Elements */}
      <div className="fixed top-4 right-4 z-50">
        {/* Language Selector or Theme Toggle can go here */}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      )}

      {/* Additional Security Indicators */}
      <div className="fixed bottom-4 left-4 z-10">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure Connection</span>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
