/**
 * Patient Model for Dental Appointment System
 * Comprehensive patient management with medical history and insurance
 */

const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

// Medical History sub-schema
const medicalHistorySchema = new Schema({
    condition: {
        type: String,
        required: [true, 'Medical condition is required'],
        trim: true,
        maxlength: [200, 'Condition cannot exceed 200 characters']
    },
    diagnosisDate: {
        type: Date,
        required: [true, 'Diagnosis date is required']
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'chronic', 'in_remission'],
        default: 'active'
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'mild'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    treatingPhysician: String,
    medications: [String],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Allergy sub-schema
const allergySchema = new Schema({
    allergen: {
        type: String,
        required: [true, 'Allergen is required'],
        trim: true,
        maxlength: [100, 'Allergen cannot exceed 100 characters']
    },
    type: {
        type: String,
        enum: ['food', 'medication', 'environmental', 'other'],
        required: [true, 'Allergy type is required']
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'life_threatening'],
        required: [true, 'Severity is required']
    },
    symptoms: [String],
    treatment: String,
    notes: String,
    discoveredDate: Date,
    lastReaction: Date
}, { _id: true });

// Current Medication sub-schema
const medicationSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true,
        maxlength: [200, 'Medication name cannot exceed 200 characters']
    },
    dosage: {
        type: String,
        required: [true, 'Dosage is required'],
        trim: true
    },
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        trim: true
    },
    prescribedBy: String,
    startDate: Date,
    endDate: Date,
    purpose: String,
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: true });

// Insurance sub-schema
const insuranceSchema = new Schema({
    provider: {
        type: String,
        required: [true, 'Insurance provider is required'],
        trim: true,
        maxlength: [100, 'Provider cannot exceed 100 characters']
    },
    policyNumber: {
        type: String,
        required: [true, 'Policy number is required'],
        trim: true,
        uppercase: true
    },
    groupNumber: String,
    policyHolderName: {
        type: String,
        required: [true, 'Policy holder name is required'],
        trim: true
    },
    policyHolderRelationship: {
        type: String,
        enum: ['self', 'spouse', 'parent', 'child', 'other'],
        default: 'self'
    },
    effectiveDate: {
        type: Date,
        required: [true, 'Effective date is required']
    },
    expiryDate: Date,
    copayAmount: Number,
    deductible: Number,
    annualMaximum: Number,
    planType: {
        type: String,
        enum: ['hmo', 'ppo', 'indemnity', 'dhmo', 'other']
    },
    coverage: {
        preventive: { type: Number, default: 100 }, // percentage
        basic: { type: Number, default: 80 },
        major: { type: Number, default: 50 },
        orthodontics: { type: Number, default: 50 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'invalid', 'expired'],
        default: 'pending'
    },
    verificationDate: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String
}, { _id: true });

// Dental History sub-schema
const dentalHistorySchema = new Schema({
    lastVisit: Date,
    lastCleaning: Date,
    lastXray: Date,
    previousDentist: {
        name: String,
        clinic: String,
        phone: String,
        address: String
    },
    oralHygiene: {
        brushingFrequency: {
            type: String,
            enum: ['once_daily', 'twice_daily', 'three_times_daily', 'rarely'],
            default: 'twice_daily'
        },
        flossingFrequency: {
            type: String,
            enum: ['daily', 'few_times_week', 'weekly', 'rarely', 'never'],
            default: 'daily'
        },
        mouthwashUse: {
            type: Boolean,
            default: false
        },
        electricToothbrush: {
            type: Boolean,
            default: false
        }
    },
    habits: {
        smoking: {
            status: {
                type: String,
                enum: ['never', 'former', 'current'],
                default: 'never'
            },
            packsPerDay: Number,
            yearsSmoked: Number,
            quitDate: Date
        },
        alcohol: {
            frequency: {
                type: String,
                enum: ['never', 'rarely', 'weekly', 'daily'],
                default: 'never'
            }
        },
        grinding: {
            type: Boolean,
            default: false
        },
        clenching: {
            type: Boolean,
            default: false
        },
        nailBiting: {
            type: Boolean,
            default: false
        },
        iceCrewing: {
            type: Boolean,
            default: false
        }
    },
    concerns: [String],
    previousTreatments: [{
        treatment: String,
        date: Date,
        provider: String,
        notes: String
    }],
    familyHistory: [{
        condition: String,
        relationship: String,
        notes: String
    }]
}, { _id: false });

