/**
 * Doctor Model for Dental Appointment System
 * Comprehensive doctor management with advanced scheduling and specialization features
 */

const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

// Qualification sub-schema
const qualificationSchema = new Schema({
    degree: {
        type: String,
        required: [true, 'Degree is required'],
        trim: true,
        maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    institution: {
        type: String,
        required: [true, 'Institution is required'],
        trim: true,
        maxlength: [200, 'Institution cannot exceed 200 characters']
    },
    year: {
        type: Number,
        required: [true, 'Graduation year is required'],
        min: [1950, 'Invalid graduation year'],
        max: [new Date().getFullYear(), 'Future graduation year not allowed']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        maxlength: [100, 'Country cannot exceed 100 characters']
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationDate: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    certificateUrl: String
}, { _id: true });

// Experience sub-schema
const experienceSchema = new Schema({
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true,
        maxlength: [100, 'Position cannot exceed 100 characters']
    },
    organization: {
        type: String,
        required: [true, 'Organization is required'],
        trim: true,
        maxlength: [200, 'Organization cannot exceed 200 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: Date,
    isCurrent: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    location: {
        city: String,
        state: String,
        country: String
    }
}, { _id: true });

// Schedule sub-schema
const scheduleSchema = new Schema({
    dayOfWeek: {
        type: Number,
        required: [true, 'Day of week is required'],
        min: [0, 'Invalid day of week'],
        max: [6, 'Invalid day of week'] // 0 = Sunday, 6 = Saturday
    },
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
    breakStartTime: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format (HH:MM)'
        }
    },
    breakEndTime: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format (HH:MM)'
        }
    },
    slotDuration: {
        type: Number,
        default: 30, // minutes
        min: [15, 'Minimum slot duration is 15 minutes'],
        max: [120, 'Maximum slot duration is 120 minutes']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

// Availability exception sub-schema
const availabilityExceptionSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
        index: true
    },
    type: {
        type: String,
        required: [true, 'Exception type is required'],
        enum: ['unavailable', 'custom_hours', 'holiday', 'vacation', 'conference', 'emergency']
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [200, 'Reason cannot exceed 200 characters']
    },
    startTime: String,
    endTime: String,
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly']
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

// Service sub-schema
const serviceSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [15, 'Minimum duration is 15 minutes'],
        max: [480, 'Maximum duration is 8 hours']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'general_dentistry',
            'cosmetic_dentistry',
            'orthodontics',
            'oral_surgery',
            'periodontics',
            'endodontics',
            'pediatric_dentistry',
            'prosthodontics',
            'oral_pathology',
            'dental_implants',
            'emergency_care'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },
    preparationInstructions: String,
    aftercareInstructions: String
}, { _id: true });

// Rating sub-schema
const ratingSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    review: {
        type: String,
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    aspects: {
        communication: { type: Number, min: 1, max: 5 },
        professionalism: { type: Number, min: 1, max: 5 },
        punctuality: { type: Number, min: 1, max: 5 },
        facilityQuality: { type: Number, min: 1, max: 5 },
        treatmentQuality: { type: Number, min: 1, max: 5 }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    response: {
        message: String,
        respondedAt: Date,
        respondedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }
}, { timestamps: true });

// Achievement sub-schema
const achievementSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Achievement title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    issuer: {
        type: String,
        required: [true, 'Issuer is required'],
        trim: true,
        maxlength: [200, 'Issuer cannot exceed 200 characters']
    },
    dateReceived: {
        type: Date,
        required: [true, 'Date received is required']
    },
    expiryDate: Date,
    certificateUrl: String,
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, { _id: true });

