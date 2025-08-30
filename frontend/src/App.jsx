import { AnimatePresence, motion } from 'framer-motion'
import React, { Suspense, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

// Context hooks
import { useAuth } from './contexts/AuthContext'
import { useNotifications } from './contexts/NotificationContext'
import { useTheme } from './contexts/ThemeContext'

// Layout components
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'
import DoctorLayout from './layouts/DoctorLayout'
import MainLayout from './layouts/MainLayout'

// Loading components
import PageLoader from './components/ui/PageLoader'

// Error components
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import Unauthorized from './pages/Unauthorized'

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'))
const ContactPage = React.lazy(() => import('./pages/ContactPage'))

// Auth pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = React.lazy(() => import('./pages/auth/VerifyEmailPage'))
const TwoFactorPage = React.lazy(() => import('./pages/auth/TwoFactorPage'))

// Patient dashboard pages
const PatientDashboard = React.lazy(() => import('./pages/patient/Dashboard'))
const PatientProfile = React.lazy(() => import('./pages/patient/Profile'))
const PatientAppointments = React.lazy(() => import('./pages/patient/Appointments'))
const BookAppointment = React.lazy(() => import('./pages/patient/BookAppointment'))
const PatientMedicalHistory = React.lazy(() => import('./pages/patient/MedicalHistory'))
const PatientDocuments = React.lazy(() => import('./pages/patient/Documents'))
const PatientPayments = React.lazy(() => import('./pages/patient/Payments'))
const PatientMessages = React.lazy(() => import('./pages/patient/Messages'))
const PatientSettings = React.lazy(() => import('./pages/patient/Settings'))

// Doctor dashboard pages
const DoctorDashboard = React.lazy(() => import('./pages/doctor/Dashboard'))
const DoctorProfile = React.lazy(() => import('./pages/doctor/Profile'))
const DoctorAppointments = React.lazy(() => import('./pages/doctor/Appointments'))
const DoctorPatients = React.lazy(() => import('./pages/doctor/Patients'))
const DoctorSchedule = React.lazy(() => import('./pages/doctor/Schedule'))
const DoctorTreatments = React.lazy(() => import('./pages/doctor/Treatments'))
const DoctorReports = React.lazy(() => import('./pages/doctor/Reports'))
const DoctorMessages = React.lazy(() => import('./pages/doctor/Messages'))
const DoctorSettings = React.lazy(() => import('./pages/doctor/Settings'))

// Admin dashboard pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = React.lazy(() => import('./pages/admin/Users'))
const AdminPatients = React.lazy(() => import('./pages/admin/Patients'))
const AdminDoctors = React.lazy(() => import('./pages/admin/Doctors'))
const AdminAppointments = React.lazy(() => import('./pages/admin/Appointments'))
const AdminTreatments = React.lazy(() => import('./pages/admin/Treatments'))
const AdminClinics = React.lazy(() => import('./pages/admin/Clinics'))
const AdminPayments = React.lazy(() => import('./pages/admin/Payments'))
const AdminReports = React.lazy(() => import('./pages/admin/Reports'))
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'))
const AdminAnalytics = React.lazy(() => import('./pages/admin/Analytics'))

// Chat and video pages
const ChatPage = React.lazy(() => import('./pages/ChatPage'))
const VideoCallPage = React.lazy(() => import('./pages/VideoCallPage'))

// Shared pages
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))
const HelpPage = React.lazy(() => import('./pages/HelpPage'))
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'))
const TermsPage = React.lazy(() => import('./pages/TermsPage'))