// Vital Signs sub-schema
const vitalSignsSchema = new Schema({
    bloodPressure: {
        systolic: Number,
        diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedDate: {
        type: Date,
        default: Date.now
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String
}, { _id: true, timestamps: true });

// Main Patient Schema
const patientSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true,
        index: true
    },
    patientId: {
        type: String,
        required: [true, 'Patient ID is required'],
        unique: true,
        uppercase: true,
        index: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        index: true
    },
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Emergency contact name is required'],
            trim: true
        },
        relationship: {
            type: String,
            required: [true, 'Relationship is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Emergency contact phone is required'],
            validate: {
                validator: function(v) {
                    return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
                },
                message: 'Invalid phone number format'
            }
        },
        email: {
            type: String,
            lowercase: true,
            validate: {
                validator: function(v) {
                    return !v || validator.isEmail(v);
                },
                message: 'Invalid email format'
            }
        },
        address: String
    },
    medicalHistory: [medicalHistorySchema],
    allergies: [allergySchema],
    currentMedications: [medicationSchema],
    dentalHistory: dentalHistorySchema,
    vitalSigns: [vitalSignsSchema],
    insurance: [insuranceSchema],
    preferredDoctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    preferredClinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    registrationDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastVisit: {
        date: Date,
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
        notes: String
    },
    nextAppointment: {
        date: Date,
        doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
        type: String
    },
    treatmentPlan: {
        isActive: {
            type: Boolean,
            default: false
        },
        treatments: [{
            treatmentType: String,
            description: String,
            estimatedCost: Number,
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium'
            },
            status: {
                type: String,
                enum: ['planned', 'in_progress', 'completed', 'cancelled'],
                default: 'planned'
            },
            estimatedSessions: Number,
            completedSessions: { type: Number, default: 0 },
            notes: String,
            proposedBy: { type: Schema.Types.ObjectId, ref: 'Doctor' },
            approvedBy: { type: Schema.Types.ObjectId, ref: 'Patient' },
            proposedDate: Date,
            approvedDate: Date
        }],
        totalEstimatedCost: Number,
        insuranceCoverage: Number,
        estimatedOutOfPocket: Number,
        createdBy: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        lastUpdated: Date
    },
    financials: {
        totalBilled: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        outstandingBalance: { type: Number, default: 0 },
        creditLimit: { type: Number, default: 0 },
        paymentHistory: [{
            amount: Number,
            date: Date,
            method: String,
            reference: String,
            appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' }
        }],
        insuranceReimbursements: [{
            amount: Number,
            date: Date,
            provider: String,
            claimNumber: String,
            treatmentId: { type: Schema.Types.ObjectId, ref: 'Treatment' }
        }]
    },
    preferences: {
        appointmentReminders: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            phone: { type: Boolean, default: false }
        },
        reminderTiming: {
            type: String,
            enum: ['1_hour', '2_hours', '4_hours', '1_day', '2_days', '1_week'],
            default: '1_day'
        },
        communicationMethod: {
            type: String,
            enum: ['email', 'sms', 'phone', 'app'],
            default: 'email'
        },
        appointmentType: {
            type: String,
            enum: ['in_person', 'telehealth', 'hybrid'],
            default: 'in_person'
        },
        timePreferences: {
            morning: { type: Boolean, default: true },
            afternoon: { type: Boolean, default: true },
            evening: { type: Boolean, default: false }
        },
        dayPreferences: {
            weekdays: { type: Boolean, default: true },
            weekends: { type: Boolean, default: false }
        }
    },
    riskAssessment: {
        level: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },
        factors: [String],
        lastAssessment: Date,
        assessedBy: { type: Schema.Types.ObjectId, ref: 'Doctor' },
        notes: String,
        followUpRequired: {
            type: Boolean,
            default: false
        },
        followUpDate: Date
    },
    consents: {
        treatment: {
            given: { type: Boolean, default: false },
            date: Date,
            witnessedBy: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        photography: {
            given: { type: Boolean, default: false },
            date: Date,
            purposes: [String]
        },
        marketing: {
            given: { type: Boolean, default: false },
            date: Date,
            channels: [String]
        },
        dataSharing: {
            given: { type: Boolean, default: false },
            date: Date,
            scope: [String]
        },
        research: {
            given: { type: Boolean, default: false },
            date: Date,
            studies: [String]
        }
    },
    documents: [{
        type: {
            type: String,
            enum: ['xray', 'photo', 'scan', 'report', 'consent', 'insurance', 'prescription', 'other'],
            required: true
        },
        title: String,
        description: String,
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        mimeType: String,
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        uploadedDate: { type: Date, default: Date.now },
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
        treatmentId: { type: Schema.Types.ObjectId, ref: 'Treatment' },
        isPublic: { type: Boolean, default: false },
        tags: [String]
    }],
    notes: [{
        content: {
            type: String,
            required: [true, 'Note content is required'],
            trim: true
        },
        type: {
            type: String,
            enum: ['medical', 'administrative', 'financial', 'behavioral', 'other'],
            default: 'medical'
        },
        priority: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal'
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: Date,
        appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
        treatmentId: { type: Schema.Types.ObjectId, ref: 'Treatment' },
        tags: [String]
    }],
    flags: {
        isVip: { type: Boolean, default: false },
        requiresSpecialCare: { type: Boolean, default: false },
        hasAnxiety: { type: Boolean, default: false },
        isHighRisk: { type: Boolean, default: false },
        requiresInterpreter: { type: Boolean, default: false },
        interpreterLanguage: String,
        hasOutstandingBalance: { type: Boolean, default: false },
        isFrequentNoShow: { type: Boolean, default: false },
        requiresPremedication: { type: Boolean, default: false },
        hasComplexMedicalHistory: { type: Boolean, default: false }
    },
    statistics: {
        totalAppointments: { type: Number, default: 0 },
        completedAppointments: { type: Number, default: 0 },
        cancelledAppointments: { type: Number, default: 0 },
        noShowAppointments: { type: Number, default: 0 },
        totalTreatments: { type: Number, default: 0 },
        averageWaitTime: { type: Number, default: 0 },
        satisfactionScore: { type: Number, default: 0 },
        referralsGiven: { type: Number, default: 0 },
        complaintsReceived: { type: Number, default: 0 },
        lastAppointmentDate: Date,
        averageAppointmentGap: Number // in days
    },
    metadata: {
        source: { type: String, default: 'direct' },
        referredBy: String,
        campaignId: String,
        isActive: { type: Boolean, default: true },
        inactiveReason: String,
        inactiveDate: Date,
        tags: [String],
        customFields: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    collection: 'patients',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
patientSchema.index({ userId: 1 }, { unique: true });
patientSchema.index({ patientId: 1 }, { unique: true });
patientSchema.index({ bloodGroup: 1 });
patientSchema.index({ 'insurance.provider': 1 });
patientSchema.index({ 'insurance.policyNumber': 1 });
patientSchema.index({ registrationDate: -1 });
patientSchema.index({ 'lastVisit.date': -1 });
patientSchema.index({ 'nextAppointment.date': 1 });
patientSchema.index({ 'riskAssessment.level': 1 });
patientSchema.index({ 'metadata.isActive': 1 });

// Text search index
patientSchema.index({
    patientId: 'text',
    'emergencyContact.name': 'text',
    'medicalHistory.condition': 'text',
    'allergies.allergen': 'text'
});

// Virtual properties
patientSchema.virtual('age').get(function() {
    // This would be calculated from the User profile dateOfBirth
    return null; // To be populated from User model
});

patientSchema.virtual('hasActiveInsurance').get(function() {
    return this.insurance.some(ins => ins.isActive && ins.verificationStatus === 'verified');
});

patientSchema.virtual('primaryInsurance').get(function() {
    return this.insurance.find(ins => ins.isActive && ins.verificationStatus === 'verified');
});

patientSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalAppointments === 0) return 100;
    return Math.round((this.statistics.completedAppointments / this.statistics.totalAppointments) * 100);
});

