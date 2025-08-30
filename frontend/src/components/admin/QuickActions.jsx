import {
    CalendarPlusIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const QuickActions = () => {
  const actions = [
    {
      name: 'Add User',
      icon: UserPlusIcon,
      href: '/admin/users/new',
      color: 'blue',
      description: 'Add new patient or staff'
    },
    {
      name: 'Schedule Appointment',
      icon: CalendarPlusIcon,
      href: '/admin/appointments/new',
      color: 'green',
      description: 'Book new appointment'
    },
    {
      name: 'Add Treatment',
      icon: ClipboardDocumentListIcon,
      href: '/admin/treatments/new',
      color: 'purple',
      description: 'Create treatment plan'
    },
    {
      name: 'View Analytics',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'yellow',
      description: 'Check performance metrics'
    }
  ]

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.a
            key={action.name}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${colorClasses[action.color]} text-white rounded-lg p-4 block hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <div className="flex items-center">
              <action.icon className="h-6 w-6 mr-3" />
              <div>
                <h4 className="font-medium">{action.name}</h4>
                <p className="text-sm opacity-90 mt-1">{action.description}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
