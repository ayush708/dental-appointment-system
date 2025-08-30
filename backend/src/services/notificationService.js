/**
 * Notification Service for Dental Appointment System
 * Handles all types of notifications including in-app, push, SMS, and email
 */

const logger = require('../config/logger');
const redisClient = require('../config/redis');
const { sendSMS } = require('./smsService');
const { sendEmail } = require('./emailService');

class NotificationService {
    constructor() {
        this.socketIO = null;
        this.fcm = null; // Firebase Cloud Messaging for push notifications
        this.initializePushNotifications();
    }

    /**
     * Set Socket.IO instance for real-time notifications
     */
    setSocketIO(io) {
        this.socketIO = io;
        logger.info('Socket.IO instance set for notifications');
    }

    /**
     * Initialize push notification services
     */
    async initializePushNotifications() {
        try {
            if (process.env.FCM_SERVER_KEY) {
                // Initialize Firebase Cloud Messaging
                const admin = require('firebase-admin');
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                
                this.fcm = admin.messaging();
                logger.info('Push notification service initialized');
            }
        } catch (error) {
            logger.error('Failed to initialize push notifications:', error);
        }
    }

    /**
     * Create and send notification
     * @param {Object} options - Notification options
     */
    async createNotification(options) {
        try {
            const {
                userId,
                type,
                title,
                message,
                data = {},
                priority = 'normal',
                channels = ['in-app'],
                scheduledFor = null,
                expiresAt = null
            } = options;

            // Generate notification ID
            const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create notification object
            const notification = {
                id: notificationId,
                userId,
                type,
                title,
                message,
                data,
                priority,
                channels,
                status: scheduledFor ? 'scheduled' : 'sent',
                read: false,
                createdAt: new Date(),
                scheduledFor,
                expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
                deliveryAttempts: 0,
                lastAttempt: null
            };

            // Store notification
            await this.storeNotification(notification);

            // Send immediately or schedule
            if (scheduledFor && new Date(scheduledFor) > new Date()) {
                await this.scheduleNotification(notification);
            } else {
                await this.sendNotification(notification);
            }

            return notification;

        } catch (error) {
            logger.error('Create notification error:', error);
            throw error;
        }
    }

    /**
     * Send notification through specified channels
     */
    async sendNotification(notification) {
        const results = {
            'in-app': false,
            'push': false,
            'email': false,
            'sms': false
        };

        try {
            // Get user preferences
            const userPreferences = await this.getUserPreferences(notification.userId);

            for (const channel of notification.channels) {
                if (!userPreferences[channel]) continue;

                try {
                    switch (channel) {
                        case 'in-app':
                            results['in-app'] = await this.sendInAppNotification(notification);
                            break;
                        case 'push':
                            results['push'] = await this.sendPushNotification(notification);
                            break;
                        case 'email':
                            results['email'] = await this.sendEmailNotification(notification);
                            break;
                        case 'sms':
                            results['sms'] = await this.sendSMSNotification(notification);
                            break;
                    }
                } catch (channelError) {
                    logger.error(`Failed to send ${channel} notification:`, channelError);
                    results[channel] = false;
                }
            }

            // Update notification status
            notification.deliveryAttempts += 1;
            notification.lastAttempt = new Date();
            notification.deliveryResults = results;
            notification.status = Object.values(results).some(r => r) ? 'delivered' : 'failed';

            await this.updateNotification(notification);

            // Log delivery
            logger.info('Notification sent', {
                notificationId: notification.id,
                userId: notification.userId,
                type: notification.type,
                channels: notification.channels,
                results
            });

        } catch (error) {
            logger.error('Send notification error:', error);
            notification.status = 'failed';
            notification.error = error.message;
            await this.updateNotification(notification);
        }

        return results;
    }