patientSchema.virtual('noShowRate').get(function() {
    if (this.statistics.totalAppointments === 0) return 0;
    return Math.round((this.statistics.noShowAppointments / this.statistics.totalAppointments) * 100);
});

patientSchema.virtual('hasActiveTreatmentPlan').get(function() {
    return this.treatmentPlan.isActive && this.treatmentPlan.treatments.some(t => t.status === 'planned' || t.status === 'in_progress');
});

// Pre-save middleware
patientSchema.pre('save', async function(next) {
    // Generate patient ID if new
    if (this.isNew && !this.patientId) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            patientId: new RegExp(`^PAT${year}`)
        });
        this.patientId = `PAT${year}${(count + 1).toString().padStart(6, '0')}`;
    }
    
    // Update financial calculations
    if (this.financials) {
        this.financials.outstandingBalance = this.financials.totalBilled - this.financials.totalPaid;
        this.flags.hasOutstandingBalance = this.financials.outstandingBalance > 0;
    }
    
    // Update no-show flag
    if (this.statistics.totalAppointments > 0) {
        const noShowRate = (this.statistics.noShowAppointments / this.statistics.totalAppointments) * 100;
        this.flags.isFrequentNoShow = noShowRate >= 20; // 20% or more no-shows
    }
    
    // Update risk assessment based on medical history
    if (this.medicalHistory.length > 5 || this.allergies.length > 3) {
        this.flags.hasComplexMedicalHistory = true;
    }
    
    next();
});

