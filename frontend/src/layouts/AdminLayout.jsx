import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Icons
import {
    CalendarIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    CogIcon,
    CurrencyDollarIcon,
    HomeIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

// Components
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import QuickActions from '../components/admin/QuickActions'
import NotificationPanel from '../components/notifications/NotificationPanel'

// Contexts
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { isDarkMode } = useTheme()
  const { notifications, unreadCount } = useNotifications()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Check if user has admin role
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  // Close panels when route changes
  useEffect(() => {
    setSidebarOpen(false)
    setNotificationPanelOpen(false)
  }, [location.pathname])

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      current: location.pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: location.pathname.startsWith('/admin/users')
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: CalendarIcon,
      current: location.pathname.startsWith('/admin/appointments'),
      badge: '12'
    },
    {
      name: 'Treatments',
      href: '/admin/treatments',
      icon: ClipboardDocumentListIcon,
      current: location.pathname.startsWith('/admin/treatments')
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: CurrencyDollarIcon,
      current: location.pathname.startsWith('/admin/payments')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: location.pathname.startsWith('/admin/analytics')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      current: location.pathname.startsWith('/admin/settings')
    }
  ]

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Helmet>
        <title>Admin Dashboard - DentalCare</title>
        <meta name="description" content="Admin dashboard for managing dental clinic operations" />
      </Helmet>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <AdminSidebar 
            navigationItems={navigationItems}
            user={user}
          />
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 flex z-40 lg:hidden"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </motion.div>
            
            {/* Mobile sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 z-50 lg:hidden"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <AdminSidebar 
                navigationItems={navigationItems}
                user={user}
                mobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Top header */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationPanelOpen(true)}
          unreadCount={unreadCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Page Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="mt-6"
                >
                  {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationPanelOpen && (
          <NotificationPanel
            isOpen={notificationPanelOpen}
            onClose={() => setNotificationPanelOpen(false)}
            notifications={notifications}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminLayout
