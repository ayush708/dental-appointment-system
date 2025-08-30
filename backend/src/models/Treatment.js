/**
 * Treatment Model for Dental Appointment System
 * Comprehensive treatment and procedure management
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Treatment sub-schemas
const materialSchema = new Schema({
    materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['filling', 'crown', 'bridge', 'implant', 'cement', 'anesthetic', 'medication', 'other'],
        required: true
    },
    brand: String,
    batchNumber: String,
    expiryDate: Date,
    quantity: {
        value: { type: Number, required: true },
        unit: { type: String, required: true }
    },
    cost: Number,
    supplier: String,
    notes: String
}, { _id: false });

const procedureStepSchema = new Schema({
    stepNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    estimatedDuration: Number, // in minutes
    actualDuration: Number,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'skipped'],
        default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    complications: String,
    notes: String,
    images: [{
        url: String,
        caption: String,
        takenAt: Date
    }]
}, { _id: true });

const qualityMetricSchema = new Schema({
    metric: {
        type: String,
        required: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    },
    target: Schema.Types.Mixed,
    unit: String,
    assessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assessedAt: { type: Date, default: Date.now },
    notes: String
}, { _id: false });

const complicationSchema = new Schema({
    type: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'severe'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    occurred: {
        type: Date,
        default: Date.now
    },
    discoveredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    resolved: { type: Boolean, default: false },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    preventable: { type: Boolean, default: false },
    reportedToAuthorities: { type: Boolean, default: false },
    followUpRequired: { type: Boolean, default: false }
}, { _id: true });

// Main Treatment Schema
const treatmentSchema = new Schema({
    treatmentId: {
        type: String,
        required: [true, 'Treatment ID is required'],
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
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        index: true
    },
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Clinic ID is required'],
        index: true
    },
    treatmentPlanId: {
        type: Schema.Types.ObjectId,
        ref: 'TreatmentPlan',
        index: true
    },
    name: {
        type: String,
        required: [true, 'Treatment name is required'],
        trim: true,
        index: true
    },
    type: {
        type: String,
        required: [true, 'Treatment type is required'],
        enum: [
            'cleaning',
            'examination',
            'filling',
            'extraction',
            'root_canal',
            'crown',
            'bridge',
            'implant',
            'scaling',
            'polishing',
            'fluoride_treatment',
            'sealant',
            'orthodontic',
            'cosmetic',
            'surgical',
            'periodontal',
            'endodontic',
            'prosthetic',
            'preventive',
            'emergency'
        ],
        index: true
    },
    category: {
        type: String,
        enum: ['preventive', 'diagnostic', 'restorative', 'surgical', 'cosmetic', 'orthodontic', 'emergency'],
        required: true,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
        default: 'normal',
        index: true
    },
    urgency: {
        type: String,
        enum: ['elective', 'urgent', 'emergency'],
        default: 'elective'
    },
    status: {
        type: String,
        enum: [
            'planned',
            'scheduled',
            'in_progress',
            'completed',
            'cancelled',
            'postponed',
            'on_hold',
            'failed',
            'partial'
        ],
        default: 'planned',
        index: true
    },
    phase: {
        type: String,
        enum: ['planning', 'preparation', 'treatment', 'recovery', 'follow_up'],
        default: 'planning'
    },
    description: {
        type: String,
        required: [true, 'Treatment description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    indication: {
        type: String,
        required: true,
        trim: true
    },
    contraindications: [String],
    teethInvolved: [{
        toothNumber: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^[1-4][1-8]|[A-T]$/.test(v);
                },
                message: 'Invalid tooth number format'
            }
        },
        surface: {
            type: String,
            enum: ['mesial', 'distal', 'occlusal', 'buccal', 'lingual', 'incisal', 'complete']
        },
        condition: String,
        notes: String
    }],
    diagnosis: {
        primary: {
            code: String,
            description: String
        },
        secondary: [{
            code: String,
            description: String
        }],
        differential: [{
            code: String,
            description: String,
            probability: Number
        }]
    },
    treatmentGoals: [String],
    expectedOutcome: String,
    prognosis: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'guarded'],
        required: true
    },
    estimatedDuration: {
        sessions: {
            type: Number,
            required: true,
            min: [1, 'Minimum 1 session required']
        },
        totalMinutes: {
            type: Number,
            required: true,
            min: [15, 'Minimum 15 minutes required']
        },
        sessionDuration: Number // average per session
    },
    actualDuration: {
        sessions: Number,
        totalMinutes: Number,
        startDate: Date,
        endDate: Date
    },
    procedures: [procedureStepSchema],
    anesthesia: {
        type: {
            type: String,
            enum: ['local', 'general', 'sedation', 'none'],
            default: 'none'
        },
        agent: String,
        dosage: String,
        administeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
        administeredAt: Date,
        duration: Number, // in minutes
        sideEffects: [String],
        effectiveness: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor']
        }
    },
    materials: [materialSchema],
    equipment: [{
        equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
        name: String,
        type: String,
        settings: Schema.Types.Mixed,
        usageDuration: Number,
        condition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'needs_repair'],
            default: 'good'
        }
    }],
    assistants: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['dental_assistant', 'hygienist', 'anesthetist', 'nurse'],
            required: true
        },
        tasks: [String],
        performance: {
            type: String,
            enum: ['excellent', 'good', 'satisfactory', 'needs_improvement']
        }
    }],
    preOperativeInstructions: [String],
    postOperativeInstructions: [String],
    preOperativeAssessment: {
        vitalSigns: {
            bloodPressure: String,
            heartRate: Number,
            temperature: Number,
            oxygenSaturation: Number
        },
        medicalHistory: String,
        allergies: [String],
        currentMedications: [String],
        riskFactors: [String],
        assessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assessedAt: Date,
        clearanceRequired: { type: Boolean, default: false },
        clearanceObtained: { type: Boolean, default: false }
    },
    postOperativeAssessment: {
        immediateCondition: {
            type: String,
            enum: ['stable', 'satisfactory', 'concerning', 'critical'],
            default: 'stable'
        },
        painLevel: {
            type: Number,
            min: 0,
            max: 10
        },
        swelling: {
            type: String,
            enum: ['none', 'mild', 'moderate', 'severe']
        },
        bleeding: {
            type: String,
            enum: ['none', 'minimal', 'moderate', 'excessive']
        },
        functionality: {
            type: String,
            enum: ['normal', 'limited', 'impaired', 'severely_impaired']
        },
        complications: [complicationSchema],
        notes: String,
        assessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assessedAt: Date
    },
    qualityMetrics: [qualityMetricSchema],
    riskAssessment: {
        preOperative: {
            level: {
                type: String,
                enum: ['low', 'medium', 'high', 'very_high'],
                default: 'low'
            },
            factors: [String],
            mitigationStrategies: [String]
        },
        intraOperative: {
            level: {
                type: String,
                enum: ['low', 'medium', 'high', 'very_high'],
                default: 'low'
            },
            factors: [String],
            complications: [String]
        },
        postOperative: {
            level: {
                type: String,
                enum: ['low', 'medium', 'high', 'very_high'],
                default: 'low'
            },
            factors: [String],
            monitoringRequired: [String]
        }
    },
    consent: {
        obtained: { type: Boolean, default: false },
        obtainedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        obtainedAt: Date,
        witnessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        form: String, // URL to consent form
        risksExplained: [String],
        alternativesDiscussed: [String],
        questionsAnswered: { type: Boolean, default: false },
        patientUnderstands: { type: Boolean, default: false }
    },
    insurance: {
        covered: { type: Boolean, default: false },
        provider: String,
        policyNumber: String,
        preAuthorization: {
            required: { type: Boolean, default: false },
            obtained: { type: Boolean, default: false },
            number: String,
            expiryDate: Date
        },
        claimNumber: String,
        coveragePercentage: Number,
        maximumBenefit: Number,
        deductible: Number,
        copayAmount: Number,
        estimatedCoverage: Number
    },
    billing: {
        estimatedCost: {
            type: Number,
            required: true,
            min: [0, 'Cost cannot be negative']
        },
        actualCost: Number,
        breakdown: [{
            item: String,
            quantity: Number,
            unitPrice: Number,
            totalPrice: Number,
            taxable: { type: Boolean, default: true }
        }],
        labCosts: Number,
        materialCosts: Number,
        equipmentCosts: Number,
        facilityFees: Number,
        discountApplied: Number,
        discountReason: String,
        taxAmount: Number,
        totalAmount: Number,
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'overdue'],
            default: 'pending'
        },
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' }
    },
    followUp: {
        required: { type: Boolean, default: false },
        appointments: [{
            type: String,
            scheduledDate: Date,
            appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
            purpose: String,
            status: {
                type: String,
                enum: ['scheduled', 'completed', 'missed', 'cancelled'],
                default: 'scheduled'
            }
        }],
        instructions: [String],
        warningSignsToWatch: [String],
        emergencyContacts: [{
            name: String,
            phone: String,
            role: String
        }]
    },
    documentation: {
        clinicalNotes: [{
            timestamp: { type: Date, default: Date.now },
            author: { type: Schema.Types.ObjectId, ref: 'User' },
            content: String,
            type: {
                type: String,
                enum: ['progress', 'complication', 'observation', 'plan'],
                default: 'progress'
            }
        }],
        images: [{
            type: {
                type: String,
                enum: ['pre_treatment', 'during_treatment', 'post_treatment', 'xray', 'scan'],
                required: true
            },
            url: String,
            caption: String,
            takenAt: Date,
            takenBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }],
        reports: [{
            type: String,
            url: String,
            generatedAt: Date,
            generatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }]
    },
    outcomes: {
        success: {
            type: Boolean,
            default: null
        },
        complications: [complicationSchema],
        patientSatisfaction: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comments: String,
            wouldRecommend: Boolean,
            collectedAt: Date
        },
        functionalImprovement: {
            type: String,
            enum: ['significant', 'moderate', 'minimal', 'none', 'worse'],
            default: 'moderate'
        },
        aestheticImprovement: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'worse'],
            default: 'good'
        },
        painReduction: {
            type: String,
            enum: ['complete', 'significant', 'moderate', 'minimal', 'none', 'worse'],
            default: 'significant'
        }
    },
    research: {
        partOfStudy: { type: Boolean, default: false },
        studyId: String,
        studyName: String,
        consentForResearch: { type: Boolean, default: false },
        dataPoints: [Schema.Types.Mixed],
        anonymizedId: String
    },
    quality: {
        peerReview: {
            required: { type: Boolean, default: false },
            reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            reviewDate: Date,
            score: {
                type: Number,
                min: 0,
                max: 100
            },
            comments: String,
            recommendations: [String]
        },
        accreditation: {
            standardsMet: [String],
            deficiencies: [String],
            improvementPlan: String
        }
    },
    metadata: {
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        version: { type: Number, default: 1 },
        source: String,
        externalId: String,
        tags: [String],
        customFields: Schema.Types.Mixed,
        complexity: {
            type: String,
            enum: ['simple', 'moderate', 'complex', 'highly_complex'],
            default: 'moderate'
        }
    }
}, {
    timestamps: true,
    collection: 'treatments',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
treatmentSchema.index({ treatmentId: 1 }, { unique: true });
treatmentSchema.index({ patientId: 1, createdAt: -1 });
treatmentSchema.index({ doctorId: 1, createdAt: -1 });
treatmentSchema.index({ clinicId: 1, status: 1 });
treatmentSchema.index({ type: 1, category: 1 });
treatmentSchema.index({ status: 1, priority: 1 });
treatmentSchema.index({ appointmentId: 1 });
treatmentSchema.index({ treatmentPlanId: 1 });

// Compound indexes
treatmentSchema.index({ 
    patientId: 1, 
    status: 1, 
    createdAt: -1 
});
treatmentSchema.index({ 
    doctorId: 1, 
    type: 1, 
    status: 1 
});
treatmentSchema.index({ 
    clinicId: 1, 
    category: 1, 
    createdAt: -1 
});

// Text search index
treatmentSchema.index({
    name: 'text',
    description: 'text',
    indication: 'text',
    'documentation.clinicalNotes.content': 'text'
});

// Virtual properties
treatmentSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed';
});

treatmentSchema.virtual('isInProgress').get(function() {
    return this.status === 'in_progress';
});

treatmentSchema.virtual('completionPercentage').get(function() {
    if (this.procedures.length === 0) return 0;
    
    const completed = this.procedures.filter(p => p.status === 'completed').length;
    return Math.round((completed / this.procedures.length) * 100);
});

treatmentSchema.virtual('totalMaterialCost').get(function() {
    return this.materials.reduce((total, material) => total + (material.cost || 0), 0);
});

treatmentSchema.virtual('hasComplications').get(function() {
    return this.postOperativeAssessment && 
           this.postOperativeAssessment.complications && 
           this.postOperativeAssessment.complications.length > 0;
});

treatmentSchema.virtual('riskLevel').get(function() {
    const risks = [
        this.riskAssessment.preOperative.level,
        this.riskAssessment.intraOperative.level,
        this.riskAssessment.postOperative.level
    ];
    
    if (risks.includes('very_high')) return 'very_high';
    if (risks.includes('high')) return 'high';
    if (risks.includes('medium')) return 'medium';
    return 'low';
});

treatmentSchema.virtual('treatmentDuration').get(function() {
    if (this.actualDuration.startDate && this.actualDuration.endDate) {
        return Math.ceil((this.actualDuration.endDate - this.actualDuration.startDate) / (1000 * 60 * 60 * 24));
    }
    return null;
});

// Pre-save middleware
treatmentSchema.pre('save', async function(next) {
    // Generate treatment ID if new
    if (this.isNew && !this.treatmentId) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await this.constructor.countDocuments({
            treatmentId: new RegExp(`^TRT${year}${month}`)
        });
        this.treatmentId = `TRT${year}${month}${(count + 1).toString().padStart(6, '0')}`;
    }
    
    // Update version on modification
    if (!this.isNew) {
        this.metadata.version += 1;
    }
    
    // Set actual start date when treatment begins
    if (this.status === 'in_progress' && !this.actualDuration.startDate) {
        this.actualDuration.startDate = new Date();
    }
    
    // Set actual end date when treatment completes
    if (this.status === 'completed' && !this.actualDuration.endDate) {
        this.actualDuration.endDate = new Date();
        this.actualDuration.sessions = this.procedures.filter(p => p.status === 'completed').length;
        this.actualDuration.totalMinutes = this.procedures.reduce((total, p) => total + (p.actualDuration || 0), 0);
    }
    
    next();
});

// Instance methods
treatmentSchema.methods.start = function(startedBy) {
    this.status = 'in_progress';
    this.phase = 'treatment';
    this.actualDuration.startDate = new Date();
    this.metadata.lastModifiedBy = startedBy;
    
    this.addClinicalNote('Treatment started', 'progress', startedBy);
};

treatmentSchema.methods.complete = function(completedBy, success = true) {
    this.status = 'completed';
    this.phase = 'recovery';
    this.actualDuration.endDate = new Date();
    this.outcomes.success = success;
    this.metadata.lastModifiedBy = completedBy;
    
    this.addClinicalNote('Treatment completed', 'progress', completedBy);
};

treatmentSchema.methods.cancel = function(reason, cancelledBy) {
    this.status = 'cancelled';
    this.metadata.lastModifiedBy = cancelledBy;
    
    this.addClinicalNote(`Treatment cancelled: ${reason}`, 'plan', cancelledBy);
};

treatmentSchema.methods.postpone = function(reason, postponedBy, newDate = null) {
    this.status = 'postponed';
    this.metadata.lastModifiedBy = postponedBy;
    
    const note = newDate ? 
        `Treatment postponed until ${newDate}: ${reason}` : 
        `Treatment postponed: ${reason}`;
    
    this.addClinicalNote(note, 'plan', postponedBy);
};

treatmentSchema.methods.addProcedure = function(title, description, estimatedDuration) {
    const stepNumber = this.procedures.length + 1;
    const procedure = {
        stepNumber,
        title,
        description,
        estimatedDuration
    };
    
    this.procedures.push(procedure);
    return procedure;
};

treatmentSchema.methods.startProcedure = function(procedureId, performedBy) {
    const procedure = this.procedures.id(procedureId);
    if (procedure) {
        procedure.status = 'in_progress';
        procedure.startedAt = new Date();
        procedure.performedBy = performedBy;
    }
    return procedure;
};

treatmentSchema.methods.completeProcedure = function(procedureId, actualDuration, notes = '') {
    const procedure = this.procedures.id(procedureId);
    if (procedure) {
        procedure.status = 'completed';
        procedure.completedAt = new Date();
        procedure.actualDuration = actualDuration;
        if (notes) procedure.notes = notes;
    }
    return procedure;
};

treatmentSchema.methods.addMaterial = function(material) {
    this.materials.push(material);
    
    // Update material costs in billing
    if (this.billing) {
        this.billing.materialCosts = this.totalMaterialCost;
    }
};

treatmentSchema.methods.addComplication = function(type, description, severity, discoveredBy) {
    const complication = {
        type,
        description,
        severity,
        discoveredBy
    };
    
    if (!this.postOperativeAssessment) {
        this.postOperativeAssessment = {};
    }
    if (!this.postOperativeAssessment.complications) {
        this.postOperativeAssessment.complications = [];
    }
    
    this.postOperativeAssessment.complications.push(complication);
    this.addClinicalNote(`Complication: ${description}`, 'complication', discoveredBy);
    
    return complication;
};

treatmentSchema.methods.resolveComplication = function(complicationId, resolution, resolvedBy) {
    const complication = this.postOperativeAssessment.complications.id(complicationId);
    if (complication) {
        complication.resolved = true;
        complication.resolution = resolution;
        complication.resolvedAt = new Date();
        complication.resolvedBy = resolvedBy;
        
        this.addClinicalNote(`Complication resolved: ${resolution}`, 'progress', resolvedBy);
    }
    return complication;
};

treatmentSchema.methods.addClinicalNote = function(content, type, author) {
    const note = {
        content,
        type: type || 'progress',
        author,
        timestamp: new Date()
    };
    
    if (!this.documentation.clinicalNotes) {
        this.documentation.clinicalNotes = [];
    }
    
    this.documentation.clinicalNotes.push(note);
    return note;
};

treatmentSchema.methods.addImage = function(type, url, caption, takenBy) {
    const image = {
        type,
        url,
        caption,
        takenAt: new Date(),
        takenBy
    };
    
    if (!this.documentation.images) {
        this.documentation.images = [];
    }
    
    this.documentation.images.push(image);
    return image;
};

treatmentSchema.methods.recordVitals = function(vitals, assessedBy) {
    if (!this.preOperativeAssessment) {
        this.preOperativeAssessment = {};
    }
    
    this.preOperativeAssessment.vitalSigns = vitals;
    this.preOperativeAssessment.assessedBy = assessedBy;
    this.preOperativeAssessment.assessedAt = new Date();
};

treatmentSchema.methods.obtainConsent = function(obtainedBy, witnessedBy, risksExplained, alternativesDiscussed) {
    this.consent = {
        obtained: true,
        obtainedBy,
        obtainedAt: new Date(),
        witnessedBy,
        risksExplained: risksExplained || [],
        alternativesDiscussed: alternativesDiscussed || [],
        questionsAnswered: true,
        patientUnderstands: true
    };
    
    this.addClinicalNote('Informed consent obtained', 'plan', obtainedBy);
};

treatmentSchema.methods.addQualityMetric = function(metric, value, target, unit, assessedBy) {
    const qualityMetric = {
        metric,
        value,
        target,
        unit,
        assessedBy
    };
    
    this.qualityMetrics.push(qualityMetric);
    return qualityMetric;
};

treatmentSchema.methods.scheduleFollowUp = function(type, scheduledDate, purpose) {
    if (!this.followUp.appointments) {
        this.followUp.appointments = [];
    }
    
    const followUpAppointment = {
        type,
        scheduledDate,
        purpose
    };
    
    this.followUp.appointments.push(followUpAppointment);
    this.followUp.required = true;
    
    return followUpAppointment;
};

treatmentSchema.methods.recordPatientSatisfaction = function(rating, comments, wouldRecommend) {
    this.outcomes.patientSatisfaction = {
        rating,
        comments,
        wouldRecommend,
        collectedAt: new Date()
    };
};

treatmentSchema.methods.updateBilling = function(actualCost, breakdown) {
    if (!this.billing) this.billing = {};
    
    this.billing.actualCost = actualCost;
    if (breakdown) this.billing.breakdown = breakdown;
    
    // Calculate totals
    this.billing.totalAmount = actualCost + (this.billing.taxAmount || 0) - (this.billing.discountApplied || 0);
};

// Static methods
treatmentSchema.statics.findByPatient = function(patientId, limit = 10) {
    return this.find({ patientId })
        .populate('doctorId', 'specialty')
        .populate('appointmentId', 'appointmentDate')
        .sort({ createdAt: -1 })
        .limit(limit);
};

treatmentSchema.statics.findByDoctor = function(doctorId, startDate, endDate) {
    const query = { doctorId };
    
    if (startDate && endDate) {
        query.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }
    
    return this.find(query)
        .populate('patientId', 'profile')
        .sort({ createdAt: -1 });
};

treatmentSchema.statics.findByType = function(type, clinicId = null) {
    const query = { type };
    if (clinicId) query.clinicId = clinicId;
    
    return this.find(query)
        .populate('patientId doctorId')
        .sort({ createdAt: -1 });
};

treatmentSchema.statics.getCompletedTreatments = function(startDate, endDate, clinicId = null) {
    const query = {
        status: 'completed',
        'actualDuration.endDate': {
            $gte: startDate,
            $lte: endDate
        }
    };
    
    if (clinicId) query.clinicId = clinicId;
    
    return this.find(query)
        .populate('patientId doctorId')
        .sort({ 'actualDuration.endDate': -1 });
};

treatmentSchema.statics.getTreatmentStats = function(startDate, endDate, clinicId = null) {
    const matchStage = {
        createdAt: {
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
                totalTreatments: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                inProgress: {
                    $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                },
                totalRevenue: { $sum: '$billing.actualCost' },
                averageDuration: { $avg: '$actualDuration.totalMinutes' },
                successRate: {
                    $avg: { $cond: ['$outcomes.success', 1, 0] }
                }
            }
        }
    ]);
};

treatmentSchema.statics.getComplicationStats = function(startDate, endDate, clinicId = null) {
    const matchStage = {
        'postOperativeAssessment.complications': { $exists: true, $ne: [] },
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    };
    
    if (clinicId) {
        matchStage.clinicId = clinicId;
    }
    
    return this.aggregate([
        { $match: matchStage },
        { $unwind: '$postOperativeAssessment.complications' },
        {
            $group: {
                _id: '$postOperativeAssessment.complications.type',
                count: { $sum: 1 },
                resolved: {
                    $sum: { $cond: ['$postOperativeAssessment.complications.resolved', 1, 0] }
                },
                averageResolutionTime: {
                    $avg: {
                        $subtract: [
                            '$postOperativeAssessment.complications.resolvedAt',
                            '$postOperativeAssessment.complications.occurred'
                        ]
                    }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Create and export model
const Treatment = mongoose.model('Treatment', treatmentSchema);

module.exports = Treatment;