// Instance methods
patientSchema.methods.addMedicalHistory = function(condition, diagnosisDate, options = {}) {
    const historyItem = {
        condition,
        diagnosisDate,
        status: options.status || 'active',
        severity: options.severity || 'mild',
        notes: options.notes,
        treatingPhysician: options.treatingPhysician,
        medications: options.medications || []
    };
    
    this.medicalHistory.push(historyItem);
    return historyItem;
};

patientSchema.methods.addAllergy = function(allergen, type, severity, options = {}) {
    const allergy = {
        allergen,
        type,
        severity,
        symptoms: options.symptoms || [],
        treatment: options.treatment,
        notes: options.notes,
        discoveredDate: options.discoveredDate || new Date()
    };
    
    this.allergies.push(allergy);
    return allergy;
};

patientSchema.methods.addCurrentMedication = function(name, dosage, frequency, options = {}) {
    const medication = {
        name,
        dosage,
        frequency,
        prescribedBy: options.prescribedBy,
        startDate: options.startDate || new Date(),
        endDate: options.endDate,
        purpose: options.purpose,
        notes: options.notes
    };
    
    this.currentMedications.push(medication);
    return medication;
};

patientSchema.methods.addInsurance = function(provider, policyNumber, policyHolderName, effectiveDate, options = {}) {
    const insurance = {
        provider,
        policyNumber,
        policyHolderName,
        effectiveDate,
        policyHolderRelationship: options.relationship || 'self',
        expiryDate: options.expiryDate,
        copayAmount: options.copayAmount,
        deductible: options.deductible,
        annualMaximum: options.annualMaximum,
        planType: options.planType,
        coverage: options.coverage || {},
        notes: options.notes
    };
    
    this.insurance.push(insurance);
    return insurance;
};

patientSchema.methods.addVitalSigns = function(vitals, recordedBy) {
    const vitalSigns = {
        ...vitals,
        recordedBy,
        recordedDate: new Date()
    };
    
    // Calculate BMI if height and weight are provided
    if (vitals.height && vitals.weight) {
        const heightInMeters = vitals.height / 100; // Convert cm to meters
        vitalSigns.bmi = Math.round((vitals.weight / (heightInMeters * heightInMeters)) * 100) / 100;
    }
    
    this.vitalSigns.push(vitalSigns);
    return vitalSigns;
};

patientSchema.methods.addNote = function(content, type, createdBy, options = {}) {
    const note = {
        content,
        type: type || 'medical',
        priority: options.priority || 'normal',
        isPrivate: options.isPrivate || false,
        createdBy,
        appointmentId: options.appointmentId,
        treatmentId: options.treatmentId,
        tags: options.tags || []
    };
    
    this.notes.push(note);
    return note;
};

patientSchema.methods.addDocument = function(type, title, fileUrl, uploadedBy, options = {}) {
    const document = {
        type,
        title,
        fileUrl,
        uploadedBy,
        description: options.description,
        fileName: options.fileName,
        fileSize: options.fileSize,
        mimeType: options.mimeType,
        appointmentId: options.appointmentId,
        treatmentId: options.treatmentId,
        isPublic: options.isPublic || false,
        tags: options.tags || []
    };
    
    this.documents.push(document);
    return document;
};

patientSchema.methods.updateStatistics = function(appointmentData) {
    this.statistics.totalAppointments += 1;
    
    if (appointmentData.status === 'completed') {
        this.statistics.completedAppointments += 1;
        this.statistics.lastAppointmentDate = appointmentData.date;
    } else if (appointmentData.status === 'cancelled') {
        this.statistics.cancelledAppointments += 1;
    } else if (appointmentData.status === 'no_show') {
        this.statistics.noShowAppointments += 1;
    }
    
    if (appointmentData.waitTime) {
        const totalWaitTime = this.statistics.averageWaitTime * (this.statistics.totalAppointments - 1) + appointmentData.waitTime;
        this.statistics.averageWaitTime = Math.round(totalWaitTime / this.statistics.totalAppointments);
    }
};

