/**
 * User Controller for Dental Appointment System
 * Handles all user-related operations including authentication, profile management, and CRUD operations
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const redisClient = require('../config/redis');

class UserController {
    /**
     * Register a new user
     * @route POST /api/users/register
     * @access Public
     */
    static async register(req, res) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                email,
                password,
                firstName,
                lastName,
                phone,
                role,
                dateOfBirth,
                gender,
                acceptedTerms
            } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { 'contact.email': email },
                    { 'contact.phone': phone }
                ]
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email or phone already exists'
                });
            }

            // Create new user
            const userData = {
                profile: {
                    firstName,
                    lastName,
                    dateOfBirth,
                    gender
                },
                contact: {
                    email,
                    phone,
                    emailVerified: false,
                    phoneVerified: false
                },
                auth: {
                    password,
                    role: role || 'patient',
                    isActive: true,
                    acceptedTerms,
                    acceptedTermsDate: acceptedTerms ? new Date() : null
                },
                preferences: {
                    language: req.headers['accept-language']?.split(',')[0] || 'en',
                    timezone: req.body.timezone || 'America/New_York'
                }
            };

            const user = new User(userData);
            await user.save();

            // Generate email verification token
            const emailVerificationToken = user.generateEmailVerificationToken();
            await user.save();

            // Send verification email
            try {
                await sendEmail({
                    to: email,
                    subject: 'Verify Your Email Address',
                    template: 'email-verification',
                    data: {
                        firstName,
                        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
                    }
                });
            } catch (emailError) {
                logger.error('Failed to send verification email:', emailError);
            }

            // Generate JWT token for immediate login
            const token = user.generateAuthToken();

            // Log user registration
            logger.info('User registered successfully', {
                userId: user._id,
                email: user.contact.email,
                role: user.auth.role,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Remove sensitive data from response
            const userResponse = user.toObject();
            delete userResponse.auth.password;
            delete userResponse.auth.passwordResetToken;
            delete userResponse.auth.emailVerificationToken;

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email for verification.',
                data: {
                    user: userResponse,
                    token,
                    expiresIn: process.env.JWT_EXPIRE
                }
            });

        } catch (error) {
            logger.error('User registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Login user
     * @route POST /api/users/login
     * @access Public
     */
    static async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password, rememberMe } = req.body;

            // Find user by email
            const user = await User.findOne({ 'contact.email': email }).select('+auth.password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if account is active
            if (!user.auth.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Check if account is locked
            if (user.auth.lockUntil && user.auth.lockUntil > Date.now()) {
                return res.status(423).json({
                    success: false,
                    message: 'Account is temporarily locked due to multiple failed login attempts'
                });
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            
            if (!isPasswordValid) {
                // Increment failed login attempts
                user.auth.failedLoginAttempts = (user.auth.failedLoginAttempts || 0) + 1;
                
                // Lock account after 5 failed attempts
                if (user.auth.failedLoginAttempts >= 5) {
                    user.auth.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                    await user.save();
                    
                    logger.warn('Account locked due to failed login attempts', {
                        userId: user._id,
                        email: user.contact.email,
                        ip: req.ip
                    });
                    
                    return res.status(423).json({
                        success: false,
                        message: 'Account locked due to multiple failed login attempts'
                    });
                }
                
                await user.save();
                
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Reset failed login attempts on successful login
            user.auth.failedLoginAttempts = 0;
            user.auth.lockUntil = null;
            user.auth.lastLogin = new Date();
            user.auth.lastLoginIP = req.ip;

            // Generate tokens
            const token = user.generateAuthToken(rememberMe);
            const refreshToken = user.generateRefreshToken();
            
            // Store refresh token
            user.auth.refreshTokens.push({
                token: refreshToken,
                createdAt: new Date(),
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip
            });

            await user.save();

            // Store session in Redis
            const sessionData = {
                userId: user._id,
                email: user.contact.email,
                role: user.auth.role,
                loginTime: new Date(),
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            };

            await redisClient.setex(
                `session:${user._id}:${token.split('.')[2]}`,
                rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
                JSON.stringify(sessionData)
            );

            // Log successful login
            logger.info('User logged in successfully', {
                userId: user._id,
                email: user.contact.email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Update login analytics
            await User.updateOne(
                { _id: user._id },
                {
                    $inc: { 'analytics.totalLogins': 1 },
                    $set: { 'analytics.lastActivity': new Date() }
                }
            );

            // Remove sensitive data
            const userResponse = user.toObject();
            delete userResponse.auth.password;
            delete userResponse.auth.passwordResetToken;
            delete userResponse.auth.emailVerificationToken;
            delete userResponse.auth.refreshTokens;

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token,
                    refreshToken,
                    expiresIn: rememberMe ? '30d' : '1d'
                }
            });

        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Logout user
     * @route POST /api/users/logout
     * @access Private
     */
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const user = req.user;

            // Remove refresh token from user record
            if (refreshToken) {
                user.auth.refreshTokens = user.auth.refreshTokens.filter(
                    rt => rt.token !== refreshToken
                );
                await user.save();
            }

            // Remove session from Redis
            const tokenPart = req.token.split('.')[2];
            await redisClient.del(`session:${user._id}:${tokenPart}`);

            // Log logout
            logger.info('User logged out', {
                userId: user._id,
                email: user.contact.email,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }
    }

    /**
     * Refresh authentication token
     * @route POST /api/users/refresh-token
     * @access Public
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if refresh token exists in user's tokens
            const tokenExists = user.auth.refreshTokens.some(rt => rt.token === refreshToken);
            if (!tokenExists) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const newToken = user.generateAuthToken();

            res.json({
                success: true,
                data: {
                    token: newToken,
                    expiresIn: process.env.JWT_EXPIRE
                }
            });

        } catch (error) {
            logger.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }

    /**
     * Get current user profile
     * @route GET /api/users/me
     * @access Private
     */
    static async getMe(req, res) {
        try {
            const user = await User.findById(req.user._id)
                .populate('profile.emergencyContact.userId', 'profile.firstName profile.lastName contact.phone')
                .select('-auth.password -auth.passwordResetToken -auth.emailVerificationToken -auth.refreshTokens');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving profile'
            });
        }
    }

    /**
     * Update user profile
     * @route PUT /api/users/me
     * @access Private
     */
    static async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const user = req.user;
            const updates = req.body;

            // Prevent updating sensitive fields
            delete updates.auth;
            delete updates._id;
            delete updates.createdAt;
            delete updates.updatedAt;

            // Handle profile picture upload
            if (req.file) {
                try {
                    const result = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'dental/profiles',
                        public_id: `profile_${user._id}`,
                        overwrite: true,
                        transformation: [
                            { width: 300, height: 300, crop: 'fill' },
                            { quality: 'auto' }
                        ]
                    });

                    updates.profile = updates.profile || {};
                    updates.profile.profilePicture = result.secure_url;
                } catch (uploadError) {
                    logger.error('Profile picture upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to upload profile picture'
                    });
                }
            }

            // Update user
            Object.assign(user, updates);
            await user.save();

            // Log profile update
            logger.info('Profile updated', {
                userId: user._id,
                updatedFields: Object.keys(updates),
                ip: req.ip
            });

            // Remove sensitive data
            const userResponse = user.toObject();
            delete userResponse.auth.password;
            delete userResponse.auth.passwordResetToken;
            delete userResponse.auth.emailVerificationToken;
            delete userResponse.auth.refreshTokens;

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: userResponse
            });

        } catch (error) {
            logger.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Change password
     * @route PUT /api/users/change-password
     * @access Private
     */
    static async changePassword(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user._id).select('+auth.password');

            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Check if new password is different from current
            const isSamePassword = await user.comparePassword(newPassword);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password'
                });
            }

            // Update password
            user.auth.password = newPassword;
            user.auth.passwordChangedAt = new Date();
            
            // Invalidate all refresh tokens for security
            user.auth.refreshTokens = [];
            
            await user.save();

            // Log password change
            logger.info('Password changed', {
                userId: user._id,
                email: user.contact.email,
                ip: req.ip
            });

            // Send notification email
            try {
                await sendEmail({
                    to: user.contact.email,
                    subject: 'Password Changed Successfully',
                    template: 'password-changed',
                    data: {
                        firstName: user.profile.firstName,
                        changeTime: new Date(),
                        ipAddress: req.ip
                    }
                });
            } catch (emailError) {
                logger.error('Failed to send password change notification:', emailError);
            }

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            logger.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password'
            });
        }
    }

    /**
     * Request password reset
     * @route POST /api/users/forgot-password
     * @access Public
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ 'contact.email': email });
            if (!user) {
                // Don't reveal that email doesn't exist
                return res.json({
                    success: true,
                    message: 'If an account with that email exists, we have sent a password reset link.'
                });
            }

            // Generate reset token
            const resetToken = user.generatePasswordResetToken();
            await user.save();

            // Send reset email
            try {
                await sendEmail({
                    to: email,
                    subject: 'Password Reset Request',
                    template: 'password-reset',
                    data: {
                        firstName: user.profile.firstName,
                        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
                        expiryTime: '1 hour'
                    }
                });

                logger.info('Password reset email sent', {
                    userId: user._id,
                    email: email,
                    ip: req.ip
                });

            } catch (emailError) {
                logger.error('Failed to send password reset email:', emailError);
                user.auth.passwordResetToken = undefined;
                user.auth.passwordResetExpires = undefined;
                await user.save();

                return res.status(500).json({
                    success: false,
                    message: 'Failed to send password reset email'
                });
            }

            res.json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.'
            });

        } catch (error) {
            logger.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing password reset request'
            });
        }
    }

    /**
     * Reset password
     * @route POST /api/users/reset-password
     * @access Public
     */
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Hash the token to compare with stored hash
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                'auth.passwordResetToken': hashedToken,
                'auth.passwordResetExpires': { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired password reset token'
                });
            }

            // Set new password
            user.auth.password = newPassword;
            user.auth.passwordResetToken = undefined;
            user.auth.passwordResetExpires = undefined;
            user.auth.passwordChangedAt = new Date();
            
            // Invalidate all refresh tokens
            user.auth.refreshTokens = [];

            await user.save();

            // Log password reset
            logger.info('Password reset successfully', {
                userId: user._id,
                email: user.contact.email,
                ip: req.ip
            });

            // Send confirmation email
            try {
                await sendEmail({
                    to: user.contact.email,
                    subject: 'Password Reset Successful',
                    template: 'password-reset-success',
                    data: {
                        firstName: user.profile.firstName,
                        resetTime: new Date()
                    }
                });
            } catch (emailError) {
                logger.error('Failed to send password reset confirmation:', emailError);
            }

            res.json({
                success: true,
                message: 'Password reset successfully'
            });

        } catch (error) {
            logger.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password'
            });
        }
    }

    /**
     * Verify email address
     * @route POST /api/users/verify-email
     * @access Public
     */
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                'auth.emailVerificationToken': hashedToken,
                'auth.emailVerificationExpires': { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token'
                });
            }

            // Verify email
            user.contact.emailVerified = true;
            user.contact.emailVerifiedAt = new Date();
            user.auth.emailVerificationToken = undefined;
            user.auth.emailVerificationExpires = undefined;

            await user.save();

            logger.info('Email verified', {
                userId: user._id,
                email: user.contact.email,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Email verified successfully'
            });

        } catch (error) {
            logger.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying email'
            });
        }
    }

    /**
     * Resend email verification
     * @route POST /api/users/resend-verification
     * @access Private
     */
    static async resendEmailVerification(req, res) {
        try {
            const user = req.user;

            if (user.contact.emailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified'
                });
            }

            // Generate new verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            // Send verification email
            try {
                await sendEmail({
                    to: user.contact.email,
                    subject: 'Verify Your Email Address',
                    template: 'email-verification',
                    data: {
                        firstName: user.profile.firstName,
                        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
                    }
                });

                res.json({
                    success: true,
                    message: 'Verification email sent successfully'
                });

            } catch (emailError) {
                logger.error('Failed to send verification email:', emailError);
                res.status(500).json({
                    success: false,
                    message: 'Failed to send verification email'
                });
            }

        } catch (error) {
            logger.error('Resend verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resending verification email'
            });
        }
    }

    /**
     * Enable two-factor authentication
     * @route POST /api/users/enable-2fa
     * @access Private
     */
    static async enableTwoFactorAuth(req, res) {
        try {
            const user = req.user;
            const { method, phoneNumber } = req.body;

            if (user.auth.twoFactorAuth.enabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Two-factor authentication is already enabled'
                });
            }

            if (method === 'sms' && phoneNumber) {
                user.auth.twoFactorAuth.phoneNumber = phoneNumber;
            }

            user.auth.twoFactorAuth.method = method;
            user.auth.twoFactorAuth.enabled = true;
            user.auth.twoFactorAuth.enabledAt = new Date();

            await user.save();

            logger.info('2FA enabled', {
                userId: user._id,
                method: method,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Two-factor authentication enabled successfully'
            });

        } catch (error) {
            logger.error('Enable 2FA error:', error);
            res.status(500).json({
                success: false,
                message: 'Error enabling two-factor authentication'
            });
        }
    }

    /**
     * Disable two-factor authentication
     * @route POST /api/users/disable-2fa
     * @access Private
     */
    static async disableTwoFactorAuth(req, res) {
        try {
            const user = req.user;
            const { password } = req.body;

            // Verify password before disabling 2FA
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid password'
                });
            }

            user.auth.twoFactorAuth.enabled = false;
            user.auth.twoFactorAuth.method = null;
            user.auth.twoFactorAuth.phoneNumber = null;
            user.auth.twoFactorAuth.backupCodes = [];

            await user.save();

            logger.info('2FA disabled', {
                userId: user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Two-factor authentication disabled successfully'
            });

        } catch (error) {
            logger.error('Disable 2FA error:', error);
            res.status(500).json({
                success: false,
                message: 'Error disabling two-factor authentication'
            });
        }
    }

    /**
     * Get all users (Admin only)
     * @route GET /api/users
     * @access Private/Admin
     */
    static async getAllUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                role,
                status,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Build query
            const query = {};

            if (search) {
                query.$or = [
                    { 'profile.firstName': { $regex: search, $options: 'i' } },
                    { 'profile.lastName': { $regex: search, $options: 'i' } },
                    { 'contact.email': { $regex: search, $options: 'i' } },
                    { 'contact.phone': { $regex: search, $options: 'i' } }
                ];
            }

            if (role) {
                query['auth.role'] = role;
            }

            if (status) {
                query['auth.isActive'] = status === 'active';
            }

            // Sort options
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query with pagination
            const users = await User.find(query)
                .select('-auth.password -auth.passwordResetToken -auth.emailVerificationToken -auth.refreshTokens')
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('profile.emergencyContact.userId', 'profile.firstName profile.lastName contact.phone');

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving users'
            });
        }
    }

    /**
     * Get user by ID (Admin only)
     * @route GET /api/users/:id
     * @access Private/Admin
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id)
                .select('-auth.password -auth.passwordResetToken -auth.emailVerificationToken -auth.refreshTokens')
                .populate('profile.emergencyContact.userId', 'profile.firstName profile.lastName contact.phone');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            logger.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user'
            });
        }
    }

    /**
     * Update user (Admin only)
     * @route PUT /api/users/:id
     * @access Private/Admin
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Prevent updating sensitive fields
            delete updates.auth?.password;
            delete updates._id;
            delete updates.createdAt;
            delete updates.updatedAt;

            const user = await User.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).select('-auth.password -auth.passwordResetToken -auth.emailVerificationToken -auth.refreshTokens');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            logger.info('User updated by admin', {
                adminId: req.user._id,
                targetUserId: id,
                updatedFields: Object.keys(updates),
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'User updated successfully',
                data: user
            });

        } catch (error) {
            logger.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating user'
            });
        }
    }

    /**
     * Delete user (Admin only)
     * @route DELETE /api/users/:id
     * @access Private/Admin
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Soft delete - deactivate instead of removing
            const user = await User.findByIdAndUpdate(
                id,
                {
                    'auth.isActive': false,
                    'auth.deactivatedAt': new Date(),
                    'auth.deactivatedBy': req.user._id
                },
                { new: true }
            ).select('-auth.password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            logger.info('User deactivated by admin', {
                adminId: req.user._id,
                targetUserId: id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'User deactivated successfully'
            });

        } catch (error) {
            logger.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deactivating user'
            });
        }
    }

    /**
     * Get user analytics (Admin only)
     * @route GET /api/users/analytics
     * @access Private/Admin
     */
    static async getUserAnalytics(req, res) {
        try {
            const { startDate, endDate, role } = req.query;

            const matchStage = {};
            if (startDate && endDate) {
                matchStage.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (role) {
                matchStage['auth.role'] = role;
            }

            const analytics = await User.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: ['$auth.isActive', 1, 0] }
                        },
                        verifiedEmails: {
                            $sum: { $cond: ['$contact.emailVerified', 1, 0] }
                        },
                        verifiedPhones: {
                            $sum: { $cond: ['$contact.phoneVerified', 1, 0] }
                        },
                        twoFactorEnabled: {
                            $sum: { $cond: ['$auth.twoFactorAuth.enabled', 1, 0] }
                        },
                        roleDistribution: {
                            $push: '$auth.role'
                        },
                        genderDistribution: {
                            $push: '$profile.gender'
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalUsers: 1,
                        activeUsers: 1,
                        verifiedEmails: 1,
                        verifiedPhones: 1,
                        twoFactorEnabled: 1,
                        emailVerificationRate: {
                            $multiply: [
                                { $divide: ['$verifiedEmails', '$totalUsers'] },
                                100
                            ]
                        },
                        phoneVerificationRate: {
                            $multiply: [
                                { $divide: ['$verifiedPhones', '$totalUsers'] },
                                100
                            ]
                        },
                        twoFactorAdoptionRate: {
                            $multiply: [
                                { $divide: ['$twoFactorEnabled', '$totalUsers'] },
                                100
                            ]
                        }
                    }
                }
            ]);

            res.json({
                success: true,
                data: analytics[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    verifiedEmails: 0,
                    verifiedPhones: 0,
                    twoFactorEnabled: 0,
                    emailVerificationRate: 0,
                    phoneVerificationRate: 0,
                    twoFactorAdoptionRate: 0
                }
            });

        } catch (error) {
            logger.error('Get user analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user analytics'
            });
        }
    }
}

module.exports = UserController;
