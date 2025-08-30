import { ArrowPathIcon, ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <ExclamationTriangleIcon className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Server Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Something went wrong on our end. We're working to fix it as quickly as possible. 
            Please try again in a few moments.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Status Updates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            <strong>Error ID:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Check our{' '}
            <a href="/status" className="underline hover:no-underline">
              status page
            </a>{' '}
            for updates or contact{' '}
            <a href="mailto:support@dentalcare.com" className="underline hover:no-underline">
              support
            </a>
          </p>
        </motion.div>

        {/* Auto Refresh Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-4"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This page will automatically refresh in 30 seconds
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ServerError
