/**
 * Appointment Controller for Dental Appointment System
 * Handles all appointment-related operations including scheduling, management, and analytics
 */

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { createNotification } = require('../services/notificationService');
const moment = require('moment-timezone');

class AppointmentController {
    /**
     * Create a new appointment
     * @route POST /api/appointments
     * @access Private
     */
    static async createAppointment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                patientId,
                doctorId,
                clinicId,
                appointmentDate,
                timeSlot,
                type,
                reason,
                symptoms,
                chiefComplaint,
                services,
                isEmergency,
                priority,
                insurance,
                specialInstructions
            } = req.body;

            // Validate that the appointment date is in the future
            const appointmentDateTime = new Date(appointmentDate);
            const [hours, minutes] = timeSlot.startTime.split(':');
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

            if (appointmentDateTime <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment must be scheduled for a future date and time'
                });
            }

            // Check if patient exists
            const patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            // Check if doctor exists and is available
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            if (!doctor.isAvailable || doctor.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor is not available for appointments'
                });
            }

            // Check if clinic exists
            const clinic = await Clinic.findById(clinicId);
            if (!clinic || clinic.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    message: 'Clinic not found or inactive'
                });
            }

            // Check for conflicts - doctor availability
            const conflictingAppointment = await Appointment.findOne({
                doctorId,
                appointmentDate: {
                    $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
                    $lt: new Date(appointmentDate).setHours(23, 59, 59, 999)
                },
                status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
                $or: [
                    {
                        'timeSlot.startTime': { $lt: timeSlot.endTime },
                        'timeSlot.endTime': { $gt: timeSlot.startTime }
                    }
                ]
            });

            if (conflictingAppointment) {
                return res.status(409).json({
                    success: false,
                    message: 'Doctor is not available at the requested time',
                    conflictingAppointment: {
                        id: conflictingAppointment.appointmentId,
                        timeSlot: conflictingAppointment.timeSlot
                    }
                });
            }

            // Check clinic operating hours
            const dayOfWeek = moment(appointmentDate).format('dddd').toLowerCase();
            const clinicHours = clinic.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
            
            if (!clinicHours || !clinicHours.isOpen) {
                return res.status(400).json({
                    success: false,
                    message: 'Clinic is closed on the selected day'
                });
            }

            if (timeSlot.startTime < clinicHours.openTime || timeSlot.endTime > clinicHours.closeTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment time is outside clinic operating hours',
                    clinicHours: {
                        openTime: clinicHours.openTime,
                        closeTime: clinicHours.closeTime
                    }
                });
            }

            // Calculate appointment duration
            const startTime = moment(timeSlot.startTime, 'HH:mm');
            const endTime = moment(timeSlot.endTime, 'HH:mm');
            const duration = endTime.diff(startTime, 'minutes');

            // Create appointment
            const appointmentData = {
                patientId,
                doctorId,
                clinicId,
                appointmentDate,
                timeSlot: {
                    ...timeSlot,
                    duration
                },
                type,
                category: AppointmentController.getAppointmentCategory(type),
                reason,
                symptoms: symptoms || [],
                chiefComplaint,
                services: services || [],
                isEmergency: isEmergency || false,
                priority: isEmergency ? 'emergency' : (priority || 'normal'),
                status: isEmergency ? 'confirmed' : 'scheduled',
                specialInstructions,
                insurance: insurance || {},
                participants: [
                    {
                        userId: patientId,
                        role: 'patient',
                        status: 'confirmed'
                    },
                    {
                        userId: doctorId,
                        role: 'doctor',
                        status: 'confirmed'
                    }
                ],
                metadata: {
                    createdBy: req.user._id,
                    source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web'
                },
                analytics: {
                    bookingSource: req.body.bookingSource || 'online',
                    bookingTime: new Date()
                }
            };

            const appointment = new Appointment(appointmentData);
            
            // Calculate risk factors
            appointment.calculateRisk();
            
            await appointment.save();

            // Create notifications
            await AppointmentController.sendAppointmentNotifications(appointment, 'created');

            // Update patient's appointment history
            await Patient.findByIdAndUpdate(patientId, {
                $push: { 'analytics.appointmentHistory': appointment._id },
                $inc: { 'analytics.totalAppointments': 1 }
            });

            // Update doctor's schedule
            await Doctor.findByIdAndUpdate(doctorId, {
                $inc: { 'analytics.totalAppointments': 1 }
            });

            // Populate response data
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('patientId', 'profile contact')
                .populate('doctorId', 'profile specialty')
                .populate('clinicId', 'name address contact');

            logger.info('Appointment created', {
                appointmentId: appointment.appointmentId,
                patientId,
                doctorId,
                clinicId,
                createdBy: req.user._id,
                ip: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Appointment created successfully',
                data: populatedAppointment
            });

        } catch (error) {
            logger.error('Create appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get appointments with filtering and pagination
     * @route GET /api/appointments
     * @access Private
     */
    static async getAppointments(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                patientId,
                doctorId,
                clinicId,
                status,
                type,
                priority,
                startDate,
                endDate,
                isEmergency,
                search,
                sortBy = 'appointmentDate',
                sortOrder = 'asc'
            } = req.query;

            // Build query based on user role
            let query = {};

            // Role-based filtering
            if (req.user.auth.role === 'patient') {
                query.patientId = req.user._id;
            } else if (req.user.auth.role === 'doctor') {
                query.doctorId = req.user._id;
            } else if (req.user.auth.role === 'receptionist' || req.user.auth.role === 'assistant') {
                // They can see appointments for their clinic
                const userClinics = req.user.clinics || [];
                if (userClinics.length > 0) {
                    query.clinicId = { $in: userClinics };
                }
            }

            // Apply additional filters
            if (patientId) query.patientId = patientId;
            if (doctorId) query.doctorId = doctorId;
            if (clinicId) query.clinicId = clinicId;
            if (status) query.status = status;
            if (type) query.type = type;
            if (priority) query.priority = priority;
            if (isEmergency !== undefined) query.isEmergency = isEmergency === 'true';

            // Date range filtering
            if (startDate && endDate) {
                query.appointmentDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (startDate) {
                query.appointmentDate = { $gte: new Date(startDate) };
            } else if (endDate) {
                query.appointmentDate = { $lte: new Date(endDate) };
            }

            // Search functionality
            if (search) {
                query.$or = [
                    { appointmentId: { $regex: search, $options: 'i' } },
                    { reason: { $regex: search, $options: 'i' } },
                    { chiefComplaint: { $regex: search, $options: 'i' } },
                    { symptoms: { $in: [new RegExp(search, 'i')] } }
                ];
            }

            // Sort options
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query with pagination
            const appointments = await Appointment.find(query)
                .populate('patientId', 'profile contact insurance')
                .populate('doctorId', 'profile specialty contact')
                .populate('clinicId', 'name address contact')
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Appointment.countDocuments(query);

            res.json({
                success: true,
                data: {
                    appointments,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total,
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            logger.error('Get appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving appointments'
            });
        }
    }

    /**
     * Get appointment by ID
     * @route GET /api/appointments/:id
     * @access Private
     */
    static async getAppointmentById(req, res) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id)
                .populate('patientId', 'profile contact medicalHistory insurance')
                .populate('doctorId', 'profile specialty contact schedule')
                .populate('clinicId', 'name address contact operatingHours')
                .populate('participants.userId', 'profile contact')
                .populate('treatments.treatmentId')
                .populate('prescriptions.prescriptionId');

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check access permissions
            const hasAccess = AppointmentController.checkAppointmentAccess(appointment, req.user);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: appointment
            });

        } catch (error) {
            logger.error('Get appointment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving appointment'
            });
        }
    }

    /**
     * Update appointment
     * @route PUT /api/appointments/:id
     * @access Private
     */
    static async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check access permissions
            const hasAccess = AppointmentController.checkAppointmentAccess(appointment, req.user);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prevent updating certain fields based on appointment status
            if (['completed', 'cancelled'].includes(appointment.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update completed or cancelled appointments'
                });
            }

            // If updating date/time, check for conflicts
            if (updates.appointmentDate || updates.timeSlot) {
                const newDate = updates.appointmentDate || appointment.appointmentDate;
                const newTimeSlot = updates.timeSlot || appointment.timeSlot;

                const conflictingAppointment = await Appointment.findOne({
                    _id: { $ne: id },
                    doctorId: appointment.doctorId,
                    appointmentDate: {
                        $gte: new Date(newDate).setHours(0, 0, 0, 0),
                        $lt: new Date(newDate).setHours(23, 59, 59, 999)
                    },
                    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
                    $or: [
                        {
                            'timeSlot.startTime': { $lt: newTimeSlot.endTime },
                            'timeSlot.endTime': { $gt: newTimeSlot.startTime }
                        }
                    ]
                });

                if (conflictingAppointment) {
                    return res.status(409).json({
                        success: false,
                        message: 'Doctor is not available at the requested time'
                    });
                }
            }

            // Update appointment
            Object.assign(appointment, updates);
            appointment.metadata.lastModifiedBy = req.user._id;
            
            await appointment.save();

            // Send notifications if significant changes were made
            const significantFields = ['appointmentDate', 'timeSlot', 'doctorId', 'status'];
            const hasSignificantChange = significantFields.some(field => updates[field] !== undefined);
            
            if (hasSignificantChange) {
                await AppointmentController.sendAppointmentNotifications(appointment, 'updated');
            }

            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('patientId', 'profile contact')
                .populate('doctorId', 'profile specialty')
                .populate('clinicId', 'name address contact');

            logger.info('Appointment updated', {
                appointmentId: appointment.appointmentId,
                updatedBy: req.user._id,
                updatedFields: Object.keys(updates),
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Appointment updated successfully',
                data: populatedAppointment
            });

        } catch (error) {
            logger.error('Update appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating appointment'
            });
        }
    }

    /**
     * Cancel appointment
     * @route PUT /api/appointments/:id/cancel
     * @access Private
     */
    static async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { reason, refundAmount } = req.body;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check access permissions
            const hasAccess = AppointmentController.checkAppointmentAccess(appointment, req.user);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (appointment.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment is already cancelled'
                });
            }

            if (!appointment.canCancel) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment cannot be cancelled at this time'
                });
            }

            // Cancel the appointment
            appointment.cancel(reason, req.user._id, refundAmount);
            await appointment.save();

            // Send notifications
            await AppointmentController.sendAppointmentNotifications(appointment, 'cancelled');

            // Update analytics
            await Patient.findByIdAndUpdate(appointment.patientId, {
                $inc: { 'analytics.cancelledAppointments': 1 }
            });

            logger.info('Appointment cancelled', {
                appointmentId: appointment.appointmentId,
                reason,
                cancelledBy: req.user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: appointment
            });

        } catch (error) {
            logger.error('Cancel appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling appointment'
            });
        }
    }

    /**
     * Reschedule appointment
     * @route PUT /api/appointments/:id/reschedule
     * @access Private
     */
    static async rescheduleAppointment(req, res) {
        try {
            const { id } = req.params;
            const { newDate, newTimeSlot, reason } = req.body;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check access permissions
            const hasAccess = AppointmentController.checkAppointmentAccess(appointment, req.user);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (!appointment.canReschedule) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment cannot be rescheduled at this time'
                });
            }

            // Check for conflicts with new time
            const conflictingAppointment = await Appointment.findOne({
                _id: { $ne: id },
                doctorId: appointment.doctorId,
                appointmentDate: {
                    $gte: new Date(newDate).setHours(0, 0, 0, 0),
                    $lt: new Date(newDate).setHours(23, 59, 59, 999)
                },
                status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
                $or: [
                    {
                        'timeSlot.startTime': { $lt: newTimeSlot.endTime },
                        'timeSlot.endTime': { $gt: newTimeSlot.startTime }
                    }
                ]
            });

            if (conflictingAppointment) {
                return res.status(409).json({
                    success: false,
                    message: 'Doctor is not available at the requested time'
                });
            }

            // Reschedule the appointment
            appointment.reschedule(newDate, newTimeSlot, reason, req.user._id);
            await appointment.save();

            // Send notifications
            await AppointmentController.sendAppointmentNotifications(appointment, 'rescheduled');

            logger.info('Appointment rescheduled', {
                appointmentId: appointment.appointmentId,
                newDate,
                newTimeSlot,
                reason,
                rescheduledBy: req.user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Appointment rescheduled successfully',
                data: appointment
            });

        } catch (error) {
            logger.error('Reschedule appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error rescheduling appointment'
            });
        }
    }

    /**
     * Check-in patient for appointment
     * @route PUT /api/appointments/:id/checkin
     * @access Private
     */
    static async checkInAppointment(req, res) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Only confirmed appointments can be checked in'
                });
            }

            // Check if appointment is for today
            const today = new Date().toDateString();
            const appointmentDate = new Date(appointment.appointmentDate).toDateString();
            
            if (appointmentDate !== today) {
                return res.status(400).json({
                    success: false,
                    message: 'Can only check in appointments for today'
                });
            }

            // Check in the patient
            appointment.checkIn(req.user._id);
            await appointment.save();

            // Create notification for doctor
            await createNotification({
                userId: appointment.doctorId,
                type: 'appointment',
                title: 'Patient Checked In',
                message: `Patient has checked in for appointment ${appointment.appointmentId}`,
                data: { appointmentId: appointment._id }
            });

            logger.info('Patient checked in', {
                appointmentId: appointment.appointmentId,
                checkedInBy: req.user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Patient checked in successfully',
                data: appointment
            });

        } catch (error) {
            logger.error('Check-in appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking in patient'
            });
        }
    }

    /**
     * Start treatment for appointment
     * @route PUT /api/appointments/:id/start-treatment
     * @access Private
     */
    static async startTreatment(req, res) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status !== 'checked_in') {
                return res.status(400).json({
                    success: false,
                    message: 'Patient must be checked in before starting treatment'
                });
            }

            // Start treatment
            appointment.startTreatment(req.user._id);
            await appointment.save();

            logger.info('Treatment started', {
                appointmentId: appointment.appointmentId,
                startedBy: req.user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Treatment started successfully',
                data: appointment
            });

        } catch (error) {
            logger.error('Start treatment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error starting treatment'
            });
        }
    }

    /**
     * Complete appointment
     * @route PUT /api/appointments/:id/complete
     * @access Private
     */
    static async completeAppointment(req, res) {
        try {
            const { id } = req.params;
            const { totalTime, notes, followUpRequired } = req.body;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (appointment.status !== 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Only appointments in progress can be completed'
                });
            }

            // Complete the appointment
            appointment.complete(req.user._id, totalTime);
            
            if (notes) {
                appointment.addNote(notes, 'general', req.user._id);
            }

            if (followUpRequired) {
                appointment.setFollowUp(
                    followUpRequired.type,
                    followUpRequired.recommendedDate,
                    followUpRequired.priority,
                    followUpRequired.notes
                );
            }

            await appointment.save();

            // Update analytics
            await Promise.all([
                Patient.findByIdAndUpdate(appointment.patientId, {
                    $inc: { 'analytics.completedAppointments': 1 }
                }),
                Doctor.findByIdAndUpdate(appointment.doctorId, {
                    $inc: { 'analytics.completedAppointments': 1 }
                })
            ]);

            // Send completion notifications
            await AppointmentController.sendAppointmentNotifications(appointment, 'completed');

            logger.info('Appointment completed', {
                appointmentId: appointment.appointmentId,
                completedBy: req.user._id,
                totalTime,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Appointment completed successfully',
                data: appointment
            });

        } catch (error) {
            logger.error('Complete appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error completing appointment'
            });
        }
    }

    /**
     * Mark appointment as no-show
     * @route PUT /api/appointments/:id/no-show
     * @access Private
     */
    static async markNoShow(req, res) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            if (!['scheduled', 'confirmed'].includes(appointment.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Only scheduled or confirmed appointments can be marked as no-show'
                });
            }

            // Mark as no-show
            appointment.markNoShow(req.user._id);
            await appointment.save();

            // Update patient analytics
            await Patient.findByIdAndUpdate(appointment.patientId, {
                $inc: { 'analytics.noShowAppointments': 1 }
            });

            // Send notification
            await AppointmentController.sendAppointmentNotifications(appointment, 'no_show');

            logger.info('Appointment marked as no-show', {
                appointmentId: appointment.appointmentId,
                markedBy: req.user._id,
                ip: req.ip
            });

            res.json({
                success: true,
                message: 'Appointment marked as no-show',
                data: appointment
            });

        } catch (error) {
            logger.error('Mark no-show error:', error);
            res.status(500).json({
                success: false,
                message: 'Error marking appointment as no-show'
            });
        }
    }

    /**
     * Add note to appointment
     * @route POST /api/appointments/:id/notes
     * @access Private
     */
    static async addAppointmentNote(req, res) {
        try {
            const { id } = req.params;
            const { content, type, isPrivate } = req.body;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            // Check access permissions
            const hasAccess = AppointmentController.checkAppointmentAccess(appointment, req.user);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const note = appointment.addNote(content, type, req.user._id, isPrivate);
            await appointment.save();

            logger.info('Note added to appointment', {
                appointmentId: appointment.appointmentId,
                noteType: type,
                addedBy: req.user._id,
                ip: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Note added successfully',
                data: note
            });

        } catch (error) {
            logger.error('Add appointment note error:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding note'
            });
        }
    }

    /**
     * Get available time slots
     * @route GET /api/appointments/available-slots
     * @access Private
     */
    static async getAvailableTimeSlots(req, res) {
        try {
            const { doctorId, clinicId, date, duration = 30 } = req.query;

            if (!doctorId || !clinicId || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor ID, clinic ID, and date are required'
                });
            }

            // Get doctor's schedule for the day
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            // Get clinic operating hours
            const clinic = await Clinic.findById(clinicId);
            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    message: 'Clinic not found'
                });
            }

            const dayOfWeek = moment(date).format('dddd').toLowerCase();
            const clinicHours = clinic.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
            
            if (!clinicHours || !clinicHours.isOpen) {
                return res.json({
                    success: true,
                    data: {
                        availableSlots: [],
                        message: 'Clinic is closed on this day'
                    }
                });
            }

            // Get doctor's schedule for the day
            const doctorSchedule = doctor.schedule.weeklySchedule.find(ws => ws.dayOfWeek === dayOfWeek);
            if (!doctorSchedule || !doctorSchedule.isWorking) {
                return res.json({
                    success: true,
                    data: {
                        availableSlots: [],
                        message: 'Doctor is not available on this day'
                    }
                });
            }

            // Get existing appointments for the day
            const existingAppointments = await Appointment.find({
                doctorId,
                appointmentDate: {
                    $gte: new Date(date).setHours(0, 0, 0, 0),
                    $lt: new Date(date).setHours(23, 59, 59, 999)
                },
                status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
            });

            // Generate available time slots
            const availableSlots = AppointmentController.generateTimeSlots(
                doctorSchedule.startTime,
                doctorSchedule.endTime,
                duration,
                existingAppointments,
                doctorSchedule.breaks || []
            );

            res.json({
                success: true,
                data: {
                    availableSlots,
                    doctorSchedule: {
                        startTime: doctorSchedule.startTime,
                        endTime: doctorSchedule.endTime,
                        breaks: doctorSchedule.breaks
                    },
                    clinicHours: {
                        openTime: clinicHours.openTime,
                        closeTime: clinicHours.closeTime
                    }
                }
            });

        } catch (error) {
            logger.error('Get available slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving available time slots'
            });
        }
    }

    /**
     * Get appointment analytics
     * @route GET /api/appointments/analytics
     * @access Private/Admin
     */
    static async getAppointmentAnalytics(req, res) {
        try {
            const {
                startDate,
                endDate,
                clinicId,
                doctorId,
                type = 'overview'
            } = req.query;

            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.appointmentDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const matchStage = { ...dateFilter };
            if (clinicId) matchStage.clinicId = clinicId;
            if (doctorId) matchStage.doctorId = doctorId;

            let analytics;

            switch (type) {
                case 'overview':
                    analytics = await Appointment.getAppointmentStats(
                        new Date(startDate),
                        new Date(endDate),
                        clinicId
                    );
                    break;

                case 'trends':
                    analytics = await Appointment.aggregate([
                        { $match: matchStage },
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$appointmentDate' },
                                    month: { $month: '$appointmentDate' },
                                    day: { $dayOfMonth: '$appointmentDate' }
                                },
                                totalAppointments: { $sum: 1 },
                                completed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                                },
                                cancelled: {
                                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                                },
                                noShows: {
                                    $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
                                }
                            }
                        },
                        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                    ]);
                    break;

                case 'types':
                    analytics = await Appointment.aggregate([
                        { $match: matchStage },
                        {
                            $group: {
                                _id: '$type',
                                count: { $sum: 1 },
                                completed: {
                                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                                },
                                averageDuration: {
                                    $avg: '$checkIn.totalTime'
                                },
                                totalRevenue: { $sum: '$billing.totalAmount' }
                            }
                        },
                        { $sort: { count: -1 } }
                    ]);
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid analytics type'
                    });
            }

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Get appointment analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving appointment analytics'
            });
        }
    }

    // Helper methods

    /**
     * Check if user has access to appointment
     */
    static checkAppointmentAccess(appointment, user) {
        const userRole = user.auth.role;
        const userId = user._id.toString();

        switch (userRole) {
            case 'admin':
                return true;
            case 'patient':
                return appointment.patientId.toString() === userId;
            case 'doctor':
                return appointment.doctorId.toString() === userId;
            case 'receptionist':
            case 'assistant':
                return user.clinics?.includes(appointment.clinicId.toString());
            default:
                return false;
        }
    }

    /**
     * Get appointment category based on type
     */
    static getAppointmentCategory(type) {
        const categoryMap = {
            'consultation': 'diagnostic',
            'cleaning': 'preventive',
            'filling': 'restorative',
            'extraction': 'surgical',
            'root_canal': 'endodontic',
            'crown': 'restorative',
            'bridge': 'restorative',
            'implant': 'surgical',
            'orthodontic': 'orthodontic',
            'cosmetic': 'cosmetic',
            'emergency': 'emergency'
        };
        return categoryMap[type] || 'diagnostic';
    }

    /**
     * Generate available time slots
     */
    static generateTimeSlots(startTime, endTime, duration, existingAppointments, breaks) {
        const slots = [];
        const start = moment(startTime, 'HH:mm');
        const end = moment(endTime, 'HH:mm');

        while (start.clone().add(duration, 'minutes').isSameOrBefore(end)) {
            const slotStart = start.format('HH:mm');
            const slotEnd = start.clone().add(duration, 'minutes').format('HH:mm');

            // Check for conflicts with existing appointments
            const hasConflict = existingAppointments.some(apt => {
                return (slotStart < apt.timeSlot.endTime && slotEnd > apt.timeSlot.startTime);
            });

            // Check for conflicts with breaks
            const hasBreakConflict = breaks.some(brk => {
                return (slotStart < brk.endTime && slotEnd > brk.startTime);
            });

            if (!hasConflict && !hasBreakConflict) {
                slots.push({
                    startTime: slotStart,
                    endTime: slotEnd,
                    duration: duration
                });
            }

            start.add(duration, 'minutes');
        }

        return slots;
    }

    /**
     * Send appointment notifications
     */
    static async sendAppointmentNotifications(appointment, action) {
        try {
            const patient = await Patient.findById(appointment.patientId).populate('userId');
            const doctor = await Doctor.findById(appointment.doctorId).populate('userId');

            if (!patient || !doctor) return;

            const appointmentDate = moment(appointment.appointmentDate).format('MMMM Do, YYYY');
            const appointmentTime = appointment.timeSlot.startTime;

            const notificationData = {
                appointmentId: appointment.appointmentId,
                patientName: `${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
                doctorName: `Dr. ${doctor.userId.profile.firstName} ${doctor.userId.profile.lastName}`,
                appointmentDate,
                appointmentTime,
                type: appointment.type,
                reason: appointment.reason
            };

            // Send email to patient
            if (patient.userId.contact.emailVerified && patient.preferences.notifications.email) {
                await sendEmail({
                    to: patient.userId.contact.email,
                    subject: `Appointment ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                    template: `appointment-${action}`,
                    data: notificationData
                });
            }

            // Send SMS to patient
            if (patient.userId.contact.phoneVerified && patient.preferences.notifications.sms) {
                const smsMessage = AppointmentController.generateSMSMessage(action, notificationData);
                await sendSMS({
                    to: patient.userId.contact.phone,
                    message: smsMessage
                });
            }

            // Create in-app notifications
            await Promise.all([
                createNotification({
                    userId: patient.userId._id,
                    type: 'appointment',
                    title: `Appointment ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                    message: AppointmentController.generateNotificationMessage(action, notificationData),
                    data: { appointmentId: appointment._id }
                }),
                createNotification({
                    userId: doctor.userId._id,
                    type: 'appointment',
                    title: `Appointment ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                    message: AppointmentController.generateDoctorNotificationMessage(action, notificationData),
                    data: { appointmentId: appointment._id }
                })
            ]);

        } catch (error) {
            logger.error('Send appointment notifications error:', error);
        }
    }

    /**
     * Generate SMS message based on action
     */
    static generateSMSMessage(action, data) {
        const messages = {
            created: `Your dental appointment has been scheduled for ${data.appointmentDate} at ${data.appointmentTime} with ${data.doctorName}. Appointment ID: ${data.appointmentId}`,
            updated: `Your dental appointment has been updated. New date: ${data.appointmentDate} at ${data.appointmentTime}. Appointment ID: ${data.appointmentId}`,
            cancelled: `Your dental appointment for ${data.appointmentDate} has been cancelled. Appointment ID: ${data.appointmentId}`,
            rescheduled: `Your dental appointment has been rescheduled to ${data.appointmentDate} at ${data.appointmentTime}. Appointment ID: ${data.appointmentId}`,
            completed: `Your dental appointment has been completed. Thank you for visiting us! Appointment ID: ${data.appointmentId}`,
            no_show: `You missed your dental appointment scheduled for ${data.appointmentDate}. Please contact us to reschedule. Appointment ID: ${data.appointmentId}`
        };
        return messages[action] || `Your appointment status has been updated. Appointment ID: ${data.appointmentId}`;
    }

    /**
     * Generate notification message for patient
     */
    static generateNotificationMessage(action, data) {
        const messages = {
            created: `Your appointment has been scheduled for ${data.appointmentDate} at ${data.appointmentTime}`,
            updated: `Your appointment has been updated`,
            cancelled: `Your appointment for ${data.appointmentDate} has been cancelled`,
            rescheduled: `Your appointment has been rescheduled to ${data.appointmentDate} at ${data.appointmentTime}`,
            completed: `Your appointment has been completed successfully`,
            no_show: `You missed your scheduled appointment for ${data.appointmentDate}`
        };
        return messages[action] || 'Your appointment status has been updated';
    }

    /**
     * Generate notification message for doctor
     */
    static generateDoctorNotificationMessage(action, data) {
        const messages = {
            created: `New appointment scheduled with ${data.patientName} for ${data.appointmentDate} at ${data.appointmentTime}`,
            updated: `Appointment with ${data.patientName} has been updated`,
            cancelled: `Appointment with ${data.patientName} for ${data.appointmentDate} has been cancelled`,
            rescheduled: `Appointment with ${data.patientName} has been rescheduled to ${data.appointmentDate} at ${data.appointmentTime}`,
            completed: `Appointment with ${data.patientName} has been completed`,
            no_show: `${data.patientName} did not show up for their appointment on ${data.appointmentDate}`
        };
        return messages[action] || `Appointment status updated for ${data.patientName}`;
    }
}

module.exports = AppointmentController;
