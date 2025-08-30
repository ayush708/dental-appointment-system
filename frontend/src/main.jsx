import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'

// Import global styles
import './index.css'

// Simple user storage (in real app, this would be in database)
const getUsersFromStorage = () => {
  const users = localStorage.getItem('dental_users')
  return users ? JSON.parse(users) : []
}

const saveUsersToStorage = (users) => {
  localStorage.setItem('dental_users', JSON.stringify(users))
}

const getCurrentUser = () => {
  const user = localStorage.getItem('dental_current_user')
  return user ? JSON.parse(user) : null
}

const setCurrentUser = (user) => {
  localStorage.setItem('dental_current_user', JSON.stringify(user))
}

const logout = () => {
  localStorage.removeItem('dental_current_user')
}

// Appointment storage functions
const getAppointmentsFromStorage = () => {
  const appointments = localStorage.getItem('dental_appointments')
  return appointments ? JSON.parse(appointments) : []
}

const saveAppointmentsToStorage = (appointments) => {
  localStorage.setItem('dental_appointments', JSON.stringify(appointments))
}

const addAppointment = (appointmentData) => {
  const appointments = getAppointmentsFromStorage()
  const newAppointment = {
    id: Date.now(),
    ...appointmentData,
    status: 'Pending',
    createdAt: new Date().toISOString()
  }
  appointments.push(newAppointment)
  saveAppointmentsToStorage(appointments)
  return newAppointment
}

