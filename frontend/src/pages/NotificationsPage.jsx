import {
    BellIcon,
    CheckCircleIcon,
    CheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    InformationCircleIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'Appointment Reminder',
      message: 'You have an appointment with Dr. Smith tomorrow at 2:00 PM',
      timestamp: '2 hours ago',
      read: false,
      icon: ClockIcon,
      color: 'blue'
    },
    {
      id: 2,
      type: 'success',
      title: 'Payment Confirmed',
      message: 'Your payment of $150 for teeth cleaning has been processed successfully',
      timestamp: '1 day ago',
      read: false,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Update Profile',
      message: 'Please update your contact information to ensure we can reach you',
      timestamp: '2 days ago',
      read: true,
      icon: ExclamationTriangleIcon,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'info',
      title: 'New Treatment Available',
      message: 'We now offer advanced whitening treatments. Book your consultation today!',
      timestamp: '3 days ago',
      read: true,
      icon: InformationCircleIcon,
      color: 'blue'
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your appointment for December 15th has been confirmed',
      timestamp: '1 week ago',
      read: true,
      icon: CheckIcon,
      color: 'green'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const deleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const toggleSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(allIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getColorClasses = (color, isRead) => {
    const opacity = isRead ? 'opacity-60' : '';
    switch (color) {
      case 'blue':
        return `bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 ${opacity}`;
      case 'green':
        return `bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 ${opacity}`;
      case 'yellow':
        return `bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 ${opacity}`;
      case 'red':
        return `bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 ${opacity}`;
      default:
        return `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${opacity}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BellIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount} unread notifications
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark all as read
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            {['all', 'unread', 'read', 'appointment', 'success', 'warning', 'info'].map((filterType) => (
              <motion.button
                key={filterType}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"
            >
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedNotifications.length} notification(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Clear
                </button>
                <button
                  onClick={deleteSelected}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex items-center space-x-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BellIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? "You're all caught up!"
                  : `No ${filter} notifications to show.`
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const IconComponent = notification.icon;
              const isSelected = selectedNotifications.includes(notification.id);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 p-6 transition-all ${
                    notification.read 
                      ? 'border-gray-300 dark:border-gray-600' 
                      : 'border-blue-500'
                  } ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(notification.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${getColorClasses(notification.color, notification.read)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            notification.read 
                              ? 'text-gray-600 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 ${
                            notification.read 
                              ? 'text-gray-500 dark:text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Load More Notifications
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
