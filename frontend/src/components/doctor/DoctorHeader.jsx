import {
    Bars3Icon,
    BellIcon,
    ClockIcon,
    UserIcon
} from '@heroicons/react/24/outline'

const DoctorHeader = ({ 
  onMenuClick, 
  onNotificationClick, 
  onRemindersClick,
  unreadCount, 
  user 
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Title */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Doctor Dashboard
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Appointment Reminders */}
            <button
              onClick={onRemindersClick}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ClockIcon className="h-6 w-6" />
            </button>

            {/* Notifications */}
            <button
              onClick={onNotificationClick}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dr. {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.specialization || 'General Dentist'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DoctorHeader