// Main Doctor Schema
const doctorSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true,
        index: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    licenseState: {
        type: String,
        required: [true, 'License state is required'],
        trim: true,
        uppercase: true
    },
    licenseExpiryDate: {
        type: Date,
        required: [true, 'License expiry date is required']
    },
    deaNumber: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                return !v || /^[A-Z]{2}\d{7}$/.test(v);
            },
            message: 'Invalid DEA number format'
        }
    },
    npiNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{10}$/.test(v);
            },
            message: 'NPI number must be 10 digits'
        }
    },
    specialty: {
        type: String,
        required: [true, 'Specialty is required'],
        enum: [
            'general_dentistry',
            'oral_and_maxillofacial_surgery',
            'orthodontics',
            'pediatric_dentistry',
            'periodontics',
            'prosthodontics',
            'endodontics',
            'oral_pathology',
            'oral_radiology',
            'dental_public_health',
            'cosmetic_dentistry',
            'implant_dentistry',
            'emergency_dentistry'
        ],
        index: true
    },
    subspecialties: [{
        type: String,
        enum: [
            'invisalign',
            'dental_implants',
            'wisdom_teeth_extraction',
            'root_canal_therapy',
            'teeth_whitening',
            'veneers',
            'crowns_and_bridges',
            'dentures',
            'gum_disease_treatment',
            'tmj_treatment',
            'sleep_apnea_treatment',
            'sedation_dentistry'
        ]
    }],
    qualifications: [qualificationSchema],
    experience: [experienceSchema],
    totalExperience: {
        type: Number,
        default: 0 // in years
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    languages: [{
        language: {
            type: String,
            required: true,
            enum: ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese', 'korean', 'arabic', 'hindi']
        },
        proficiency: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced', 'native'],
            default: 'intermediate'
        }
    }],
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Clinic ID is required'],
        index: true
    },
    schedule: [scheduleSchema],
    availabilityExceptions: [availabilityExceptionSchema],
    services: [serviceSchema],
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required'],
        min: [0, 'Consultation fee cannot be negative'],
        index: true
    },
    emergencyFee: {
        type: Number,
        default: function() {
            return this.consultationFee * 1.5;
        }
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    isAcceptingNewPatients: {
        type: Boolean,
        default: true
    },
    maxPatientsPerDay: {
        type: Number,
        default: 20,
        min: [1, 'Must accept at least 1 patient per day'],
        max: [50, 'Cannot exceed 50 patients per day']
    },
    appointmentBuffer: {
        type: Number,
        default: 10, // minutes between appointments
        min: [0, 'Buffer cannot be negative'],
        max: [60, 'Buffer cannot exceed 60 minutes']
    },
    emergencyAvailability: {
        type: Boolean,
        default: false
    },
    telemedicineEnabled: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot exceed 5'],
            index: true
        },
        count: {
            type: Number,
            default: 0
        },
        breakdown: {
            fiveStar: { type: Number, default: 0 },
            fourStar: { type: Number, default: 0 },
            threeStar: { type: Number, default: 0 },
            twoStar: { type: Number, default: 0 },
            oneStar: { type: Number, default: 0 }
        }
    },
    reviews: [ratingSchema],
    achievements: [achievementSchema],
    statistics: {
        totalAppointments: { type: Number, default: 0 },
        completedAppointments: { type: Number, default: 0 },
        cancelledAppointments: { type: Number, default: 0 },
        noShowAppointments: { type: Number, default: 0 },
        totalPatients: { type: Number, default: 0 },
        averageWaitTime: { type: Number, default: 0 }, // in minutes
        onTimePercentage: { type: Number, default: 100 },
        patientSatisfactionScore: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageAppointmentDuration: { type: Number, default: 30 }
    },
    preferences: {
        autoConfirmAppointments: {
            type: Boolean,
            default: false
        },
        allowOnlineBooking: {
            type: Boolean,
            default: true
        },
        requireInsuranceVerification: {
            type: Boolean,
            default: true
        },
        sendReminderNotifications: {
            type: Boolean,
            default: true
        },
        reminderTime: {
            type: Number,
            default: 24 // hours before appointment
        },
        allowCancellation: {
            type: Boolean,
            default: true
        },
        cancellationNotice: {
            type: Number,
            default: 24 // hours notice required
        },
        workingTimeZone: {
            type: String,
            default: 'America/New_York'
        }
    },
    insurance: {
        acceptedPlans: [{
            provider: String,
            planType: String,
            isActive: { type: Boolean, default: true }
        }],
        isInNetwork: {
            type: Boolean,
            default: true
        }
    },
    emergencyContact: {
        name: String,
        phone: String,
        email: String,
        relationship: String
    },
    bankingDetails: {
        accountHolderName: String,
        bankName: String,
        accountNumber: String,
        routingNumber: String,
        isVerified: { type: Boolean, default: false }
    },
    taxes: {
        taxId: String,
        w9OnFile: { type: Boolean, default: false },
        taxDocuments: [{
            year: Number,
            documentUrl: String,
            uploadedAt: Date
        }]
    },
    compliance: {
        hipaaTrainingDate: Date,
        hipaaRenewalDate: Date,
        continuingEducationHours: { type: Number, default: 0 },
        continuingEducationRequired: { type: Number, default: 20 },
        backgroundCheckDate: Date,
        backgroundCheckStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        malpracticeInsurance: {
            provider: String,
            policyNumber: String,
            coverageAmount: Number,
            expiryDate: Date,
            documentUrl: String
        }
    },
    availability: [{
        date: {
            type: Date,
            required: true,
            index: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        customHours: {
            startTime: String,
            endTime: String
        },
        bookedSlots: [{
            startTime: String,
            endTime: String,
            appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' }
        }],
        blockedSlots: [{
            startTime: String,
            endTime: String,
            reason: String,
            blockedBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }]
    }],
    notifications: {
        email: {
            newAppointments: { type: Boolean, default: true },
            appointmentReminders: { type: Boolean, default: true },
            cancellations: { type: Boolean, default: true },
            reviews: { type: Boolean, default: true },
            systemUpdates: { type: Boolean, default: true }
        },
        sms: {
            emergencyAppointments: { type: Boolean, default: true },
            cancellations: { type: Boolean, default: true },
            reminders: { type: Boolean, default: false }
        },
        push: {
            newAppointments: { type: Boolean, default: true },
            emergencies: { type: Boolean, default: true },
            messages: { type: Boolean, default: true }
        }
    },
    socialMedia: {
        website: String,
        linkedin: String,
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String
    },
    metadata: {
        verificationStatus: {
            type: String,
            enum: ['pending', 'in_review', 'verified', 'rejected', 'suspended'],
            default: 'pending'
        },
        verificationDate: Date,
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        verificationNotes: String,
        isActive: {
            type: Boolean,
            default: true
        },
        suspensionReason: String,
        suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        suspensionDate: Date,
        reactivationDate: Date,
        tags: [String],
        notes: String
    }
}, {
    timestamps: true,
    collection: 'doctors',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ licenseNumber: 1 }, { unique: true });
