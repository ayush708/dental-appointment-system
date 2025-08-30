/**
 * Appointment Model for Dental Appointment System
 * Comprehensive appointment management with advanced scheduling features
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Appointment sub-schemas
const participantSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'assistant', 'observer'],
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'declined'],
        default: 'confirmed'
    },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true }
    }
}, { _id: false });

const reminderSchema = new Schema({
    type: {
        type: String,
        enum: ['email', 'sms', 'phone', 'push'],
        required: true
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    sentAt: Date,
    content: String,
    recipient: String
}, { _id: true });

const paymentSchema = new Schema({
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'check', 'insurance', 'online', 'bank_transfer'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    transactionId: String,
    gatewayResponse: Schema.Types.Mixed,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    insuranceClaim: {
        claimNumber: String,
        provider: String,
        amount: Number,
        status: {
            type: String,
            enum: ['submitted', 'approved', 'denied', 'pending']
        },
        submittedAt: Date,
        processedAt: Date
    }
}, { _id: false });

const followUpSchema = new Schema({
    type: {
        type: String,
        enum: ['consultation', 'treatment', 'check_up', 'emergency'],
        required: true
    },
    recommendedDate: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: String,
    isScheduled: { type: Boolean, default: false },
    scheduledAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' }
}, { _id: false });

// Main Appointment Schema
const appointmentSchema = new Schema({
    appointmentId: {
        type: String,
        required: [true, 'Appointment ID is required'],
        unique: true,
        uppercase: true,
        index: true
    },
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required'],
        index: true
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required'],
        index: true
    },
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Clinic ID is required'],
        index: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required'],
        index: true
    },
    timeSlot: {
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            validate: {
                validator: function(v) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Invalid time format (HH:MM)'
            }
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            validate: {
                validator: function(v) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Invalid time format (HH:MM)'
            }
        },
        duration: {
            type: Number,
            required: true,
            min: [15, 'Minimum duration is 15 minutes'],
            max: [480, 'Maximum duration is 8 hours']
        }
    },
    type: {
        type: String,
        required: [true, 'Appointment type is required'],
        enum: [
            'consultation',
            'cleaning',
            'filling',
            'extraction',
            'root_canal',
            'crown',
            'bridge',
            'implant',
            'orthodontic',
            'cosmetic',
            'emergency',
            'follow_up',
            'telemedicine',
            'second_opinion'
        ],
        index: true
    },
    category: {
        type: String,
        enum: ['preventive', 'diagnostic', 'restorative', 'surgical', 'cosmetic', 'orthodontic', 'emergency'],
        required: true
    },
    status: {
        type: String,
        enum: [
            'scheduled',
            'confirmed',
            'checked_in',
            'in_progress',
            'waiting',
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        ],
        default: 'scheduled',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
        default: 'normal',
        index: true
    },
    isEmergency: {
        type: Boolean,
        default: false,
        index: true
    },
    reason: {
        type: String,
        required: [true, 'Reason for appointment is required'],
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    symptoms: [String],
    chiefComplaint: {
        type: String,
        trim: true,
        maxlength: [1000, 'Chief complaint cannot exceed 1000 characters']
    },
    participants: [participantSchema],
    services: [{
        serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
        serviceName: String,
        duration: Number,
        cost: Number,
        status: {
            type: String,
            enum: ['planned', 'in_progress', 'completed', 'cancelled'],
            default: 'planned'
        }
    }],
    roomNumber: String,
    equipmentRequired: [String],
    specialInstructions: String,
    preparationInstructions: String,
    aftercareInstructions: String,
    notes: [{
        content: String,
        type: {
            type: String,
            enum: ['general', 'clinical', 'administrative'],
            default: 'general'
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        isPrivate: { type: Boolean, default: false }
    }],
    reminders: [reminderSchema],
    remindersSent: {
        type: Number,
        default: 0
    },
    payment: paymentSchema,
    insurance: {
        provider: String,
        policyNumber: String,
        copayAmount: Number,
        preAuthorizationNumber: String,
        isPreAuthorized: { type: Boolean, default: false },
        coveragePercentage: Number,
        estimatedCoverage: Number,
        deductibleMet: { type: Boolean, default: false }
    },
    billing: {
        estimatedCost: Number,
        actualCost: Number,
        discountApplied: Number,
        discountReason: String,
        taxAmount: Number,
        totalAmount: Number,
        amountDue: Number,
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' }
    },
    followUp: followUpSchema,
    cancellation: {
        reason: String,
        cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
        cancelledAt: Date,
        refundStatus: {
            type: String,
            enum: ['not_applicable', 'pending', 'processed', 'denied']
        },
        refundAmount: Number,
        cancellationFee: Number
    },
    rescheduling: {
        reason: String,
        rescheduledBy: { type: Schema.Types.ObjectId, ref: 'User' },
        rescheduledAt: Date,
        previousDate: Date,
        previousTimeSlot: {
            startTime: String,
            endTime: String
        },
        reschedulingFee: Number
    },
    checkIn: {
        checkedInAt: Date,
        checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
        waitingTime: Number, // in minutes
        actualStartTime: Date,
        actualEndTime: Date,
        totalTime: Number // in minutes
    },
    documents: [{
        type: {
            type: String,
            enum: ['consent', 'xray', 'photo', 'report', 'prescription', 'referral', 'insurance'],
            required: true
        },
        title: String,
        fileUrl: String,
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    treatments: [{
        treatmentId: { type: Schema.Types.ObjectId, ref: 'Treatment' },
        treatmentName: String,
        status: {
            type: String,
            enum: ['planned', 'completed', 'partial'],
            default: 'planned'
        },
        cost: Number
    }],
    prescriptions: [{
        prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
        medicationName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
    }],
    vitals: {
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        heartRate: Number,
        temperature: Number,
        oxygenSaturation: Number,
        weight: Number,
        painLevel: {
            type: Number,
            min: 0,
            max: 10
        },
        recordedAt: Date,
        recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    telemedicine: {
        isVirtual: { type: Boolean, default: false },
        platform: String,
        meetingId: String,
        meetingPassword: String,
        joinUrl: String,
        recordingUrl: String,
        connectionQuality: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor']
        },
        technicalIssues: [String]
    },
    feedback: {
        patientSatisfaction: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comments: String,
            submittedAt: Date
        },
        doctorNotes: String,
        improvementAreas: [String],
        compliments: [String]
    },
    analytics: {
        bookingSource: {
            type: String,
            enum: ['online', 'phone', 'walk_in', 'referral', 'app', 'other'],
            default: 'online'
        },
        bookingTime: Date,
        leadTime: Number, // hours between booking and appointment
        seasonalFactor: String,
        cancellationRisk: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        },
        noShowRisk: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        }
    },
    communication: {
        preferredMethod: {
            type: String,
            enum: ['email', 'sms', 'phone', 'app'],
            default: 'email'
        },
        language: {
            type: String,
            default: 'en'
        },
        interpreterRequired: { type: Boolean, default: false },
        interpreterLanguage: String,
        communicationLog: [{
            type: String,
            method: String,
            content: String,
            sentAt: Date,
            sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
            response: String,
            responseAt: Date
        }]
    },
    emergency: {
        isEmergencyCase: { type: Boolean, default: false },
        severityLevel: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'critical']
        },
        triageNotes: String,
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        },
        hospitalTransfer: {
            required: { type: Boolean, default: false },
            hospital: String,
            transferTime: Date,
            ambulanceService: String
        }
    },
    quality: {
        reviewRequired: { type: Boolean, default: false },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: Date,
        qualityScore: {
            type: Number,
            min: 0,
            max: 100
        },
        improvementPoints: [String],
        bestPractices: [String]
    },
    metadata: {
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        version: { type: Number, default: 1 },
        source: String,
        externalId: String,
        tags: [String],
        customFields: Schema.Types.Mixed,
        timezone: { type: String, default: 'America/New_York' }
    }
}, {
    timestamps: true,
    collection: 'appointments',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ appointmentId: 1 }, { unique: true });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ clinicId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ type: 1, priority: 1 });
appointmentSchema.index({ isEmergency: 1, appointmentDate: 1 });
appointmentSchema.index({ 'timeSlot.startTime': 1, 'timeSlot.endTime': 1 });
appointmentSchema.index({ 'payment.status': 1 });

// Compound indexes
appointmentSchema.index({ 
    doctorId: 1, 
    appointmentDate: 1, 
    'timeSlot.startTime': 1 
});
appointmentSchema.index({ 
    patientId: 1, 
    status: 1, 
    appointmentDate: -1 
});
appointmentSchema.index({ 
    clinicId: 1, 
    appointmentDate: 1, 
    status: 1 
});

// Text search index
appointmentSchema.index({
    reason: 'text',
    chiefComplaint: 'text',
    symptoms: 'text',
    'notes.content': 'text'
});

// Virtual properties
appointmentSchema.virtual('isToday').get(function() {
    const today = new Date();
    const appointmentDate = new Date(this.appointmentDate);
    return today.toDateString() === appointmentDate.toDateString();
});

appointmentSchema.virtual('isUpcoming').get(function() {
    return new Date(this.appointmentDate) > new Date();
});

appointmentSchema.virtual('isPast').get(function() {
    return new Date(this.appointmentDate) < new Date();
});

appointmentSchema.virtual('isOverdue').get(function() {
    const appointmentDateTime = new Date(this.appointmentDate);
    const [hours, minutes] = this.timeSlot.endTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    return appointmentDateTime < new Date() && this.status !== 'completed';
});

appointmentSchema.virtual('canCancel').get(function() {
    const now = new Date();
    const appointmentDateTime = new Date(this.appointmentDate);
    const [hours, minutes] = this.timeSlot.startTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
});

appointmentSchema.virtual('canReschedule').get(function() {
    const now = new Date();
    const appointmentDateTime = new Date(this.appointmentDate);
    const [hours, minutes] = this.timeSlot.startTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
});

appointmentSchema.virtual('totalCost').get(function() {
    if (this.billing && this.billing.totalAmount) {
        return this.billing.totalAmount;
    }
    return this.services.reduce((total, service) => total + (service.cost || 0), 0);
});

appointmentSchema.virtual('waitTime').get(function() {
    if (this.checkIn && this.checkIn.checkedInAt && this.checkIn.actualStartTime) {
        return Math.round((this.checkIn.actualStartTime - this.checkIn.checkedInAt) / (1000 * 60));
    }
    return 0;
});

// Pre-save middleware
appointmentSchema.pre('save', async function(next) {
    // Generate appointment ID if new
    if (this.isNew && !this.appointmentId) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await this.constructor.countDocuments({
            appointmentId: new RegExp(`^APT${year}${month}`)
        });
        this.appointmentId = `APT${year}${month}${(count + 1).toString().padStart(6, '0')}`;
    }
    
    // Set booking time if new
    if (this.isNew) {
        this.analytics.bookingTime = new Date();
        
        // Calculate lead time
        const appointmentDateTime = new Date(this.appointmentDate);
        const [hours, minutes] = this.timeSlot.startTime.split(':');
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
        
        this.analytics.leadTime = Math.round((appointmentDateTime - new Date()) / (1000 * 60 * 60));
    }
    
    // Update version on modification
    if (!this.isNew) {
        this.metadata.version += 1;
    }
    
    next();
});

// Instance methods
appointmentSchema.methods.confirm = function(confirmedBy) {
    this.status = 'confirmed';
    this.metadata.lastModifiedBy = confirmedBy;
    
    // Add to communication log
    this.communication.communicationLog.push({
        type: 'confirmation',
        method: 'system',
        content: 'Appointment confirmed',
        sentAt: new Date(),
        sentBy: confirmedBy
    });
};

appointmentSchema.methods.cancel = function(reason, cancelledBy, refundAmount = 0) {
    this.status = 'cancelled';
    this.cancellation = {
        reason,
        cancelledBy,
        cancelledAt: new Date(),
        refundAmount,
        refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable'
    };
    this.metadata.lastModifiedBy = cancelledBy;
    
    // Add to communication log
    this.communication.communicationLog.push({
        type: 'cancellation',
        method: 'system',
        content: `Appointment cancelled: ${reason}`,
        sentAt: new Date(),
        sentBy: cancelledBy
    });
};

appointmentSchema.methods.reschedule = function(newDate, newTimeSlot, reason, rescheduledBy) {
    this.rescheduling = {
        reason,
        rescheduledBy,
        rescheduledAt: new Date(),
        previousDate: this.appointmentDate,
        previousTimeSlot: this.timeSlot
    };
    
    this.appointmentDate = newDate;
    this.timeSlot = newTimeSlot;
    this.status = 'rescheduled';
    this.metadata.lastModifiedBy = rescheduledBy;
    
    // Add to communication log
    this.communication.communicationLog.push({
        type: 'reschedule',
        method: 'system',
        content: `Appointment rescheduled: ${reason}`,
        sentAt: new Date(),
        sentBy: rescheduledBy
    });
};

appointmentSchema.methods.checkIn = function(checkedInBy) {
    this.status = 'checked_in';
    this.checkIn = {
        checkedInAt: new Date(),
        checkedInBy
    };
    this.metadata.lastModifiedBy = checkedInBy;
};

appointmentSchema.methods.startTreatment = function(startedBy) {
    this.status = 'in_progress';
    if (this.checkIn) {
        this.checkIn.actualStartTime = new Date();
        this.checkIn.waitingTime = Math.round((new Date() - this.checkIn.checkedInAt) / (1000 * 60));
    }
    this.metadata.lastModifiedBy = startedBy;
};

appointmentSchema.methods.complete = function(completedBy, totalTime) {
    this.status = 'completed';
    if (this.checkIn) {
        this.checkIn.actualEndTime = new Date();
        this.checkIn.totalTime = totalTime || Math.round((new Date() - this.checkIn.actualStartTime) / (1000 * 60));
    }
    this.metadata.lastModifiedBy = completedBy;
};

appointmentSchema.methods.markNoShow = function(markedBy) {
    this.status = 'no_show';
    this.metadata.lastModifiedBy = markedBy;
    
    // Add to communication log
    this.communication.communicationLog.push({
        type: 'no_show',
        method: 'system',
        content: 'Patient marked as no-show',
        sentAt: new Date(),
        sentBy: markedBy
    });
};

appointmentSchema.methods.addNote = function(content, type, createdBy, isPrivate = false) {
    const note = {
        content,
        type: type || 'general',
        createdBy,
        isPrivate
    };
    
    this.notes.push(note);
    return note;
};

appointmentSchema.methods.addReminder = function(type, scheduledFor, content, recipient) {
    const reminder = {
        type,
        scheduledFor,
        content,
        recipient
    };
    
    this.reminders.push(reminder);
    return reminder;
};

appointmentSchema.methods.recordPayment = function(amount, method, transactionId) {
    this.payment = {
        amount,
        method,
        status: 'completed',
        transactionId,
        paidAt: new Date()
    };
    
    if (this.billing) {
        this.billing.amountDue = Math.max(0, (this.billing.totalAmount || 0) - amount);
    }
};

appointmentSchema.methods.addDocument = function(type, title, fileUrl, uploadedBy) {
    const document = {
        type,
        title,
        fileUrl,
        uploadedBy
    };
    
    this.documents.push(document);
    return document;
};

appointmentSchema.methods.recordVitals = function(vitals, recordedBy) {
    this.vitals = {
        ...vitals,
        recordedAt: new Date(),
        recordedBy
    };
};

appointmentSchema.methods.setFollowUp = function(type, recommendedDate, priority, notes) {
    this.followUp = {
        type,
        recommendedDate,
        priority: priority || 'medium',
        notes
    };
};

appointmentSchema.methods.calculateRisk = function() {
    let cancellationRisk = 'low';
    let noShowRisk = 'low';
    
    // Basic risk calculation based on lead time
    if (this.analytics.leadTime < 24) {
        cancellationRisk = 'high';
        noShowRisk = 'high';
    } else if (this.analytics.leadTime < 72) {
        cancellationRisk = 'medium';
        noShowRisk = 'medium';
    }
    
    // Additional factors could be considered based on patient history
    
    this.analytics.cancellationRisk = cancellationRisk;
    this.analytics.noShowRisk = noShowRisk;
};

// Static methods
appointmentSchema.statics.findByDate = function(date, clinicId = null) {
    const query = {
        appointmentDate: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999))
        }
    };
    
    if (clinicId) {
        query.clinicId = clinicId;
    }
    
    return this.find(query)
        .populate('patientId', 'profile')
        .populate('doctorId', 'specialty')
        .sort({ 'timeSlot.startTime': 1 });
};

appointmentSchema.statics.findByDoctor = function(doctorId, startDate, endDate) {
    return this.find({
        doctorId,
        appointmentDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('patientId', 'profile');
};

appointmentSchema.statics.findByPatient = function(patientId, limit = 10) {
    return this.find({ patientId })
        .populate('doctorId', 'specialty')
        .sort({ appointmentDate: -1 })
        .limit(limit);
};

appointmentSchema.statics.getUpcomingAppointments = function(hours = 24) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return this.find({
        appointmentDate: {
            $gte: now,
            $lte: futureDate
        },
        status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patientId doctorId');
};

appointmentSchema.statics.getAppointmentStats = function(startDate, endDate, clinicId = null) {
    const matchStage = {
        appointmentDate: {
            $gte: startDate,
            $lte: endDate
        }
    };
    
    if (clinicId) {
        matchStage.clinicId = clinicId;
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                noShows: {
                    $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
                },
                totalRevenue: { $sum: '$billing.totalAmount' },
                averageWaitTime: { $avg: '$checkIn.waitingTime' }
            }
        }
    ]);
};

// Create and export model
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
