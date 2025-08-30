/**
 * Email Service for Dental Appointment System
 * Handles all email operations including transactional emails, notifications, and campaigns
 */

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

class EmailService {
    constructor() {
        this.transporter = null;
        this.templates = new Map();
        this.initializeTransporter();
        this.loadTemplates();
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        try {
            // Configure based on environment
            if (process.env.NODE_ENV === 'production') {
                // Production - use service like SendGrid, AWS SES, etc.
                this.transporter = nodemailer.createTransporter({
                    service: process.env.EMAIL_SERVICE || 'SendGrid',
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD
                    },
                    pool: true,
                    maxConnections: 5,
                    maxMessages: 100
                });
            } else {
                // Development - use test service
                this.transporter = nodemailer.createTransporter({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: process.env.SMTP_PORT || 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
            }

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    logger.error('Email transporter verification failed:', error);
                } else {
                    logger.info('Email service initialized successfully');
                }
            });

        } catch (error) {
            logger.error('Failed to initialize email transporter:', error);
        }
    }

    /**
     * Load email templates
     */
    async loadTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../templates/emails');
            const templateFiles = await fs.readdir(templatesDir);

            for (const file of templateFiles) {
                if (file.endsWith('.html')) {
                    const templateName = path.basename(file, '.html');
                    const templatePath = path.join(templatesDir, file);
                    const templateContent = await fs.readFile(templatePath, 'utf8');
                    
                    // Compile handlebars template
                    const compiledTemplate = handlebars.compile(templateContent);
                    this.templates.set(templateName, compiledTemplate);
                }
            }

            logger.info(`Loaded ${this.templates.size} email templates`);

        } catch (error) {
            logger.error('Failed to load email templates:', error);
        }
    }

    /**
     * Send email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.template - Template name
     * @param {Object} options.data - Template data
     * @param {string} options.html - Raw HTML content
     * @param {string} options.text - Plain text content
     * @param {Array} options.attachments - Email attachments
     */
    async sendEmail(options) {
        try {
            const {
                to,
                cc,
                bcc,
                subject,
                template,
                data = {},
                html,
                text,
                attachments = [],
                priority = 'normal',
                replyTo
            } = options;

            if (!to || !subject) {
                throw new Error('Recipient and subject are required');
            }

            // Check rate limiting
            const rateLimitKey = `email_rate_limit:${to}`;
            const emailCount = await redisClient.get(rateLimitKey);
            
            if (emailCount && parseInt(emailCount) >= 10) { // Max 10 emails per hour
                throw new Error('Email rate limit exceeded');
            }

            let emailHtml = html;
            let emailText = text;

            // Use template if specified
            if (template && this.templates.has(template)) {
                const compiledTemplate = this.templates.get(template);
                emailHtml = compiledTemplate({
                    ...data,
                    companyName: process.env.COMPANY_NAME || 'Dental Care',
                    supportEmail: process.env.SUPPORT_EMAIL || 'support@dentalcare.com',
                    websiteUrl: process.env.FRONTEND_URL || 'https://dentalcare.com',
                    currentYear: new Date().getFullYear()
                });
            }

            // Prepare mail options
            const mailOptions = {
                from: {
                    name: process.env.FROM_NAME || 'Dental Care',
                    address: process.env.FROM_EMAIL || 'noreply@dentalcare.com'
                },
                to: Array.isArray(to) ? to.join(', ') : to,
                cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
                bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
                subject,
                html: emailHtml,
                text: emailText,
                attachments,
                replyTo: replyTo || process.env.REPLY_TO_EMAIL,
                priority: priority === 'high' ? 'high' : 'normal',
                headers: {
                    'X-Mailer': 'Dental Care System',
                    'X-Priority': priority === 'high' ? '1' : '3'
                }
            };

            // Send email
            const result = await this.transporter.sendMail(mailOptions);

            // Update rate limiting
            const currentCount = await redisClient.get(rateLimitKey) || 0;
            await redisClient.setex(rateLimitKey, 3600, parseInt(currentCount) + 1);

            // Log successful send
            logger.info('Email sent successfully', {
                messageId: result.messageId,
                to: to,
                subject: subject,
                template: template
            });

            // Store email in database for audit
            await this.logEmail({
                to,
                cc,
                bcc,
                subject,
                template,
                status: 'sent',
                messageId: result.messageId,
                sentAt: new Date(),
                data: JSON.stringify(data)
            });

            return {
                success: true,
                messageId: result.messageId,
                response: result.response
            };

        } catch (error) {
            logger.error('Email send error:', error);

            // Log failed email
            await this.logEmail({
                to: options.to,
                subject: options.subject,
                template: options.template,
                status: 'failed',
                error: error.message,
                sentAt: new Date()
            });

            throw error;
        }
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(user) {
        return this.sendEmail({
            to: user.contact.email,
            subject: 'Welcome to Dental Care!',
            template: 'welcome',
            data: {
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
                profileUrl: `${process.env.FRONTEND_URL}/profile`
            }
        });
    }

    /**
     * Send email verification
     */
    async sendEmailVerification(user, token) {
        return this.sendEmail({
            to: user.contact.email,
            subject: 'Verify Your Email Address',
            template: 'email-verification',
            data: {
                firstName: user.profile.firstName,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
                expiryHours: 24
            }
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(user, token) {
        return this.sendEmail({
            to: user.contact.email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            data: {
                firstName: user.profile.firstName,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
                expiryHours: 1
            }
        });
    }

    /**
     * Send appointment confirmation
     */
    async sendAppointmentConfirmation(appointment, patient, doctor, clinic) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return this.sendEmail({
            to: patient.userId.contact.email,
            subject: 'Appointment Confirmation',
            template: 'appointment-confirmation',
            data: {
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                doctorName: `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`,
                appointmentId: appointment.appointmentId,
                appointmentDate,
                appointmentTime: appointment.timeSlot.startTime,
                appointmentType: appointment.type,
                clinicName: clinic.name,
                clinicAddress: `${clinic.address.street}, ${clinic.address.city}, ${clinic.address.state} ${clinic.address.zipCode}`,
                clinicPhone: clinic.contact.phone,
                reason: appointment.reason,
                instructions: appointment.preparationInstructions || 'Please arrive 15 minutes early.',
                cancelUrl: `${process.env.FRONTEND_URL}/appointments/${appointment._id}/cancel`
            }
        });
    }

    /**
     * Send appointment reminder
     */
    async sendAppointmentReminder(appointment, patient, doctor, clinic, reminderType = '24h') {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const reminderTitles = {
            '24h': 'Appointment Reminder - Tomorrow',
            '2h': 'Appointment Reminder - Today',
            '30m': 'Appointment Starting Soon'
        };

        return this.sendEmail({
            to: patient.userId.contact.email,
            subject: reminderTitles[reminderType] || 'Appointment Reminder',
            template: 'appointment-reminder',
            data: {
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                doctorName: `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`,
                appointmentId: appointment.appointmentId,
                appointmentDate,
                appointmentTime: appointment.timeSlot.startTime,
                appointmentType: appointment.type,
                clinicName: clinic.name,
                clinicAddress: `${clinic.address.street}, ${clinic.address.city}, ${clinic.address.state} ${clinic.address.zipCode}`,
                clinicPhone: clinic.contact.phone,
                reminderType,
                instructions: appointment.preparationInstructions,
                rescheduleUrl: `${process.env.FRONTEND_URL}/appointments/${appointment._id}/reschedule`
            },
            priority: reminderType === '30m' ? 'high' : 'normal'
        });
    }

    /**
     * Send appointment cancellation
     */
    async sendAppointmentCancellation(appointment, patient, doctor, reason) {
        const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return this.sendEmail({
            to: patient.userId.contact.email,
            subject: 'Appointment Cancelled',
            template: 'appointment-cancellation',
            data: {
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                doctorName: `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`,
                appointmentId: appointment.appointmentId,
                appointmentDate,
                appointmentTime: appointment.timeSlot.startTime,
                reason: reason || 'No reason provided',
                bookNewUrl: `${process.env.FRONTEND_URL}/appointments/book`
            }
        });
    }

    /**
     * Send treatment plan email
     */
    async sendTreatmentPlan(patient, doctor, treatments, totalCost) {
        return this.sendEmail({
            to: patient.userId.contact.email,
            subject: 'Your Treatment Plan',
            template: 'treatment-plan',
            data: {
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                doctorName: `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`,
                treatments,
                totalCost,
                currency: 'USD',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                scheduleUrl: `${process.env.FRONTEND_URL}/appointments/book`
            },
            attachments: [
                {
                    filename: 'treatment-plan.pdf',
                    path: `/tmp/treatment-plan-${patient._id}.pdf`, // Generate PDF separately
                    contentType: 'application/pdf'
                }
            ]
        });
    }

    /**
     * Send invoice email
     */
    async sendInvoice(patient, invoice, clinic) {
        return this.sendEmail({
            to: patient.userId.contact.email,
            subject: `Invoice #${invoice.invoiceNumber}`,
            template: 'invoice',
            data: {
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.createdAt.toLocaleDateString(),
                dueDate: invoice.dueDate.toLocaleDateString(),
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                total: invoice.total,
                amountDue: invoice.amountDue,
                clinicName: clinic.name,
                clinicAddress: `${clinic.address.street}, ${clinic.address.city}, ${clinic.address.state} ${clinic.address.zipCode}`,
                paymentUrl: `${process.env.FRONTEND_URL}/invoices/${invoice._id}/pay`
            },
            attachments: [
                {
                    filename: `invoice-${invoice.invoiceNumber}.pdf`,
                    path: `/tmp/invoice-${invoice._id}.pdf`, // Generate PDF separately
                    contentType: 'application/pdf'
                }
            ]
        });
    }

    /**
     * Send newsletter/marketing email
     */
    async sendNewsletter(recipients, subject, content, template = 'newsletter') {
        const results = [];

        for (const recipient of recipients) {
            try {
                const result = await this.sendEmail({
                    to: recipient.email,
                    subject,
                    template,
                    data: {
                        firstName: recipient.firstName,
                        lastName: recipient.lastName,
                        content,
                        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${recipient.unsubscribeToken}`
                    }
                });
                results.push({ email: recipient.email, success: true, messageId: result.messageId });
            } catch (error) {
                results.push({ email: recipient.email, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Send bulk emails (for campaigns)
     */
    async sendBulkEmails(emailList, subject, template, data = {}) {
        const batchSize = 50; // Send in batches to avoid overwhelming the server
        const results = [];

        for (let i = 0; i < emailList.length; i += batchSize) {
            const batch = emailList.slice(i, i + batchSize);
            const batchPromises = batch.map(async (email) => {
                try {
                    const result = await this.sendEmail({
                        to: email.address,
                        subject,
                        template,
                        data: {
                            ...data,
                            firstName: email.firstName,
                            lastName: email.lastName,
                            customData: email.customData
                        }
                    });
                    return { email: email.address, success: true, messageId: result.messageId };
                } catch (error) {
                    return { email: email.address, success: false, error: error.message };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Add delay between batches to respect rate limits
            if (i + batchSize < emailList.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }

    /**
     * Log email to database
     */
    async logEmail(emailData) {
        try {
            // This would typically save to an EmailLog model
            // For now, we'll just log to Redis for basic tracking
            const logKey = `email_log:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
            await redisClient.setex(logKey, 86400 * 30, JSON.stringify(emailData)); // Keep for 30 days
        } catch (error) {
            logger.error('Failed to log email:', error);
        }
    }

    /**
     * Get email statistics
     */
    async getEmailStats(startDate, endDate) {
        try {
            // This would typically query the EmailLog model
            // For now, return mock stats
            return {
                totalSent: 1250,
                totalDelivered: 1200,
                totalBounced: 30,
                totalOpened: 850,
                totalClicked: 320,
                deliveryRate: 96,
                openRate: 70.8,
                clickRate: 37.6
            };
        } catch (error) {
            logger.error('Failed to get email stats:', error);
            return null;
        }
    }

    /**
     * Validate email address
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Test email configuration
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service is working correctly' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Create singleton instance
const emailService = new EmailService();

// Export methods for easy import
module.exports = {
    sendEmail: (options) => emailService.sendEmail(options),
    sendWelcomeEmail: (user) => emailService.sendWelcomeEmail(user),
    sendEmailVerification: (user, token) => emailService.sendEmailVerification(user, token),
    sendPasswordReset: (user, token) => emailService.sendPasswordReset(user, token),
    sendAppointmentConfirmation: (appointment, patient, doctor, clinic) => 
        emailService.sendAppointmentConfirmation(appointment, patient, doctor, clinic),
    sendAppointmentReminder: (appointment, patient, doctor, clinic, reminderType) =>
        emailService.sendAppointmentReminder(appointment, patient, doctor, clinic, reminderType),
    sendAppointmentCancellation: (appointment, patient, doctor, reason) =>
        emailService.sendAppointmentCancellation(appointment, patient, doctor, reason),
    sendTreatmentPlan: (patient, doctor, treatments, totalCost) =>
        emailService.sendTreatmentPlan(patient, doctor, treatments, totalCost),
    sendInvoice: (patient, invoice, clinic) => emailService.sendInvoice(patient, invoice, clinic),
    sendNewsletter: (recipients, subject, content, template) =>
        emailService.sendNewsletter(recipients, subject, content, template),
    sendBulkEmails: (emailList, subject, template, data) =>
        emailService.sendBulkEmails(emailList, subject, template, data),
    getEmailStats: (startDate, endDate) => emailService.getEmailStats(startDate, endDate),
    validateEmail: (email) => emailService.validateEmail(email),
    testConnection: () => emailService.testConnection(),
    emailService // Export the class instance for advanced usage
};