// Protected route component
const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { isAuthenticated, isLoading, user, hasAllPermissions } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check permission-based access
  if (permissions.length > 0 && !hasAllPermissions(permissions)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Public route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user?.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

// Page transition animations
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

// Animated route wrapper
const AnimatedRoute = ({ children }) => {
  const location = useLocation()

  return (
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
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Suspense wrapper with loading
const SuspenseWrapper = ({ children, fallback = <PageLoader /> }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Main App component
const App = () => {
  const { user, isAuthenticated } = useAuth()
  const { effectiveTheme } = useTheme()
  const { requestNotificationPermission } = useNotifications()
  const location = useLocation()

  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  // Update document class for theme
  useEffect(() => {
    const root = document.documentElement
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [effectiveTheme])

  // Page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    const appName = 'DentalCare Pro'

    const titleMap = {
      '/': `${appName} - Advanced Dental Management System`,
      '/about': `About Us - ${appName}`,
      '/services': `Our Services - ${appName}`,
      '/contact': `Contact Us - ${appName}`,
      '/login': `Login - ${appName}`,
      '/register': `Register - ${appName}`,
      '/forgot-password': `Forgot Password - ${appName}`,
      '/reset-password': `Reset Password - ${appName}`,
      '/verify-email': `Verify Email - ${appName}`,
      '/dashboard': `Dashboard - ${appName}`,
      '/admin/dashboard': `Admin Dashboard - ${appName}`,
      '/doctor/dashboard': `Doctor Dashboard - ${appName}`,
      '/profile': `Profile - ${appName}`,
      '/appointments': `Appointments - ${appName}`,
      '/messages': `Messages - ${appName}`,
      '/settings': `Settings - ${appName}`,
      '/help': `Help - ${appName}`,
      '/notifications': `Notifications - ${appName}`,
      '/unauthorized': `Unauthorized - ${appName}`,
      '/not-found': `Page Not Found - ${appName}`,
      '/server-error': `Server Error - ${appName}`,
    }

    return titleMap[path] || `${appName} - Advanced Dental Management System`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content="Advanced dental appointment management system with modern features" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content={effectiveTheme === 'dark' ? '#1e293b' : '#3b82f6'} />
      </Helmet>

      <AnimatedRoute>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <MainLayout>
              <SuspenseWrapper>
                <HomePage />
              </SuspenseWrapper>
            </MainLayout>
          } />
          
          <Route path="/about" element={
            <MainLayout>
              <SuspenseWrapper>
                <AboutPage />
              </SuspenseWrapper>
            </MainLayout>
          } />
          
          <Route path="/services" element={
            <MainLayout>
              <SuspenseWrapper>
                <ServicesPage />
              </SuspenseWrapper>
            </MainLayout>
          } />
          
          <Route path="/contact" element={
            <MainLayout>
              <SuspenseWrapper>
                <ContactPage />
              </SuspenseWrapper>
            </MainLayout>
          } />

          {/* Auth routes */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout>
                <SuspenseWrapper>
                  <LoginPage />
                </SuspenseWrapper>
              </AuthLayout>
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <AuthLayout>
                <SuspenseWrapper>
                  <RegisterPage />
                </SuspenseWrapper>
              </AuthLayout>
            </PublicRoute>
          } />
          
          <Route path="/forgot-password" element={
            <PublicRoute>
              <AuthLayout>
                <SuspenseWrapper>
                  <ForgotPasswordPage />
                </SuspenseWrapper>
              </AuthLayout>
            </PublicRoute>
          } />
          
          <Route path="/reset-password" element={
            <PublicRoute>
              <AuthLayout>
                <SuspenseWrapper>
                  <ResetPasswordPage />
                </SuspenseWrapper>
              </AuthLayout>
            </PublicRoute>
          } />
          
          <Route path="/verify-email" element={
            <AuthLayout>
              <SuspenseWrapper>
                <VerifyEmailPage />
              </SuspenseWrapper>
            </AuthLayout>
          } />
          
          <Route path="/2fa" element={
            <AuthLayout>
              <SuspenseWrapper>
                <TwoFactorPage />
              </SuspenseWrapper>
            </AuthLayout>
          } />

          {/* Patient dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['patient', 'admin']}>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientDashboard />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientProfile />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/appointments" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientAppointments />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/book-appointment" element={
            <ProtectedRoute roles={['patient']}>
              <MainLayout>
                <SuspenseWrapper>
                  <BookAppointment />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/medical-history" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientMedicalHistory />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/documents" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientDocuments />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientPayments />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Doctor dashboard routes */}
          <Route path="/doctor/*" element={
            <ProtectedRoute roles={['doctor', 'admin']}>
              <DoctorLayout>
                <Routes>
                  <Route path="dashboard" element={
                    <SuspenseWrapper>
                      <DoctorDashboard />
                    </SuspenseWrapper>
                  } />
                  <Route path="profile" element={
                    <SuspenseWrapper>
                      <DoctorProfile />
                    </SuspenseWrapper>
                  } />
                  <Route path="appointments" element={
                    <SuspenseWrapper>
                      <DoctorAppointments />
                    </SuspenseWrapper>
                  } />
                  <Route path="patients" element={
                    <SuspenseWrapper>
                      <DoctorPatients />
                    </SuspenseWrapper>
                  } />
                  <Route path="schedule" element={
                    <SuspenseWrapper>
                      <DoctorSchedule />
                    </SuspenseWrapper>
                  } />
                  <Route path="treatments" element={
                    <SuspenseWrapper>
                      <DoctorTreatments />
                    </SuspenseWrapper>
                  } />
                  <Route path="reports" element={
                    <SuspenseWrapper>
                      <DoctorReports />
                    </SuspenseWrapper>
                  } />
                  <Route path="messages" element={
                    <SuspenseWrapper>
                      <DoctorMessages />
                    </SuspenseWrapper>
                  } />
                  <Route path="settings" element={
                    <SuspenseWrapper>
                      <DoctorSettings />
                    </SuspenseWrapper>
                  } />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DoctorLayout>
            </ProtectedRoute>
          } />

          {/* Admin dashboard routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={
                    <SuspenseWrapper>
                      <AdminDashboard />
                    </SuspenseWrapper>
                  } />
                  <Route path="users" element={
                    <SuspenseWrapper>
                      <AdminUsers />
                    </SuspenseWrapper>
                  } />
                  <Route path="patients" element={
                    <SuspenseWrapper>
                      <AdminPatients />
                    </SuspenseWrapper>
                  } />
                  <Route path="doctors" element={
                    <SuspenseWrapper>
                      <AdminDoctors />
                    </SuspenseWrapper>
                  } />
                  <Route path="appointments" element={
                    <SuspenseWrapper>
                      <AdminAppointments />
                    </SuspenseWrapper>
                  } />
                  <Route path="treatments" element={
                    <SuspenseWrapper>
                      <AdminTreatments />
                    </SuspenseWrapper>
                  } />
                  <Route path="clinics" element={
                    <SuspenseWrapper>
                      <AdminClinics />
                    </SuspenseWrapper>
                  } />
                  <Route path="payments" element={
                    <SuspenseWrapper>
                      <AdminPayments />
                    </SuspenseWrapper>
                  } />
                  <Route path="reports" element={
                    <SuspenseWrapper>
                      <AdminReports />
                    </SuspenseWrapper>
                  } />
                  <Route path="analytics" element={
                    <SuspenseWrapper>
                      <AdminAnalytics />
                    </SuspenseWrapper>
                  } />
                  <Route path="settings" element={
                    <SuspenseWrapper>
                      <AdminSettings />
                    </SuspenseWrapper>
                  } />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Shared protected routes */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientMessages />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <ChatPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          
          <Route path="/video-call" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <VideoCallPage />
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <NotificationsPage />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <PatientSettings />
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Static pages */}
          <Route path="/help" element={
            <MainLayout>
              <SuspenseWrapper>
                <HelpPage />
              </SuspenseWrapper>
            </MainLayout>
          } />
          
          <Route path="/privacy" element={
            <MainLayout>
              <SuspenseWrapper>
                <PrivacyPage />
              </SuspenseWrapper>
            </MainLayout>
          } />
          
          <Route path="/terms" element={
            <MainLayout>
              <SuspenseWrapper>
                <TermsPage />
              </SuspenseWrapper>
            </MainLayout>
          } />

          {/* Error routes */}
          <Route path="/unauthorized" element={
            <SuspenseWrapper>
              <Unauthorized />
            </SuspenseWrapper>
          } />
          
          <Route path="/server-error" element={
            <SuspenseWrapper>
              <ServerError />
            </SuspenseWrapper>
          } />
          
          <Route path="/not-found" element={
            <SuspenseWrapper>
              <NotFound />
            </SuspenseWrapper>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </AnimatedRoute>
    </div>
  )
}

export default App
