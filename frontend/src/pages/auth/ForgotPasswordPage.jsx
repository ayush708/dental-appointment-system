import { motion } from 'framer-motion'

const ForgotPasswordPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Forgot Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Password reset form coming soon...
        </p>
      </div>
    </motion.div>
  )
}

export default ForgotPasswordPage