doctorSchema.index({ specialty: 1, 'rating.average': -1 });
doctorSchema.index({ clinicId: 1, isAvailable: 1 });
doctorSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
doctorSchema.index({ 'availability.date': 1, 'availability.isAvailable': 1 });
doctorSchema.index({ 'metadata.verificationStatus': 1 });
doctorSchema.index({ isAcceptingNewPatients: 1, isAvailable: 1 });

// Text search index
doctorSchema.index({
    bio: 'text',
    specialty: 'text',
    subspecialties: 'text',
    'languages.language': 'text'
});

// Compound indexes
doctorSchema.index({ 
    specialty: 1, 
    'rating.average': -1, 
    consultationFee: 1 
});
doctorSchema.index({ 
    clinicId: 1, 
    isAvailable: 1, 
    isAcceptingNewPatients: 1 
});

// Virtual properties
doctorSchema.virtual('currentAge').get(function() {
    // This would typically get age from the associated User profile
    return null; // To be populated from User model
});

doctorSchema.virtual('yearsOfPractice').get(function() {
    if (this.qualifications && this.qualifications.length > 0) {
        const oldestQualification = this.qualifications.reduce((oldest, qual) => {
            return qual.year < oldest.year ? qual : oldest;
        });
        return new Date().getFullYear() - oldestQualification.year;
    }
    return this.totalExperience;
});

doctorSchema.virtual('isLicenseValid').get(function() {
    return this.licenseExpiryDate > new Date();
});

doctorSchema.virtual('averageRating').get(function() {
    return Math.round(this.rating.average * 10) / 10;
});

doctorSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalAppointments === 0) return 100;
    return Math.round((this.statistics.completedAppointments / this.statistics.totalAppointments) * 100);
});

doctorSchema.virtual('isVerified').get(function() {
    return this.metadata.verificationStatus === 'verified';
});

