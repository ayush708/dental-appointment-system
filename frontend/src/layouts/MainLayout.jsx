import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Outlet, useLocation } from 'react-router-dom'

// Components
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import NotificationToast from '../components/notifications/NotificationToast'
import BackToTop from '../components/ui/BackToTop'
import CookieConsent from '../components/ui/CookieConsent'

// Contexts
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'

const MainLayout = ({ children }) => {
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const { isAuthenticated } = useAuth()
  const { notifications } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Body class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${
      isDarkMode ? 'dark' : ''
    }`}>
      <Helmet>
        <title>DentalCare - Professional Dental Services</title>
        <meta name="description" content="Professional dental care services with modern facilities and experienced doctors" />
      </Helmet>

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            
            {/* Sidebar */}
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-screen">
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
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Elements */}
      <BackToTop />
      
      {/* Cookie Consent */}
      <CookieConsent />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
          />
        ))}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden" />
    </div>
  )
}

export default MainLayout