patientSchema.methods.hasAllergy = function(allergen) {
    return this.allergies.some(allergy => 
        allergy.allergen.toLowerCase().includes(allergen.toLowerCase())
    );
};

patientSchema.methods.hasMedicalCondition = function(condition) {
    return this.medicalHistory.some(history => 
        history.condition.toLowerCase().includes(condition.toLowerCase()) && 
        history.status === 'active'
    );
};

patientSchema.methods.isOnMedication = function(medication) {
    return this.currentMedications.some(med => 
        med.name.toLowerCase().includes(medication.toLowerCase()) && med.isActive
    );
};

patientSchema.methods.getActiveInsurance = function() {
    return this.insurance.filter(ins => ins.isActive && ins.verificationStatus === 'verified');
};

patientSchema.methods.calculateInsuranceCoverage = function(treatmentCost, treatmentType) {
    const activeInsurance = this.getActiveInsurance();
    if (!activeInsurance.length) return 0;
    
    const insurance = activeInsurance[0]; // Use primary insurance
    let coveragePercentage = 0;
    
    switch (treatmentType) {
        case 'preventive':
            coveragePercentage = insurance.coverage.preventive || 0;
            break;
        case 'basic':
            coveragePercentage = insurance.coverage.basic || 0;
            break;
        case 'major':
            coveragePercentage = insurance.coverage.major || 0;
            break;
        case 'orthodontics':
            coveragePercentage = insurance.coverage.orthodontics || 0;
            break;
        default:
            coveragePercentage = insurance.coverage.basic || 0;
    }
    
    const coveredAmount = (treatmentCost * coveragePercentage) / 100;
    const copay = insurance.copayAmount || 0;
    
    return Math.max(0, coveredAmount - copay);
};

patientSchema.methods.getComprehensiveHistory = function() {
    return {
        medical: this.medicalHistory,
        dental: this.dentalHistory,
        allergies: this.allergies,
        medications: this.currentMedications.filter(med => med.isActive),
        vitalSigns: this.vitalSigns.slice(-5), // Last 5 readings
        notes: this.notes.filter(note => !note.isPrivate).slice(-10) // Last 10 non-private notes
    };
};

// Static methods
patientSchema.statics.findByPatientId = function(patientId) {
    return this.findOne({ 
        patientId: patientId.toUpperCase(),
        'metadata.isActive': true 
    }).populate('userId', 'profile email phone');
};

patientSchema.statics.searchPatients = function(searchTerm, options = {}) {
    const query = {
        'metadata.isActive': true
    };
    
    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }
    
    if (options.doctorId) {
        query.preferredDoctor = options.doctorId;
    }
    
    if (options.clinicId) {
        query.preferredClinic = options.clinicId;
    }
    
    if (options.riskLevel) {
        query['riskAssessment.level'] = options.riskLevel;
    }
    
    if (options.hasInsurance !== undefined) {
        if (options.hasInsurance) {
            query['insurance.isActive'] = true;
        } else {
            query.insurance = { $size: 0 };
        }
    }
    
    return this.find(query)
        .populate('userId', 'profile email phone')
        .populate('preferredDoctor', 'specialty')
        .sort({ registrationDate: -1 });
};

patientSchema.statics.getPatientsByRiskLevel = function(riskLevel) {
    return this.find({ 
        'riskAssessment.level': riskLevel,
        'metadata.isActive': true 
    }).populate('userId', 'profile email phone');
};

patientSchema.statics.getPatientsWithOutstandingBalance = function() {
    return this.find({ 
        'flags.hasOutstandingBalance': true,
        'metadata.isActive': true 
    }).populate('userId', 'profile email phone');
};

patientSchema.statics.getPatientStatistics = function() {
    return this.aggregate([
        {
            $match: {
                'metadata.isActive': true
            }
        },
        {
            $group: {
                _id: null,
                totalPatients: { $sum: 1 },
                averageAge: { $avg: '$age' },
                maleCount: { $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] } },
                femaleCount: { $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] } },
                withInsurance: { $sum: { $cond: [{ $gt: [{ $size: '$insurance' }, 0] }, 1, 0] } },
                highRisk: { $sum: { $cond: [{ $eq: ['$riskAssessment.level', 'high'] }, 1, 0] } },
                totalRevenue: { $sum: '$financials.totalPaid' },
                outstandingBalance: { $sum: '$financials.outstandingBalance' }
            }
        }
    ]);
};

// Create and export model
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
