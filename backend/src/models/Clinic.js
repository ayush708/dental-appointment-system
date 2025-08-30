/**
 * Clinic Model for Dental Appointment System
 * Comprehensive clinic and practice management
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Clinic sub-schemas
const addressSchema = new Schema({
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    suite: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        uppercase: true
    },
    zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        validate: {
            validator: function(v) {
                return /^\d{5}(-\d{4})?$/.test(v);
            },
            message: 'Invalid ZIP code format'
        }
    },
    country: {
        type: String,
        required: true,
        default: 'USA',
        uppercase: true
    },
    coordinates: {
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        }
    },
    timezone: {
        type: String,
        default: 'America/New_York'
    }
}, { _id: false });

const contactSchema = new Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Invalid phone number format'
        }
    },
    fax: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Invalid fax number format'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    website: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+\..+/.test(v);
            },
            message: 'Invalid website URL'
        }
    },
    emergencyPhone: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Invalid emergency phone number format'
        }
    }
}, { _id: false });

const operatingHoursSchema = new Schema({
    dayOfWeek: {
        type: String,
        required: true,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    openTime: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format (HH:MM)'
        }
    },
    closeTime: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format (HH:MM)'
        }
    },
    lunchBreak: {
        start: String,
        end: String
    },
    appointmentSlots: [{
        startTime: String,
        endTime: String,
        duration: Number, // in minutes
        capacity: Number
    }]
}, { _id: false });

const roomSchema = new Schema({
    roomNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['treatment', 'surgery', 'consultation', 'xray', 'lab', 'waiting', 'office', 'storage'],
        required: true
    },
    capacity: {
        type: Number,
        default: 1
    },
    equipment: [{
        equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
        name: String,
        status: {
            type: String,
            enum: ['available', 'in_use', 'maintenance', 'out_of_order'],
            default: 'available'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    accessibility: {
        wheelchairAccessible: { type: Boolean, default: false },
        assistiveDevices: [String]
    },
    size: {
        length: Number,
        width: Number,
        unit: { type: String, default: 'feet' }
    },
    features: [String],
    lastMaintenance: Date,
    nextMaintenance: Date
}, { _id: true });

const staffSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['dentist', 'hygienist', 'assistant', 'receptionist', 'manager', 'technician', 'admin'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave', 'suspended', 'terminated'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    permissions: [{
        module: String,
        actions: [String]
    }],
    schedule: [{
        dayOfWeek: String,
        startTime: String,
        endTime: String,
        isWorking: { type: Boolean, default: true }
    }],
    salary: {
        amount: Number,
        currency: { type: String, default: 'USD' },
        payFrequency: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'annually'],
            default: 'monthly'
        }
    },
    performance: {
        lastReview: Date,
        nextReview: Date,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        goals: [String],
        notes: String
    }
}, { _id: true });

const serviceSchema = new Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['preventive', 'diagnostic', 'restorative', 'surgical', 'cosmetic', 'orthodontic', 'emergency'],
        required: true
    },
    description: String,
    duration: {
        type: Number,
        required: true, // in minutes
        min: [15, 'Minimum duration is 15 minutes']
    },
    cost: {
        type: Number,
        required: true,
        min: [0, 'Cost cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    prerequisites: [String],
    followUpRequired: {
        type: Boolean,
        default: false
    },
    equipmentRequired: [String],
    specialistRequired: {
        type: Boolean,
        default: false
    },
    anesthesiaType: {
        type: String,
        enum: ['none', 'local', 'sedation', 'general']
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    }
}, { _id: true });

const insuranceProviderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: String,
    contactInfo: {
        phone: String,
        email: String,
        website: String
    },
    planTypes: [String],
    copayAmount: Number,
    deductible: Number,
    maxBenefit: Number,
    coveragePercentage: Number,
    isAccepted: {
        type: Boolean,
        default: true
    },
    contractStartDate: Date,
    contractEndDate: Date,
    paymentTerms: String,
    notes: String
}, { _id: true });

const emergencyProtocolSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    steps: [{
        stepNumber: Number,
        action: String,
        responsibleRole: String,
        timeLimit: Number // in minutes
    }],
    contacts: [{
        name: String,
        role: String,
        phone: String,
        email: String
    }],
    equipment: [String],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    trainingRequired: {
        type: Boolean,
        default: false
    },
    lastTraining: Date
}, { _id: true });

// Main Clinic Schema
const clinicSchema = new Schema({
    clinicId: {
        type: String,
        required: [true, 'Clinic ID is required'],
        unique: true,
        uppercase: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Clinic name is required'],
        trim: true,
        maxlength: [100, 'Clinic name cannot exceed 100 characters'],
        index: true
    },
    type: {
        type: String,
        enum: ['general', 'specialty', 'orthodontic', 'oral_surgery', 'pediatric', 'cosmetic', 'periodontic', 'endodontic'],
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'under_renovation', 'temporarily_closed', 'permanently_closed'],
        default: 'active',
        index: true
    },
    license: {
        number: {
            type: String,
            required: [true, 'License number is required'],
            unique: true
        },
        issuedBy: String,
        issuedDate: Date,
        expiryDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'suspended', 'revoked'],
            default: 'active'
        }
    },
    address: {
        type: addressSchema,
        required: true
    },
    contact: {
        type: contactSchema,
        required: true
    },
    operatingHours: [operatingHoursSchema],
    holidaySchedule: [{
        date: Date,
        name: String,
        isClosed: { type: Boolean, default: true },
        specialHours: {
            openTime: String,
            closeTime: String
        }
    }],
    capacity: {
        totalRooms: {
            type: Number,
            required: true,
            min: [1, 'At least 1 room required']
        },
        treatmentRooms: Number,
        waitingCapacity: Number,
        dailyAppointmentLimit: Number,
        concurrentPatientLimit: Number
    },
    rooms: [roomSchema],
    staff: [staffSchema],
    services: [serviceSchema],
    specialties: [{
        name: String,
        description: String,
        leadDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        isActive: { type: Boolean, default: true }
    }],
    equipment: [{
        equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
        name: String,
        type: String,
        manufacturer: String,
        model: String,
        serialNumber: String,
        purchaseDate: Date,
        warrantyExpiry: Date,
        lastMaintenance: Date,
        nextMaintenance: Date,
        status: {
            type: String,
            enum: ['operational', 'maintenance', 'repair', 'retired'],
            default: 'operational'
        },
        assignedRoom: String,
        certifications: [String]
    }],
    insuranceProviders: [insuranceProviderSchema],
    billing: {
        taxId: String,
        bankingInfo: {
            accountNumber: String,
            routingNumber: String,
            bankName: String
        },
        paymentMethods: [{
            type: {
                type: String,
                enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'payment_plan'],
                required: true
            },
            isAccepted: { type: Boolean, default: true },
            processingFee: Number,
            minAmount: Number,
            maxAmount: Number
        }],
        defaultCurrency: {
            type: String,
            default: 'USD'
        },
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 1
        }
    },
    policies: {
        appointmentPolicy: {
            advanceBookingDays: { type: Number, default: 30 },
            cancellationPolicy: String,
            cancellationFee: Number,
            noShowFee: Number,
            reschedulePolicy: String,
            rescheduleLimit: { type: Number, default: 2 },
            lateArrivalPolicy: String,
            lateArrivalGracePeriod: { type: Number, default: 15 } // minutes
        },
        paymentPolicy: {
            paymentTerms: String,
            latePaymentFee: Number,
            paymentPlanOptions: [String],
            refundPolicy: String,
            depositRequired: { type: Boolean, default: false },
            depositAmount: Number
        },
        treatmentPolicy: {
            consentRequirement: { type: Boolean, default: true },
            photographyConsent: { type: Boolean, default: false },
            emergencyTreatmentProtocol: String,
            referralPolicy: String,
            followUpPolicy: String
        },
        privacyPolicy: {
            dataRetentionPeriod: { type: Number, default: 7 }, // years
            sharingPolicy: String,
            patientRights: String,
            hipaaCompliance: { type: Boolean, default: true }
        }
    },
    safety: {
        emergencyProtocols: [emergencyProtocolSchema],
        safetyEquipment: [{
            type: String,
            location: String,
            lastInspection: Date,
            nextInspection: Date,
            status: {
                type: String,
                enum: ['functional', 'needs_attention', 'non_functional'],
                default: 'functional'
            }
        }],
        incidentReporting: {
            lastIncident: Date,
            totalIncidents: { type: Number, default: 0 },
            safetyRating: {
                type: Number,
                min: 0,
                max: 100,
                default: 100
            }
        },
        regulations: {
            osha: {
                lastInspection: Date,
                nextInspection: Date,
                complianceStatus: {
                    type: String,
                    enum: ['compliant', 'non_compliant', 'pending_review'],
                    default: 'compliant'
                }
            },
            cdc: {
                lastUpdate: Date,
                protocolsImplemented: [String],
                complianceLevel: {
                    type: String,
                    enum: ['full', 'partial', 'minimal'],
                    default: 'full'
                }
            },
            state: {
                lastInspection: Date,
                nextInspection: Date,
                violations: [String],
                correctiveActions: [String]
            }
        }
    },
    technology: {
        practiceManagementSystem: {
            name: String,
            version: String,
            lastUpdate: Date,
            features: [String]
        },
        digitalXray: {
            available: { type: Boolean, default: false },
            type: String,
            manufacturer: String,
            lastCalibration: Date
        },
        intraOralCamera: {
            available: { type: Boolean, default: false },
            count: Number,
            lastMaintenance: Date
        },
        cadCam: {
            available: { type: Boolean, default: false },
            type: String,
            capabilities: [String]
        },
        telemedicine: {
            enabled: { type: Boolean, default: false },
            platform: String,
            equipment: [String],
            lastTest: Date
        }
    },
    quality: {
        accreditation: [{
            organization: String,
            level: String,
            certificateNumber: String,
            issueDate: Date,
            expiryDate: Date,
            status: {
                type: String,
                enum: ['active', 'expired', 'pending_renewal', 'suspended'],
                default: 'active'
            }
        }],
        qualityMetrics: {
            patientSatisfactionScore: {
                type: Number,
                min: 0,
                max: 100
            },
            treatmentSuccessRate: {
                type: Number,
                min: 0,
                max: 100
            },
            appointmentAdherence: {
                type: Number,
                min: 0,
                max: 100
            },
            safetyScore: {
                type: Number,
                min: 0,
                max: 100
            },
            lastAssessment: Date,
            improvementAreas: [String]
        },
        certifications: [{
            name: String,
            issuingBody: String,
            certificateNumber: String,
            issueDate: Date,
            expiryDate: Date,
            scope: String
        }]
    },
    marketing: {
        website: {
            url: String,
            lastUpdate: Date,
            seoScore: Number,
            monthlyVisitors: Number
        },
        socialMedia: [{
            platform: String,
            handle: String,
            followers: Number,
            lastPost: Date,
            isActive: { type: Boolean, default: true }
        }],
        onlineReviews: {
            googleRating: Number,
            yelpRating: Number,
            healthgradesRating: Number,
            totalReviews: Number,
            averageRating: Number,
            lastReviewDate: Date
        },
        referralProgram: {
            isActive: { type: Boolean, default: false },
            rewardType: String,
            rewardAmount: Number,
            terms: String
        }
    },
    analytics: {
        patientDemographics: {
            totalPatients: { type: Number, default: 0 },
            newPatientsThisMonth: { type: Number, default: 0 },
            activePatients: { type: Number, default: 0 },
            averageAge: Number,
            genderDistribution: {
                male: { type: Number, default: 0 },
                female: { type: Number, default: 0 },
                other: { type: Number, default: 0 }
            }
        },
        financialMetrics: {
            monthlyRevenue: Number,
            yearlyRevenue: Number,
            averageTransactionValue: Number,
            outstandingBalance: Number,
            collectionsRate: Number
        },
        operationalMetrics: {
            averageWaitTime: Number,
            appointmentUtilization: Number,
            cancellationRate: Number,
            noShowRate: Number,
            treatmentSuccessRate: Number
        },
        lastCalculated: Date
    },
    compliance: {
        hipaa: {
            complianceOfficer: { type: Schema.Types.ObjectId, ref: 'User' },
            lastAudit: Date,
            nextAudit: Date,
            violations: [String],
            trainingComplete: { type: Boolean, default: false },
            policies: [String]
        },
        ada: {
            accessibilityCompliant: { type: Boolean, default: false },
            lastAssessment: Date,
            improvementPlan: String,
            completionDate: Date
        },
        osha: {
            bloodbornePathogenTraining: Date,
            hazardCommunication: Date,
            emergencyActionPlan: String,
            lastInspection: Date
        }
    },
    maintenance: {
        lastGeneralMaintenance: Date,
        nextGeneralMaintenance: Date,
        maintenanceContracts: [{
            vendor: String,
            serviceType: String,
            startDate: Date,
            endDate: Date,
            cost: Number,
            frequency: String
        }],
        maintenanceSchedule: [{
            item: String,
            frequency: String,
            lastCompleted: Date,
            nextDue: Date,
            responsible: String
        }]
    },
    metadata: {
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        version: { type: Number, default: 1 },
        source: String,
        externalId: String,
        tags: [String],
        customFields: Schema.Types.Mixed,
        notes: String
    }
}, {
    timestamps: true,
    collection: 'clinics',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
clinicSchema.index({ clinicId: 1 }, { unique: true });
clinicSchema.index({ name: 1 });
clinicSchema.index({ type: 1, status: 1 });
clinicSchema.index({ 'address.city': 1, 'address.state': 1 });
clinicSchema.index({ 'address.zipCode': 1 });
clinicSchema.index({ 'license.number': 1 }, { unique: true });
clinicSchema.index({ 'license.expiryDate': 1 });

// Compound indexes
clinicSchema.index({ 
    'address.city': 1, 
    'address.state': 1, 
    type: 1 
});
clinicSchema.index({ 
    status: 1, 
    type: 1, 
    'address.city': 1 
});

// Text search index
clinicSchema.index({
    name: 'text',
    'services.name': 'text',
    'specialties.name': 'text'
});

// Virtual properties
clinicSchema.virtual('isOpen').get(function() {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    
    const todayHours = this.operatingHours.find(oh => oh.dayOfWeek === today);
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

clinicSchema.virtual('activeStaffCount').get(function() {
    return this.staff.filter(s => s.status === 'active').length;
});

clinicSchema.virtual('totalRoomsCount').get(function() {
    return this.rooms.length;
});

clinicSchema.virtual('availableRoomsCount').get(function() {
    return this.rooms.filter(r => r.isActive).length;
});

clinicSchema.virtual('operationalEquipmentCount').get(function() {
    return this.equipment.filter(e => e.status === 'operational').length;
});

clinicSchema.virtual('licenseStatus').get(function() {
    const now = new Date();
    const expiryDate = new Date(this.license.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'valid';
});

clinicSchema.virtual('averageRating').get(function() {
    const reviews = this.marketing.onlineReviews;
    const ratings = [reviews.googleRating, reviews.yelpRating, reviews.healthgradesRating].filter(r => r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Pre-save middleware
clinicSchema.pre('save', async function(next) {
    // Generate clinic ID if new
    if (this.isNew && !this.clinicId) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            clinicId: new RegExp(`^CLN${year}`)
        });
        this.clinicId = `CLN${year}${(count + 1).toString().padStart(4, '0')}`;
    }
    
    // Update version on modification
    if (!this.isNew) {
        this.metadata.version += 1;
    }
    
    // Set default operating hours if not provided
    if (this.isNew && this.operatingHours.length === 0) {
        const defaultHours = [
            { dayOfWeek: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { dayOfWeek: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { dayOfWeek: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { dayOfWeek: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { dayOfWeek: 'friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { dayOfWeek: 'saturday', isOpen: false },
            { dayOfWeek: 'sunday', isOpen: false }
        ];
        this.operatingHours = defaultHours;
    }
    
    next();
});

// Instance methods
clinicSchema.methods.addStaff = function(userId, role, startDate, permissions = []) {
    const staffMember = {
        userId,
        role,
        startDate,
        permissions,
        status: 'active'
    };
    
    this.staff.push(staffMember);
    return staffMember;
};

clinicSchema.methods.removeStaff = function(staffId, endDate, reason) {
    const staffMember = this.staff.id(staffId);
    if (staffMember) {
        staffMember.status = 'terminated';
        staffMember.endDate = endDate || new Date();
        staffMember.terminationReason = reason;
    }
    return staffMember;
};

clinicSchema.methods.addRoom = function(roomNumber, name, type, capacity = 1) {
    const room = {
        roomNumber,
        name,
        type,
        capacity,
        isActive: true
    };
    
    this.rooms.push(room);
    this.capacity.totalRooms = this.rooms.length;
    
    return room;
};

clinicSchema.methods.addService = function(name, category, duration, cost, description) {
    const serviceId = `SRV${Date.now()}`;
    const service = {
        serviceId,
        name,
        category,
        duration,
        cost,
        description,
        isActive: true
    };
    
    this.services.push(service);
    return service;
};

clinicSchema.methods.updateService = function(serviceId, updates) {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (service) {
        Object.assign(service, updates);
    }
    return service;
};

clinicSchema.methods.deactivateService = function(serviceId) {
    const service = this.services.find(s => s.serviceId === serviceId);
    if (service) {
        service.isActive = false;
    }
    return service;
};

clinicSchema.methods.addEquipment = function(name, type, manufacturer, model, serialNumber) {
    const equipment = {
        name,
        type,
        manufacturer,
        model,
        serialNumber,
        purchaseDate: new Date(),
        status: 'operational'
    };
    
    this.equipment.push(equipment);
    return equipment;
};

clinicSchema.methods.updateOperatingHours = function(dayOfWeek, openTime, closeTime, isOpen = true) {
    const dayHours = this.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
    if (dayHours) {
        dayHours.isOpen = isOpen;
        dayHours.openTime = openTime;
        dayHours.closeTime = closeTime;
    } else {
        this.operatingHours.push({
            dayOfWeek,
            isOpen,
            openTime,
            closeTime
        });
    }
};

clinicSchema.methods.addHoliday = function(date, name, isClosed = true, specialHours = null) {
    const holiday = {
        date,
        name,
        isClosed,
        specialHours
    };
    
    this.holidaySchedule.push(holiday);
    return holiday;
};

clinicSchema.methods.addInsuranceProvider = function(name, code, contactInfo, planTypes) {
    const provider = {
        name,
        code,
        contactInfo,
        planTypes,
        isAccepted: true
    };
    
    this.insuranceProviders.push(provider);
    return provider;
};

clinicSchema.methods.updateInsuranceProvider = function(providerId, updates) {
    const provider = this.insuranceProviders.id(providerId);
    if (provider) {
        Object.assign(provider, updates);
    }
    return provider;
};

clinicSchema.methods.addEmergencyProtocol = function(type, description, priority, steps) {
    const protocol = {
        type,
        description,
        priority,
        steps,
        lastUpdated: new Date()
    };
    
    this.safety.emergencyProtocols.push(protocol);
    return protocol;
};

clinicSchema.methods.updateQualityMetrics = function(metrics) {
    this.quality.qualityMetrics = {
        ...this.quality.qualityMetrics,
        ...metrics,
        lastAssessment: new Date()
    };
};

clinicSchema.methods.recordIncident = function(type, description, severity, reportedBy) {
    this.safety.incidentReporting.totalIncidents += 1;
    this.safety.incidentReporting.lastIncident = new Date();
    
    // You might want to create a separate Incident model for detailed tracking
    // This is just updating the summary statistics
};

clinicSchema.methods.scheduleEquipmentMaintenance = function(equipmentId, maintenanceDate, type) {
    const equipment = this.equipment.id(equipmentId);
    if (equipment) {
        equipment.nextMaintenance = maintenanceDate;
        equipment.status = 'maintenance';
    }
    return equipment;
};

clinicSchema.methods.completeEquipmentMaintenance = function(equipmentId, completionDate, notes) {
    const equipment = this.equipment.id(equipmentId);
    if (equipment) {
        equipment.lastMaintenance = completionDate;
        equipment.status = 'operational';
        equipment.maintenanceNotes = notes;
    }
    return equipment;
};

clinicSchema.methods.updateAnalytics = function(analyticsData) {
    this.analytics = {
        ...this.analytics,
        ...analyticsData,
        lastCalculated: new Date()
    };
};

clinicSchema.methods.renewLicense = function(newExpiryDate, renewalFee) {
    this.license.expiryDate = newExpiryDate;
    this.license.status = 'active';
    this.license.lastRenewal = new Date();
    this.license.renewalFee = renewalFee;
};

// Static methods
clinicSchema.statics.findByLocation = function(city, state, zipCode = null) {
    const query = {
        'address.city': new RegExp(city, 'i'),
        'address.state': state.toUpperCase(),
        status: 'active'
    };
    
    if (zipCode) {
        query['address.zipCode'] = zipCode;
    }
    
    return this.find(query);
};

clinicSchema.statics.findByType = function(type) {
    return this.find({ type, status: 'active' });
};

clinicSchema.statics.findNearLocation = function(latitude, longitude, maxDistance = 10) {
    return this.find({
        'address.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance * 1609.34 // Convert miles to meters
            }
        },
        status: 'active'
    });
};

clinicSchema.statics.getExpiringLicenses = function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.find({
        'license.expiryDate': { $lte: futureDate },
        'license.status': 'active',
        status: 'active'
    });
};

clinicSchema.statics.getClinicStats = function(clinicIds = null) {
    const matchStage = { status: 'active' };
    if (clinicIds) {
        matchStage._id = { $in: clinicIds };
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalClinics: { $sum: 1 },
                totalStaff: { $sum: { $size: '$staff' } },
                totalRooms: { $sum: '$capacity.totalRooms' },
                totalEquipment: { $sum: { $size: '$equipment' } },
                averageRating: { $avg: '$marketing.onlineReviews.averageRating' },
                totalPatients: { $sum: '$analytics.patientDemographics.totalPatients' }
            }
        }
    ]);
};

// Create and export model
const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;