// Pre-save middleware
doctorSchema.pre('save', async function(next) {
    // Calculate total experience
    if (this.experience && this.experience.length > 0) {
        let totalExp = 0;
        this.experience.forEach(exp => {
            const startYear = exp.startDate.getFullYear();
            const endYear = exp.endDate ? exp.endDate.getFullYear() : new Date().getFullYear();
            totalExp += (endYear - startYear);
        });
        this.totalExperience = totalExp;
    }
    
    // Update rating average
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.rating.average = totalRating / this.reviews.length;
        this.rating.count = this.reviews.length;
        
        // Update rating breakdown
        this.rating.breakdown = {
            fiveStar: this.reviews.filter(r => r.rating === 5).length,
            fourStar: this.reviews.filter(r => r.rating === 4).length,
            threeStar: this.reviews.filter(r => r.rating === 3).length,
            twoStar: this.reviews.filter(r => r.rating === 2).length,
            oneStar: this.reviews.filter(r => r.rating === 1).length
        };
    }
    
    next();
});

// Instance methods
doctorSchema.methods.isAvailableOn = function(date, time) {
    const dayOfWeek = date.getDay();
    const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
    
    if (!daySchedule) return false;
    
    // Check if time is within working hours
    const timeNum = this.timeToNumber(time);
    const startTimeNum = this.timeToNumber(daySchedule.startTime);
    const endTimeNum = this.timeToNumber(daySchedule.endTime);
    
    if (timeNum < startTimeNum || timeNum >= endTimeNum) return false;
    
    // Check if time is within break hours
    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
        const breakStartNum = this.timeToNumber(daySchedule.breakStartTime);
        const breakEndNum = this.timeToNumber(daySchedule.breakEndTime);
        
        if (timeNum >= breakStartNum && timeNum < breakEndNum) return false;
    }
    
    // Check for availability exceptions
    const exception = this.availabilityExceptions.find(ex => 
        ex.date.toDateString() === date.toDateString()
    );
    
    if (exception) {
        if (exception.type === 'unavailable') return false;
        if (exception.type === 'custom_hours') {
            const customStartNum = this.timeToNumber(exception.startTime);
            const customEndNum = this.timeToNumber(exception.endTime);
            return timeNum >= customStartNum && timeNum < customEndNum;
        }
    }
    
    return true;
};

doctorSchema.methods.getAvailableSlots = function(date) {
    const dayOfWeek = date.getDay();
    const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
    
    if (!daySchedule) return [];
    
    const slots = [];
    let currentTime = this.timeToNumber(daySchedule.startTime);
    const endTime = this.timeToNumber(daySchedule.endTime);
    const slotDuration = daySchedule.slotDuration;
    
    while (currentTime < endTime) {
        const timeString = this.numberToTime(currentTime);
        
        if (this.isAvailableOn(date, timeString)) {
            slots.push({
                time: timeString,
                duration: slotDuration,
                isAvailable: true
            });
        }
        
        currentTime += slotDuration;
    }
    
    return slots;
};

doctorSchema.methods.addAvailabilityException = function(date, type, options = {}) {
    const exception = {
        date,
        type,
        reason: options.reason,
        startTime: options.startTime,
        endTime: options.endTime,
        isRecurring: options.isRecurring || false,
        recurrencePattern: options.recurrencePattern,
        createdBy: options.createdBy
    };
    
    this.availabilityExceptions.push(exception);
    return exception;
};

doctorSchema.methods.blockTimeSlot = function(date, startTime, endTime, reason, blockedBy) {
    const availability = this.availability.find(a => 
        a.date.toDateString() === date.toDateString()
    );
    
    if (availability) {
        availability.blockedSlots.push({
            startTime,
            endTime,
            reason,
            blockedBy
        });
    } else {
        this.availability.push({
            date,
            isAvailable: true,
            blockedSlots: [{
                startTime,
                endTime,
                reason,
                blockedBy
            }]
        });
    }
};

doctorSchema.methods.addReview = function(patientId, appointmentId, rating, review, aspects) {
    const newReview = {
        patientId,
        appointmentId,
        rating,
        review,
        aspects,
        isVerified: true // Can be set based on business logic
    };
    
    this.reviews.push(newReview);
    return newReview;
};