// Registration Page Component
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'

    return newErrors
  }

  const handleRegister = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check if user already exists
    const users = getUsersFromStorage()
    const existingUser = users.find(user => user.email === formData.email)
    
    if (existingUser) {
      setErrors({ email: 'Email already registered. Please login instead.' })
      return
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...formData,
      role: 'patient',
      createdAt: new Date().toISOString(),
      appointments: []
    }
    
    // Remove confirmPassword before saving
    delete newUser.confirmPassword

    users.push(newUser)
    saveUsersToStorage(users)
    setCurrentUser(newUser)

    alert('Registration successful! Welcome to DentalCare Pro!')
    navigate('/user/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🦷</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Join DentalCare Pro
            </h2>
            <p className="text-gray-600 mt-2">Create your account to book appointments</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your address (optional)"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/user/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in here
              </Link>
            </p>
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm mt-2 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Login Page Component
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    // Check if user exists
    const users = getUsersFromStorage()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (user) {
      setCurrentUser(user)
      alert(`Welcome back, ${user.firstName}!`)
      navigate('/user/dashboard')
    } else {
      setError('Invalid email or password. Please check your credentials or sign up.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🦷</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Sign in to DentalCare Pro
            </h2>
            <p className="text-gray-600 mt-2">Access your dental appointment dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/user/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up here
              </Link>
            </p>
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm mt-2 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(getCurrentUser())
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/')
    alert('Logged out successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-3xl">🦷</div>
              <h1 className="text-2xl font-bold text-gray-900">DentalCare Pro</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
              {user.address && <p><strong>Address:</strong> {user.address}</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/book-appointment"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg transition-colors"
              >
                📅 Book New Appointment
              </Link>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
                📋 View Medical History
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors">
                💳 View Payments
              </button>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Appointments</h3>
            {user.appointments && user.appointments.length > 0 ? (
              <div className="space-y-3">
                {user.appointments.map((appointment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{appointment.service}</p>
                    <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                    <p className="text-sm text-gray-600">Dr. {appointment.doctor}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>No appointments yet</p>
                <Link 
                  to="/book-appointment"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Book your first appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Book Appointment Component
const BookAppointment = () => {
  const [user, setUser] = useState(getCurrentUser())
  const [formData, setFormData] = useState({
    service: '',
    doctor: '',
    date: '',
    time: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/user/login')
    }
  }, [user, navigate])

  if (!user) return null

  const services = [
    'General Checkup',
    'Teeth Cleaning',
    'Dental Filling',
    'Root Canal Treatment',
    'Tooth Extraction',
    'Teeth Whitening',
    'Orthodontic Consultation',
    'Dental Implants',
    'Crown/Bridge Work',
    'Emergency Treatment'
  ]

  const doctors = [
    'Dr. Sarah Johnson - General Dentist',
    'Dr. Michael Chen - Orthodontist',
    'Dr. Emily Rodriguez - Oral Surgeon',
    'Dr. David Thompson - Cosmetic Dentist',
    'Dr. Lisa Parker - Pediatric Dentist'
  ]

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.service) newErrors.service = 'Please select a service'
    if (!formData.doctor) newErrors.doctor = 'Please select a doctor'
    if (!formData.date) newErrors.date = 'Please select a date'
    if (!formData.time) newErrors.time = 'Please select a time'
    
    // Check if date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.date = 'Please select a future date'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create appointment
    const appointment = {
      id: Date.now(),
      patientId: user.id,
      patientName: `${user.firstName} ${user.lastName}`,
      patientEmail: user.email,
      patientPhone: user.phone,
      ...formData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }

    // Save to central appointments storage
    addAppointment(appointment)

    // Update user's appointments
    const users = getUsersFromStorage()
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      if (!users[userIndex].appointments) {
        users[userIndex].appointments = []
      }
      users[userIndex].appointments.push(appointment)
      saveUsersToStorage(users)
      setCurrentUser(users[userIndex])
      setUser(users[userIndex])
    }

    alert('Appointment booked successfully! We will confirm your appointment shortly.')
    navigate('/user/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="text-3xl">🦷</div>
              <h1 className="text-2xl font-bold text-gray-900">DentalCare Pro</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <Link 
                to="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Book an Appointment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.service ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a service...</option>
                {services.map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
              {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.doctor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor}>{doctor}</option>
                ))}
              </select>
              {errors.doctor && <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a time...</option>
                  {timeSlots.map((time, index) => (
                    <option key={index} value={time}>{time}</option>
                  ))}
                </select>
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific concerns or notes for the doctor..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Book Appointment
              </button>
              <Link
                to="/dashboard"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// About Page Component
const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <Header />
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About DentalCare Pro</h1>
      <div className="prose prose-lg">
        <p className="text-lg text-gray-600 mb-6">
          Welcome to DentalCare Pro, your trusted partner in oral health and dental care.
        </p>
        <p className="text-gray-600 mb-4">
          We are committed to providing world-class dental services with state-of-the-art technology
          and a team of highly qualified dental professionals.
        </p>
      </div>
    </div>
  </div>
)

// Services Page Component
const ServicesPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <Header />
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">General Dentistry</h3>
          <p className="text-gray-600">Comprehensive dental care for the whole family</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Cosmetic Dentistry</h3>
          <p className="text-gray-600">Enhance your smile with our aesthetic treatments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Orthodontics</h3>
          <p className="text-gray-600">Straighten your teeth with modern orthodontic solutions</p>
        </div>
      </div>
    </div>
  </div>
)

// Contact Page Component
const ContactPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <Header />
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
          <p className="text-gray-600 mb-4">📞 Phone: (555) 123-4567</p>
          <p className="text-gray-600 mb-4">📧 Email: info@dentalcarepro.com</p>
          <p className="text-gray-600 mb-4">📍 Address: 123 Dental Street, Health City, HC 12345</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
          <p className="text-gray-600 mb-2">Monday - Friday: 8:00 AM - 6:00 PM</p>
          <p className="text-gray-600 mb-2">Saturday: 9:00 AM - 4:00 PM</p>
          <p className="text-gray-600">Sunday: Closed</p>
        </div>
      </div>
    </div>
  </div>
)

// Header Component with Navigation
const Header = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  
  const handleBooking = () => {
    if (currentUser) {
      navigate('/user/book-appointment')
    } else {
      alert('Please login first to book an appointment.')
      navigate('/user/login')
    }
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    navigate('/')
    alert('Logged out successfully!')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🦷</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DentalCare Pro
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Services
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact
            </Link>
            <Link to="/admin/login" className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium">
              Admin Portal
            </Link>
          </nav>
          <div className="flex space-x-4">
            {currentUser ? (
              <>
                <Link 
                  to={currentUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/user/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  User Login
                </button>
                <button 
                  onClick={() => navigate('/user/register')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
            <button 
              onClick={handleBooking}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Homepage component
const HomePage = () => {
  const navigate = useNavigate()
  
  const handleBooking = () => {
    alert('Appointment booking system coming soon! Please call (555) 123-4567 to schedule.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Your Smile is Our
              <span className="block text-blue-600 dark:text-blue-400">Priority</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience world-class dental care with our team of expert dentists 
              and state-of-the-art technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Book Appointment
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-lg border-2 border-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Portal Selection Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-white mb-4">
              Choose Your Portal
            </h3>
            <p className="text-xl text-center text-blue-100 mb-12">
              Access the right dashboard for your role
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* User Portal */}
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Patient Portal</h4>
                <p className="text-gray-600 mb-6">
                  Book appointments, view your dental history, and manage your profile
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/user/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Patient Login
                  </button>
                  <button 
                    onClick={() => navigate('/user/register')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    New Patient Registration
                  </button>
                </div>
              </div>
              
              {/* Admin Portal */}
              <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal</h4>
                <p className="text-gray-600 mb-6">
                  Manage patients, appointments, doctors, and clinic operations
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/admin/login')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Admin Login
                  </button>
                  <p className="text-sm text-gray-500">
                    For clinic staff and administrators only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Choose DentalCare Pro?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-gray-700">
                <div className="text-4xl mb-4">🏥</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Modern Facilities
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  State-of-the-art equipment and comfortable treatment rooms
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-gray-700">
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Expert Dentists
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Highly qualified and experienced dental professionals
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-gray-700">
                <div className="text-4xl mb-4">📱</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Easy Booking
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Simple online appointment scheduling system
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 DentalCare Pro. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            🚀 System Status: Frontend & Backend Running Successfully!
          </p>
        </div>
      </footer>
    </div>
  )
}

// Admin Login Component
const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleAdminLogin = (e) => {
    e.preventDefault()
    setError('')
    
    // Default admin credentials
    if (email === 'admin@dentalcare.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin-1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dentalcare.com',
        role: 'admin',
        phone: '+1 (555) 000-0000'
      }
      setCurrentUser(adminUser)
      alert('Welcome to Admin Panel!')
      window.location.href = '/admin/dashboard'
    } else {
      setError('Invalid admin credentials. Use admin@dentalcare.com / admin123')
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Admin Portal
            </h2>
            <p className="text-gray-600 mt-2">Access administrative dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-4">
            <p className="text-sm">
              <strong>Demo Credentials:</strong><br />
              Email: admin@dentalcare.com<br />
              Password: admin123
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Admin Dashboard
const AdminDashboard = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  // Fetch real data from localStorage
  const allUsers = getUsersFromStorage()
  const patients = allUsers.filter(u => u.role === 'patient' || !u.role)
  
  // Calculate real statistics
  const totalPatients = patients.length
  const totalAppointments = patients.reduce((total, patient) => {
    return total + (patient.appointments ? patient.appointments.length : 0)
  }, 0)
  
  // Today's appointments (mock for now since we don't have real appointment dates)
  const todaysAppointments = Math.floor(totalAppointments * 0.2) // Assume 20% are today
  
  // Pending approvals (patients without status or new ones)
  const pendingApprovals = patients.filter(p => !p.status || p.status === 'Pending').length
  
  // Monthly revenue calculation (mock based on patient count)
  const monthlyRevenue = totalPatients * 150 // Average $150 per patient

  const stats = [
    { title: 'Total Patients', value: totalPatients.toString(), icon: '👥', color: 'bg-blue-500' },
    { title: 'Total Appointments', value: totalAppointments.toString(), icon: '📅', color: 'bg-green-500' },
    { title: 'Pending Approvals', value: pendingApprovals.toString(), icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Est. Monthly Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: '💰', color: 'bg-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🦷 DentalCare Pro - Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor and manage your dental practice</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 text-white text-2xl mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Manage Patients</h3>
            <p className="text-gray-600 mb-4">View and manage patient records</p>
            <button 
              onClick={() => window.location.href = '/admin/patients'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              View Patients
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Appointments</h3>
            <p className="text-gray-600 mb-4">Schedule and manage appointments</p>
            <button 
              onClick={() => window.location.href = '/admin/appointments'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              View Appointments
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">👨‍⚕️ Doctors</h3>
            <p className="text-gray-600 mb-4">Manage doctor profiles and schedules</p>
            <button 
              onClick={() => window.location.href = '/admin/doctors'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              View Doctors
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Payments</h3>
            <p className="text-gray-600 mb-4">Track payments and billing</p>
            <button 
              onClick={() => window.location.href = '/admin/payments'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
            >
              View Payments
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Reports</h3>
            <p className="text-gray-600 mb-4">Generate business reports</p>
            <button 
              onClick={() => window.location.href = '/admin/reports'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              View Reports
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Settings</h3>
            <p className="text-gray-600 mb-4">Configure system settings</p>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              View Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Patients Page
const AdminPatients = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  // Fetch real user data from localStorage
  const allUsers = getUsersFromStorage()
  const patients = allUsers.filter(u => u.role === 'patient' || !u.role) // Filter only patients

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  const handleDeletePatient = (patientId) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      const updatedUsers = allUsers.filter(u => u.id !== patientId)
      saveUsersToStorage(updatedUsers)
      window.location.reload() // Refresh to show updated data
    }
  }

  const handleToggleStatus = (patientId) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === patientId) {
        u.status = u.status === 'Active' ? 'Inactive' : 'Active'
      }
      return u
    })
    saveUsersToStorage(updatedUsers)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                👥 Patient Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Real Patient Records</h2>
          <p className="text-gray-600">Total Registered Patients: {patients.length}</p>
        </div>

        {patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Registered Yet</h3>
            <p className="text-gray-600 mb-4">Patients will appear here when they register through the user portal.</p>
            <button 
              onClick={() => window.location.href = '/user/register'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Go to User Registration
            </button>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Patients</div>
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Active Patients</div>
                <div className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.status !== 'Inactive').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">New This Month</div>
                <div className="text-2xl font-bold text-purple-600">
                  {patients.filter(p => {
                    const createdDate = new Date(p.createdAt)
                    const now = new Date()
                    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {patient.id}</div>
                        <div className="text-sm text-gray-500">
                          Appointments: {patient.appointments ? patient.appointments.length : 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.email}</div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                        {patient.address && (
                          <div className="text-sm text-gray-500">{patient.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          DOB: {patient.dateOfBirth || 'Not provided'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Gender: {patient.gender || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'Inactive' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {patient.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => alert(`Patient Details:\n\nName: ${patient.firstName} ${patient.lastName}\nEmail: ${patient.email}\nPhone: ${patient.phone}\nDOB: ${patient.dateOfBirth}\nGender: ${patient.gender}\nAddress: ${patient.address}\nRegistered: ${new Date(patient.createdAt).toLocaleString()}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(patient.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {patient.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Admin Appointments Page
const AdminAppointments = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  // Fetch real appointment data from localStorage
  const appointments = getAppointmentsFromStorage()

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  const handleUpdateStatus = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === appointmentId) {
        apt.status = newStatus
      }
      return apt
    })
    saveAppointmentsToStorage(updatedAppointments)
    window.location.reload()
  }

  const handleDeleteAppointment = (appointmentId) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId)
      saveAppointmentsToStorage(updatedAppointments)
      window.location.reload()
    }
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800' 
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                📅 Appointment Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Real Appointment Schedule</h2>
          <p className="text-gray-600">Total Appointments: {appointments.length}</p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Booked Yet</h3>
            <p className="text-gray-600 mb-4">Appointments will appear here when patients book through the user portal.</p>
            <button 
              onClick={() => window.location.href = '/user/book-appointment'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Go to Booking Page
            </button>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Appointments</div>
                <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status.toLowerCase() === 'pending').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Confirmed</div>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status.toLowerCase() === 'confirmed').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">This Week</div>
                <div className="text-2xl font-bold text-purple-600">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.date)
                    const now = new Date()
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return aptDate >= now && aptDate <= weekFromNow
                  }).length}
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.patientEmail}</div>
                        <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.doctor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.date}</div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => alert(`Appointment Details:\n\nPatient: ${appointment.patientName}\nService: ${appointment.service}\nDoctor: ${appointment.doctor}\nDate: ${appointment.date}\nTime: ${appointment.time}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || 'None'}\nBooked: ${new Date(appointment.createdAt).toLocaleString()}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(appointment.id, 'Confirmed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(appointment.id, 'Cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Admin Doctors Page  
const AdminDoctors = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  // Mock doctor data
  const doctors = [
    { id: 1, name: 'Dr. James Smith', specialty: 'General Dentistry', email: 'j.smith@clinic.com', phone: '+1-555-1001', experience: '10 years', status: 'Available' },
    { id: 2, name: 'Dr. Emily Johnson', specialty: 'Orthodontics', email: 'e.johnson@clinic.com', phone: '+1-555-1002', experience: '8 years', status: 'Busy' },
    { id: 3, name: 'Dr. Michael Brown', specialty: 'Oral Surgery', email: 'm.brown@clinic.com', phone: '+1-555-1003', experience: '15 years', status: 'Available' },
    { id: 4, name: 'Dr. Sarah Davis', specialty: 'Pediatric Dentistry', email: 's.davis@clinic.com', phone: '+1-555-1004', experience: '12 years', status: 'On Leave' }
  ]

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                👨‍⚕️ Doctor Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Profiles</h2>
          <p className="text-gray-600">Manage doctor information and schedules</p>
        </div>

        {/* Add Doctor Button */}
        <div className="mb-6">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
            + Add New Doctor
          </button>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    <div className="text-sm text-gray-500">ID: {doctor.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.email}</div>
                    <div className="text-sm text-gray-500">{doctor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doctor.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : doctor.status === 'Busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-green-600 hover:text-green-900">Schedule</button>
                    <button className="text-red-600 hover:text-red-900">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Admin Payments Page
const AdminPayments = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  // Mock payment data
  const payments = [
    { id: 1, patient: 'John Doe', service: 'Teeth Cleaning', amount: '$150', date: '2025-08-25', status: 'Paid', method: 'Credit Card' },
    { id: 2, patient: 'Jane Smith', service: 'Root Canal', amount: '$800', date: '2025-08-24', status: 'Pending', method: 'Insurance' },
    { id: 3, patient: 'Mike Johnson', service: 'Dental Filling', amount: '$200', date: '2025-08-23', status: 'Paid', method: 'Cash' },
    { id: 4, patient: 'Sarah Wilson', service: 'Orthodontic Consultation', amount: '$100', date: '2025-08-22', status: 'Overdue', method: 'Credit Card' }
  ]

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                💰 Payment Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Records</h2>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">$15,250</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending Payments</div>
            <div className="text-2xl font-bold text-yellow-600">$2,400</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="text-2xl font-bold text-red-600">$800</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">This Month</div>
            <div className="text-2xl font-bold text-blue-600">$3,200</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.patient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                    <button className="text-green-600 hover:text-green-900">Process</button>
                    <button className="text-red-600 hover:text-red-900">Refund</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Admin Reports Page
const AdminReports = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                📊 Reports & Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Reports</h2>
          <p className="text-gray-600">Generate and view various business analytics</p>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Report</h3>
            <p className="text-gray-600 mb-4">Monthly and yearly revenue analytics</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Report</h3>
            <p className="text-gray-600 mb-4">Patient demographics and statistics</p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment Report</h3>
            <p className="text-gray-600 mb-4">Appointment trends and analytics</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">👨‍⚕️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Performance</h3>
            <p className="text-gray-600 mb-4">Doctor productivity and ratings</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Report</h3>
            <p className="text-gray-600 mb-4">Comprehensive financial analytics</p>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Report</h3>
            <p className="text-gray-600 mb-4">System usage and performance</p>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Settings Page
const AdminSettings = () => {
  const [user, setUser] = useState(getCurrentUser())
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/admin/login'
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.location.href = '/admin/dashboard'} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                ⚙️ System Settings
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Configuration</h2>
          <p className="text-gray-600">Manage clinic settings and preferences</p>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🏥 Clinic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                <input type="text" defaultValue="DentalCare Pro" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" defaultValue="123 Dental St, Health City" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" defaultValue="+1 (555) 123-4567" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ Operating Hours</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-700">Monday</span>
                <input type="time" defaultValue="09:00" className="rounded-md border-gray-300 shadow-sm" />
                <input type="time" defaultValue="17:00" className="rounded-md border-gray-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-700">Tuesday</span>
                <input type="time" defaultValue="09:00" className="rounded-md border-gray-300 shadow-sm" />
                <input type="time" defaultValue="17:00" className="rounded-md border-gray-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-medium text-gray-700">Wednesday</span>
                <input type="time" defaultValue="09:00" className="rounded-md border-gray-300 shadow-sm" />
                <input type="time" defaultValue="17:00" className="rounded-md border-gray-300 shadow-sm" />
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                Update Hours
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📧 Notification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-700">Email appointment reminders</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
              </label>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                Save Preferences
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔐 Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-left">
                Change Admin Password
              </button>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-left">
                Enable Two-Factor Authentication
              </button>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-left">
                View Login History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App with Router
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* User/Patient Routes */}
        <Route path="/user/login" element={<LoginPage />} />
        <Route path="/user/register" element={<RegisterPage />} />
        <Route path="/user/dashboard" element={<Dashboard />} />
        <Route path="/user/book-appointment" element={<BookAppointment />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
              <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Go Home
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
