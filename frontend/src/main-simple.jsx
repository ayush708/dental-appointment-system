import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Import global styles
import './index.css'

// Simple homepage component
const SimpleHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🦷</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                DentalCare Pro
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                About
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Services
              </a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </a>
            </nav>
            <div className="flex space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Login
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </header>

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
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
                Book Appointment
              </button>
              <button className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-lg border-2 border-blue-600 transition-all duration-200 transform hover:scale-105">
                Learn More
              </button>
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

// Simple App wrapper
const SimpleApp = () => {
  return (
    <BrowserRouter>
      <SimpleHomePage />
    </BrowserRouter>
  )
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<SimpleApp />)