doctorSchema.methods.updateStatistics = function(appointmentData) {
    this.statistics.totalAppointments += 1;
    
    if (appointmentData.status === 'completed') {
        this.statistics.completedAppointments += 1;
    } else if (appointmentData.status === 'cancelled') {
        this.statistics.cancelledAppointments += 1;
    } else if (appointmentData.status === 'no_show') {
        this.statistics.noShowAppointments += 1;
    }
    
    if (appointmentData.revenue) {
        this.statistics.totalRevenue += appointmentData.revenue;
    }
    
    if (appointmentData.duration) {
        const totalDuration = this.statistics.averageAppointmentDuration * (this.statistics.totalAppointments - 1) + appointmentData.duration;
        this.statistics.averageAppointmentDuration = totalDuration / this.statistics.totalAppointments;
    }
    
    // Update completion rate
    if (this.statistics.totalAppointments > 0) {
        this.statistics.onTimePercentage = Math.round(
            (this.statistics.completedAppointments / this.statistics.totalAppointments) * 100
        );
    }
};

doctorSchema.methods.getUpcomingAppointments = function(days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    // This would typically be populated or queried separately
    return [];
};

doctorSchema.methods.timeToNumber = function(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

doctorSchema.methods.numberToTime = function(timeNumber) {
    const hours = Math.floor(timeNumber / 60);
    const minutes = timeNumber % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

doctorSchema.methods.canAcceptEmergency = function() {
    return this.emergencyAvailability && this.isAvailable && this.metadata.isActive;
};

doctorSchema.methods.getSpecialtyDisplay = function() {
    return this.specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

doctorSchema.methods.hasService = function(serviceName) {
    return this.services.some(service => 
        service.name.toLowerCase().includes(serviceName.toLowerCase()) && service.isActive
    );
};

doctorSchema.methods.getServiceByName = function(serviceName) {
    return this.services.find(service => 
        service.name.toLowerCase() === serviceName.toLowerCase() && service.isActive
    );
};

// Static methods
doctorSchema.statics.findBySpecialty = function(specialty) {
    return this.find({ 
        specialty,
        'metadata.isActive': true,
        'metadata.verificationStatus': 'verified'
    }).populate('userId', 'profile email phone');
};

doctorSchema.statics.findByClinic = function(clinicId) {
    return this.find({ 
        clinicId,
        'metadata.isActive': true 
    }).populate('userId', 'profile email phone');
};

doctorSchema.statics.findAvailableDoctors = function(date, specialty = null) {
    const query = {
        isAvailable: true,
        isAcceptingNewPatients: true,
        'metadata.isActive': true,
        'metadata.verificationStatus': 'verified'
    };
    
    if (specialty) {
        query.specialty = specialty;
    }
    
    return this.find(query).populate('userId', 'profile email phone');
};

doctorSchema.statics.searchDoctors = function(searchTerm, filters = {}) {
    const query = {
        'metadata.isActive': true,
        'metadata.verificationStatus': 'verified'
    };
    
    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }
    
    if (filters.specialty) {
        query.specialty = filters.specialty;
    }
    
    if (filters.clinicId) {
        query.clinicId = filters.clinicId;
    }
    
    if (filters.minRating) {
        query['rating.average'] = { $gte: filters.minRating };
    }
    
    if (filters.maxFee) {
        query.consultationFee = { $lte: filters.maxFee };
    }
    
    if (filters.acceptingNewPatients !== undefined) {
        query.isAcceptingNewPatients = filters.acceptingNewPatients;
    }
    
    return this.find(query)
        .populate('userId', 'profile email phone')
        .sort({ 'rating.average': -1, consultationFee: 1 });
};

doctorSchema.statics.getTopRatedDoctors = function(limit = 10, specialty = null) {
    const query = {
        'metadata.isActive': true,
        'metadata.verificationStatus': 'verified',
        'rating.count': { $gte: 5 } // At least 5 reviews
    };
    
    if (specialty) {
        query.specialty = specialty;
    }
    
    return this.find(query)
        .populate('userId', 'profile email phone')
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(limit);
};

doctorSchema.statics.getDoctorStatistics = function() {
    return this.aggregate([
        {
            $match: {
                'metadata.isActive': true
            }
        },
        {
            $group: {
                _id: '$specialty',
                count: { $sum: 1 },
                averageRating: { $avg: '$rating.average' },
                averageFee: { $avg: '$consultationFee' },
                totalAppointments: { $sum: '$statistics.totalAppointments' },
                totalRevenue: { $sum: '$statistics.totalRevenue' }
            }
        }
    ]);
};

// Create and export model
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
