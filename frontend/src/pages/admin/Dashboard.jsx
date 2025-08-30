import { motion } from 'framer-motion'

const Dashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Welcome to the admin dashboard. Here you can manage users, appointments, and system settings.
      </p>
    </motion.div>
  )
}

export default Dashboard
