import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dental_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Add response time
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date()
      response.config.metadata.duration = 
        response.config.metadata.endTime - response.config.metadata.startTime
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }
    
    const { status, data } = error.response
    
    // Handle 401 unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('dental_refresh_token')
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken)
          const { token } = response.data
          
          localStorage.setItem('dental_token', token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('dental_token')
          localStorage.removeItem('dental_refresh_token')
          localStorage.removeItem('dental_user')
          
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('dental_token')
        localStorage.removeItem('dental_user')
        
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    
    // Handle 403 forbidden
    if (status === 403) {
      toast.error('Access denied. You don\'t have permission to perform this action.')
    }
    
    // Handle 404 not found
    if (status === 404) {
      toast.error('Resource not found.')
    }
    
    // Handle 422 validation errors
    if (status === 422 && data.errors) {
      const errorMessages = Object.values(data.errors).flat()
      errorMessages.forEach(message => toast.error(message))
    }
    
    // Handle 429 rate limiting
    if (status === 429) {
      toast.error('Too many requests. Please try again later.')
    }
    
    // Handle 500 server errors
    if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  verifyToken: () => api.get('/auth/verify'),
  
  // Password management
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  // Email verification
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  
  // Two-factor authentication
  enable2FA: () => api.post('/auth/2fa/enable'),
  disable2FA: (password) => api.post('/auth/2fa/disable', { password }),
  verify2FA: (token) => api.post('/auth/2fa/verify', { token }),
  generate2FABackupCodes: () => api.post('/auth/2fa/backup-codes'),
  
  // Profile management
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteAccount: (password) => api.delete('/auth/account', { data: { password } }),
}