    /**
     * Send in-app notification via Socket.IO
     */
    async sendInAppNotification(notification) {
        try {
            if (!this.socketIO) {
                logger.warn('Socket.IO not available for in-app notifications');
                return false;
            }

            // Send to specific user
            this.socketIO.to(`user_${notification.userId}`).emit('notification', {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                priority: notification.priority,
                createdAt: notification.createdAt
            });

            // Store in Redis for offline users
            const userNotificationsKey = `user_notifications:${notification.userId}`;
            await redisClient.lpush(userNotificationsKey, JSON.stringify(notification));
            await redisClient.ltrim(userNotificationsKey, 0, 99); // Keep last 100 notifications
            await redisClient.expire(userNotificationsKey, 86400 * 30); // 30 days

            return true;

        } catch (error) {
            logger.error('In-app notification error:', error);
            return false;
        }
    }

    /**
     * Send push notification via FCM
     */
    async sendPushNotification(notification) {
        try {
            if (!this.fcm) {
                logger.warn('FCM not available for push notifications');
                return false;
            }

            // Get user's device tokens
            const deviceTokens = await this.getUserDeviceTokens(notification.userId);
            if (deviceTokens.length === 0) {
                logger.warn('No device tokens found for user:', notification.userId);
                return false;
            }

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.message
                },
                data: {
                    notificationId: notification.id,
                    type: notification.type,
                    ...notification.data
                },
                android: {
                    priority: notification.priority === 'high' ? 'high' : 'normal',
                    notification: {
                        icon: 'ic_notification',
                        color: '#2196F3',
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: await this.getUnreadNotificationCount(notification.userId)
                        }
                    }
                },
                tokens: deviceTokens
            };

            const response = await this.fcm.sendMulticast(message);

            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(deviceTokens[idx]);
                    }
                });
                await this.removeInvalidDeviceTokens(notification.userId, failedTokens);
            }

            return response.successCount > 0;

        } catch (error) {
            logger.error('Push notification error:', error);
            return false;
        }
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(notification) {
        try {
            // Get user email
            const userEmail = await this.getUserEmail(notification.userId);
            if (!userEmail) {
                return false;
            }

            await sendEmail({
                to: userEmail,
                subject: notification.title,
                template: 'notification',
                data: {
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    data: notification.data,
                    actionUrl: notification.data.actionUrl
                }
            });

            return true;

        } catch (error) {
            logger.error('Email notification error:', error);
            return false;
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMSNotification(notification) {
        try {
            // Get user phone
            const userPhone = await this.getUserPhone(notification.userId);
            if (!userPhone) {
                return false;
            }

            const smsMessage = `${notification.title}: ${notification.message}`;
            
            await sendSMS({
                to: userPhone,
                message: smsMessage
            });

            return true;

        } catch (error) {
            logger.error('SMS notification error:', error);
            return false;
        }
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                unreadOnly = false,
                type = null,
                startDate = null,
                endDate = null
            } = options;

            // Build query
            const query = { userId };
            if (unreadOnly) query.read = false;
            if (type) query.type = type;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            // Get from Redis first (for recent notifications)
            const recentNotifications = await this.getRecentNotificationsFromRedis(userId);
            
            // Filter recent notifications based on query
            let filteredNotifications = recentNotifications.filter(notif => {
                if (unreadOnly && notif.read) return false;
                if (type && notif.type !== type) return false;
                return true;
            });

            // Sort by creation date (newest first)
            filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

            return {
                notifications: paginatedNotifications,
                pagination: {
                    current: page,
                    pages: Math.ceil(filteredNotifications.length / limit),
                    total: filteredNotifications.length,
                    limit
                }
            };

        } catch (error) {
            logger.error('Get user notifications error:', error);
            return { notifications: [], pagination: { current: 1, pages: 0, total: 0, limit } };
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            // Update in Redis
            const userNotificationsKey = `user_notifications:${userId}`;
            const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
            
            const updatedNotifications = notifications.map(notifStr => {
                const notif = JSON.parse(notifStr);
                if (notif.id === notificationId) {
                    notif.read = true;
                    notif.readAt = new Date();
                }
                return JSON.stringify(notif);
            });

            // Replace the list
            await redisClient.del(userNotificationsKey);
            if (updatedNotifications.length > 0) {
                await redisClient.lpush(userNotificationsKey, ...updatedNotifications);
                await redisClient.expire(userNotificationsKey, 86400 * 30);
            }

            return true;

        } catch (error) {
            logger.error('Mark notification as read error:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        try {
            const userNotificationsKey = `user_notifications:${userId}`;
            const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
            
            const updatedNotifications = notifications.map(notifStr => {
                const notif = JSON.parse(notifStr);
                notif.read = true;
                notif.readAt = new Date();
                return JSON.stringify(notif);
            });

            // Replace the list
            await redisClient.del(userNotificationsKey);
            if (updatedNotifications.length > 0) {
                await redisClient.lpush(userNotificationsKey, ...updatedNotifications);
                await redisClient.expire(userNotificationsKey, 86400 * 30);
            }

            return true;

        } catch (error) {
            logger.error('Mark all notifications as read error:', error);
            return false;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        try {
            const userNotificationsKey = `user_notifications:${userId}`;
            const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
            
            const filteredNotifications = notifications.filter(notifStr => {
                const notif = JSON.parse(notifStr);
                return notif.id !== notificationId;
            });

            // Replace the list
            await redisClient.del(userNotificationsKey);
            if (filteredNotifications.length > 0) {
                await redisClient.lpush(userNotificationsKey, ...filteredNotifications);
                await redisClient.expire(userNotificationsKey, 86400 * 30);
            }

            return true;

        } catch (error) {
            logger.error('Delete notification error:', error);
            return false;
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadNotificationCount(userId) {
        try {
            const userNotificationsKey = `user_notifications:${userId}`;
            const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
            
            const unreadCount = notifications.filter(notifStr => {
                const notif = JSON.parse(notifStr);
                return !notif.read;
            }).length;

            return unreadCount;

        } catch (error) {
            logger.error('Get unread count error:', error);
            return 0;
        }
    }

    /**
     * Schedule notification for future delivery
     */
    async scheduleNotification(notification) {
        try {
            const scheduleKey = `scheduled_notifications:${notification.scheduledFor.getTime()}`;
            await redisClient.lpush(scheduleKey, JSON.stringify(notification));
            await redisClient.expire(scheduleKey, 86400 * 7); // Keep for 7 days

            logger.info('Notification scheduled', {
                notificationId: notification.id,
                scheduledFor: notification.scheduledFor
            });

        } catch (error) {
            logger.error('Schedule notification error:', error);
        }
    }

    /**
     * Process scheduled notifications
     */
    async processScheduledNotifications() {
        try {
            const now = new Date();
            const timeSlots = [];
            
            // Check for notifications scheduled in the past 5 minutes
            for (let i = 0; i < 5; i++) {
                const time = new Date(now.getTime() - i * 60 * 1000);
                timeSlots.push(Math.floor(time.getTime() / 60000) * 60000);
            }

            for (const timeSlot of timeSlots) {
                const scheduleKey = `scheduled_notifications:${timeSlot}`;
                const notifications = await redisClient.lrange(scheduleKey, 0, -1);

                for (const notifStr of notifications) {
                    const notification = JSON.parse(notifStr);
                    await this.sendNotification(notification);
                }

                // Clean up processed notifications
                await redisClient.del(scheduleKey);
            }

        } catch (error) {
            logger.error('Process scheduled notifications error:', error);
        }
    }

    /**
     * Send bulk notifications
     */
    async sendBulkNotifications(userIds, notificationData) {
        const results = [];
        const batchSize = 50;

        for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (userId) => {
                try {
                    const notification = await this.createNotification({
                        ...notificationData,
                        userId
                    });
                    return { userId, success: true, notificationId: notification.id };
                } catch (error) {
                    return { userId, success: false, error: error.message };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Small delay between batches
            if (i + batchSize < userIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    // Helper methods

    async storeNotification(notification) {
        const userNotificationsKey = `user_notifications:${notification.userId}`;
        await redisClient.lpush(userNotificationsKey, JSON.stringify(notification));
        await redisClient.ltrim(userNotificationsKey, 0, 99);
        await redisClient.expire(userNotificationsKey, 86400 * 30);
    }

    async updateNotification(notification) {
        const userNotificationsKey = `user_notifications:${notification.userId}`;
        const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
        
        const updatedNotifications = notifications.map(notifStr => {
            const notif = JSON.parse(notifStr);
            if (notif.id === notification.id) {
                return JSON.stringify(notification);
            }
            return notifStr;
        });

        await redisClient.del(userNotificationsKey);
        if (updatedNotifications.length > 0) {
            await redisClient.lpush(userNotificationsKey, ...updatedNotifications);
            await redisClient.expire(userNotificationsKey, 86400 * 30);
        }
    }

    async getRecentNotificationsFromRedis(userId) {
        try {
            const userNotificationsKey = `user_notifications:${userId}`;
            const notifications = await redisClient.lrange(userNotificationsKey, 0, -1);
            return notifications.map(notifStr => JSON.parse(notifStr));
        } catch (error) {
            logger.error('Get recent notifications error:', error);
            return [];
        }
    }

    async getUserPreferences(userId) {
        try {
            // This would typically query the User model
            // For now, return default preferences
            return {
                'in-app': true,
                'push': true,
                'email': true,
                'sms': false
            };
        } catch (error) {
            logger.error('Get user preferences error:', error);
            return { 'in-app': true, 'push': false, 'email': false, 'sms': false };
        }
    }

    async getUserDeviceTokens(userId) {
        try {
            const tokensKey = `device_tokens:${userId}`;
            const tokens = await redisClient.smembers(tokensKey);
            return tokens || [];
        } catch (error) {
            logger.error('Get user device tokens error:', error);
            return [];
        }
    }

    async getUserEmail(userId) {
        try {
            // This would typically query the User model
            const userKey = `user_cache:${userId}`;
            const userData = await redisClient.get(userKey);
            if (userData) {
                const user = JSON.parse(userData);
                return user.contact?.email;
            }
            return null;
        } catch (error) {
            logger.error('Get user email error:', error);
            return null;
        }
    }

    async getUserPhone(userId) {
        try {
            // This would typically query the User model
            const userKey = `user_cache:${userId}`;
            const userData = await redisClient.get(userKey);
            if (userData) {
                const user = JSON.parse(userData);
                return user.contact?.phone;
            }
            return null;
        } catch (error) {
            logger.error('Get user phone error:', error);
            return null;
        }
    }

    async removeInvalidDeviceTokens(userId, tokens) {
        try {
            const tokensKey = `device_tokens:${userId}`;
            for (const token of tokens) {
                await redisClient.srem(tokensKey, token);
            }
        } catch (error) {
            logger.error('Remove invalid device tokens error:', error);
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export methods for easy import
module.exports = {
    createNotification: (options) => notificationService.createNotification(options),
    sendNotification: (notification) => notificationService.sendNotification(notification),
    getUserNotifications: (userId, options) => notificationService.getUserNotifications(userId, options),
    markAsRead: (notificationId, userId) => notificationService.markAsRead(notificationId, userId),
    markAllAsRead: (userId) => notificationService.markAllAsRead(userId),
    deleteNotification: (notificationId, userId) => notificationService.deleteNotification(notificationId, userId),
    getUnreadNotificationCount: (userId) => notificationService.getUnreadNotificationCount(userId),
    scheduleNotification: (notification) => notificationService.scheduleNotification(notification),
    processScheduledNotifications: () => notificationService.processScheduledNotifications(),
    sendBulkNotifications: (userIds, notificationData) => notificationService.sendBulkNotifications(userIds, notificationData),
    setSocketIO: (io) => notificationService.setSocketIO(io),
    notificationService // Export the class instance for advanced usage
};