// User API
export const userAPI = {
  // User management
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // User roles and permissions
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateUserPermissions: (id, permissions) => api.put(`/users/${id}/permissions`, { permissions }),
  getUserPermissions: (id) => api.get(`/users/${id}/permissions`),
  
  // User activities
  getUserActivity: (id, params) => api.get(`/users/${id}/activity`, { params }),
  getUserStats: (id) => api.get(`/users/${id}/stats`),
  
  // Bulk operations
  bulkUpdateUsers: (userData) => api.put('/users/bulk', userData),
  bulkDeleteUsers: (userIds) => api.delete('/users/bulk', { data: { userIds } }),
  exportUsers: (params) => api.get('/users/export', { params, responseType: 'blob' }),
  importUsers: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// Patient API
export const patientAPI = {
  // Patient management
  getPatients: (params) => api.get('/patients', { params }),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (patientData) => api.post('/patients', patientData),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  
  // Patient medical records
  getPatientMedicalHistory: (id) => api.get(`/patients/${id}/medical-history`),
  updatePatientMedicalHistory: (id, historyData) => api.put(`/patients/${id}/medical-history`, historyData),
  addPatientMedicalRecord: (id, recordData) => api.post(`/patients/${id}/medical-records`, recordData),
  updatePatientMedicalRecord: (id, recordId, recordData) => 
    api.put(`/patients/${id}/medical-records/${recordId}`, recordData),
  deletePatientMedicalRecord: (id, recordId) => api.delete(`/patients/${id}/medical-records/${recordId}`),
  
  // Patient documents
  getPatientDocuments: (id) => api.get(`/patients/${id}/documents`),
  uploadPatientDocument: (id, file, documentType) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', documentType)
    return api.post(`/patients/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deletePatientDocument: (id, documentId) => api.delete(`/patients/${id}/documents/${documentId}`),
  
  // Patient insurance
  getPatientInsurance: (id) => api.get(`/patients/${id}/insurance`),
  updatePatientInsurance: (id, insuranceData) => api.put(`/patients/${id}/insurance`, insuranceData),
  
  // Patient emergency contacts
  getPatientEmergencyContacts: (id) => api.get(`/patients/${id}/emergency-contacts`),
  addPatientEmergencyContact: (id, contactData) => api.post(`/patients/${id}/emergency-contacts`, contactData),
  updatePatientEmergencyContact: (id, contactId, contactData) => 
    api.put(`/patients/${id}/emergency-contacts/${contactId}`, contactData),
  deletePatientEmergencyContact: (id, contactId) => api.delete(`/patients/${id}/emergency-contacts/${contactId}`),
}

// Doctor API
export const doctorAPI = {
  // Doctor management
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  createDoctor: (doctorData) => api.post('/doctors', doctorData),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  
  // Doctor schedule
  getDoctorSchedule: (id, params) => api.get(`/doctors/${id}/schedule`, { params }),
  updateDoctorSchedule: (id, scheduleData) => api.put(`/doctors/${id}/schedule`, scheduleData),
  getDoctorAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  
  // Doctor specializations
  getDoctorSpecializations: (id) => api.get(`/doctors/${id}/specializations`),
  updateDoctorSpecializations: (id, specializations) => 
    api.put(`/doctors/${id}/specializations`, { specializations }),
  
  // Doctor reviews
  getDoctorReviews: (id, params) => api.get(`/doctors/${id}/reviews`, { params }),
  addDoctorReview: (id, reviewData) => api.post(`/doctors/${id}/reviews`, reviewData),
  
  // Doctor statistics
  getDoctorStats: (id) => api.get(`/doctors/${id}/stats`),
  getDoctorPatients: (id, params) => api.get(`/doctors/${id}/patients`, { params }),
}

// Appointment API
export const appointmentAPI = {
  // Appointment management
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  
  // Appointment status
  confirmAppointment: (id) => api.put(`/appointments/${id}/confirm`),
  cancelAppointment: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  rescheduleAppointment: (id, newDateTime) => api.put(`/appointments/${id}/reschedule`, { newDateTime }),
  
  // Appointment notes
  getAppointmentNotes: (id) => api.get(`/appointments/${id}/notes`),
  addAppointmentNote: (id, noteData) => api.post(`/appointments/${id}/notes`, noteData),
  updateAppointmentNote: (id, noteId, noteData) => api.put(`/appointments/${id}/notes/${noteId}`, noteData),
  deleteAppointmentNote: (id, noteId) => api.delete(`/appointments/${id}/notes/${noteId}`),
  
  // Appointment reminders
  getAppointmentReminders: (id) => api.get(`/appointments/${id}/reminders`),
  sendAppointmentReminder: (id) => api.post(`/appointments/${id}/reminders`),
  
  // Availability
  checkAvailability: (doctorId, date, duration) => 
    api.get('/appointments/availability', { params: { doctorId, date, duration } }),
  getAvailableSlots: (doctorId, date) => 
    api.get('/appointments/available-slots', { params: { doctorId, date } }),
}

// Treatment API
export const treatmentAPI = {
  // Treatment management
  getTreatments: (params) => api.get('/treatments', { params }),
  getTreatment: (id) => api.get(`/treatments/${id}`),
  createTreatment: (treatmentData) => api.post('/treatments', treatmentData),
  updateTreatment: (id, treatmentData) => api.put(`/treatments/${id}`, treatmentData),
  deleteTreatment: (id) => api.delete(`/treatments/${id}`),
  
  // Treatment categories
  getTreatmentCategories: () => api.get('/treatments/categories'),
  createTreatmentCategory: (categoryData) => api.post('/treatments/categories', categoryData),
  updateTreatmentCategory: (id, categoryData) => api.put(`/treatments/categories/${id}`, categoryData),
  deleteTreatmentCategory: (id) => api.delete(`/treatments/categories/${id}`),
  
  // Treatment plans
  getTreatmentPlans: (patientId) => api.get(`/treatment-plans`, { params: { patientId } }),
  createTreatmentPlan: (planData) => api.post('/treatment-plans', planData),
  updateTreatmentPlan: (id, planData) => api.put(`/treatment-plans/${id}`, planData),
  deleteTreatmentPlan: (id) => api.delete(`/treatment-plans/${id}`),
}

// Clinic API
export const clinicAPI = {
  // Clinic management
  getClinics: (params) => api.get('/clinics', { params }),
  getClinic: (id) => api.get(`/clinics/${id}`),
  createClinic: (clinicData) => api.post('/clinics', clinicData),
  updateClinic: (id, clinicData) => api.put(`/clinics/${id}`, clinicData),
  deleteClinic: (id) => api.delete(`/clinics/${id}`),
  
  // Clinic settings
  getClinicSettings: (id) => api.get(`/clinics/${id}/settings`),
  updateClinicSettings: (id, settingsData) => api.put(`/clinics/${id}/settings`, settingsData),
  
  // Clinic staff
  getClinicStaff: (id) => api.get(`/clinics/${id}/staff`),
  addClinicStaff: (id, staffData) => api.post(`/clinics/${id}/staff`, staffData),
  updateClinicStaff: (id, staffId, staffData) => api.put(`/clinics/${id}/staff/${staffId}`, staffData),
  removeClinicStaff: (id, staffId) => api.delete(`/clinics/${id}/staff/${staffId}`),
  
  // Clinic equipment
  getClinicEquipment: (id) => api.get(`/clinics/${id}/equipment`),
  addClinicEquipment: (id, equipmentData) => api.post(`/clinics/${id}/equipment`, equipmentData),
  updateClinicEquipment: (id, equipmentId, equipmentData) => 
    api.put(`/clinics/${id}/equipment/${equipmentId}`, equipmentData),
  deleteClinicEquipment: (id, equipmentId) => api.delete(`/clinics/${id}/equipment/${equipmentId}`),
}

// Notification API
export const notificationAPI = {
  // Notification management
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotification: (id) => api.get(`/notifications/${id}`),
  markAsRead: (notificationIds) => api.put('/notifications/read', { notificationIds }),
  markAsUnread: (notificationIds) => api.put('/notifications/unread', { notificationIds }),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/notifications/all'),
  
  // Notification preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
  
  // Notification templates
  getTemplates: () => api.get('/notifications/templates'),
  createTemplate: (templateData) => api.post('/notifications/templates', templateData),
  updateTemplate: (id, templateData) => api.put(`/notifications/templates/${id}`, templateData),
  deleteTemplate: (id) => api.delete(`/notifications/templates/${id}`),
}

// Payment API
export const paymentAPI = {
  // Payment management
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  
  // Payment processing
  processPayment: (paymentData) => api.post('/payments/process', paymentData),
  refundPayment: (id, amount, reason) => api.post(`/payments/${id}/refund`, { amount, reason }),
  
  // Payment methods
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (methodData) => api.post('/payments/methods', methodData),
  updatePaymentMethod: (id, methodData) => api.put(`/payments/methods/${id}`, methodData),
  deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
  
  // Invoices
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
  updateInvoice: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  downloadInvoice: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
}

// Chat API
export const chatAPI = {
  // Chat management
  getChats: (params) => api.get('/chats', { params }),
  getChat: (id) => api.get(`/chats/${id}`),
  createChat: (chatData) => api.post('/chats', chatData),
  updateChat: (id, chatData) => api.put(`/chats/${id}`, chatData),
  deleteChat: (id) => api.delete(`/chats/${id}`),
  
  // Messages
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, messageData) => api.post(`/chats/${chatId}/messages`, messageData),
  updateMessage: (chatId, messageId, messageData) => 
    api.put(`/chats/${chatId}/messages/${messageId}`, messageData),
  deleteMessage: (chatId, messageId) => api.delete(`/chats/${chatId}/messages/${messageId}`),
  markMessagesAsRead: (chatId, messageIds) => 
    api.put(`/chats/${chatId}/messages/read`, { messageIds }),
  
  // File sharing
  uploadFile: (chatId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/chats/${chatId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  downloadFile: (chatId, fileId) => api.get(`/chats/${chatId}/files/${fileId}`, { responseType: 'blob' }),
}

// Analytics API
export const analyticsAPI = {
  // Dashboard analytics
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getRevenueStats: (params) => api.get('/analytics/revenue', { params }),
  getAppointmentStats: (params) => api.get('/analytics/appointments', { params }),
  getPatientStats: (params) => api.get('/analytics/patients', { params }),
  
  // Reports
  getReports: (params) => api.get('/analytics/reports', { params }),
  generateReport: (reportData) => api.post('/analytics/reports', reportData),
  downloadReport: (id) => api.get(`/analytics/reports/${id}/download`, { responseType: 'blob' }),
  
  // Custom analytics
  runCustomQuery: (queryData) => api.post('/analytics/query', queryData),
  getChartData: (chartType, params) => api.get(`/analytics/charts/${chartType}`, { params }),
}

// File API
export const fileAPI = {
  // File management
  uploadFile: (file, folder = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  downloadFile: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}`),
  getFile: (id) => api.get(`/files/${id}`),
  getFiles: (params) => api.get('/files', { params }),
  
  // Image processing
  resizeImage: (id, width, height) => 
    api.get(`/files/${id}/resize`, { params: { width, height }, responseType: 'blob' }),
  cropImage: (id, x, y, width, height) => 
    api.get(`/files/${id}/crop`, { params: { x, y, width, height }, responseType: 'blob' }),
}

// Settings API
export const settingsAPI = {
  // System settings
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  
  // Email settings
  getEmailSettings: () => api.get('/settings/email'),
  updateEmailSettings: (emailSettings) => api.put('/settings/email', emailSettings),
  testEmailSettings: () => api.post('/settings/email/test'),
  
  // SMS settings
  getSMSSettings: () => api.get('/settings/sms'),
  updateSMSSettings: (smsSettings) => api.put('/settings/sms', smsSettings),
  testSMSSettings: () => api.post('/settings/sms/test'),
  
  // Backup settings
  getBackupSettings: () => api.get('/settings/backup'),
  updateBackupSettings: (backupSettings) => api.put('/settings/backup', backupSettings),
  createBackup: () => api.post('/settings/backup/create'),
  restoreBackup: (backupId) => api.post(`/settings/backup/restore/${backupId}`),
}

export default api
