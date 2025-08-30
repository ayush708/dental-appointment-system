/**
 * User Model for Dental Appointment System
 * Comprehensive user management with advanced features
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const { Schema } = mongoose;

// Address sub-schema
const addressSchema = new Schema({
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{5}(-\d{4})?$/.test(v);
            },
            message: 'Invalid zip code format'
        }
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'United States',
        maxlength: [100, 'Country cannot exceed 100 characters']
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    }
}, { _id: false });

// Profile sub-schema
const profileSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'First name can only contain letters and spaces'
        }
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z\s]+$/.test(v);
            },
            message: 'Last name can only contain letters and spaces'
        }
    },
    middleName: {
        type: String,
        trim: true,
        maxlength: [50, 'Middle name cannot exceed 50 characters']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(v) {
                const today = new Date();
                const age = Math.floor((today - v) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 0 && age <= 150;
            },
            message: 'Invalid date of birth'
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['male', 'female', 'other', 'prefer_not_to_say'],
            message: 'Invalid gender value'
        }
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
        default: 'single'
    },
    occupation: {
        type: String,
        trim: true,
        maxlength: [100, 'Occupation cannot exceed 100 characters']
    },
    employer: {
        type: String,
        trim: true,
        maxlength: [100, 'Employer cannot exceed 100 characters']
    },
    socialSecurityNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^\d{3}-\d{2}-\d{4}$/.test(v);
            },
            message: 'Invalid SSN format (XXX-XX-XXXX)'
        },
        select: false // Don't include in queries by default
    },
    driversLicense: {
        number: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        expirationDate: {
            type: Date
        }
    },
    avatar: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || validator.isURL(v);
            },
            message: 'Invalid avatar URL'
        }
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    }
}, { _id: false });

// Emergency contact sub-schema
const emergencyContactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
        maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    relationship: {
        type: String,
        required: [true, 'Relationship is required'],
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Invalid phone number format'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return !v || validator.isEmail(v);
            },
            message: 'Invalid email format'
        }
    },
    address: addressSchema
}, { _id: false });

// Security settings sub-schema
const securitySettingsSchema = new Schema({
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    loginNotifications: {
        type: Boolean,
        default: true
    },
    sessionTimeout: {
        type: Number,
        default: 3600 // 1 hour in seconds
    },
    allowedIPs: [{
        type: String,
        validate: {
            validator: function(v) {
                return validator.isIP(v);
            },
            message: 'Invalid IP address'
        }
    }],
    passwordChangeRequired: {
        type: Boolean,
        default: false
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    accountLockedUntil: {
        type: Date
    }
}, { _id: false });

// Preferences sub-schema
const preferencesSchema = new Schema({
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
    },
    timezone: {
        type: String,
        default: 'America/New_York'
    },
    dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    timeFormat: {
        type: String,
        default: '12h',
        enum: ['12h', '24h']
    },
    theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark', 'auto']
    },
    notifications: {
        email: {
            appointments: { type: Boolean, default: true },
            reminders: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false },
            security: { type: Boolean, default: true },
            system: { type: Boolean, default: true }
        },
        sms: {
            appointments: { type: Boolean, default: true },
            reminders: { type: Boolean, default: true },
            emergency: { type: Boolean, default: true }
        },
        push: {
            appointments: { type: Boolean, default: true },
            reminders: { type: Boolean, default: true },
            chat: { type: Boolean, default: true }
        }
    },
    privacy: {
        showProfile: { type: Boolean, default: true },
        showAppointments: { type: Boolean, default: false },
        allowMarketing: { type: Boolean, default: false },
        dataSharing: { type: Boolean, default: false }
    }
}, { _id: false });

// Main User Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: 'Invalid email format'
        },
        index: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9_]+$/.test(v);
            },
            message: 'Username can only contain letters, numbers, and underscores'
        },
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
            },
            message: 'Invalid phone number format'
        },
        index: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['patient', 'doctor', 'admin', 'staff', 'manager', 'receptionist', 'nurse', 'technician'],
            message: 'Invalid role'
        },
        default: 'patient',
        index: true
    },
    profile: {
        type: profileSchema,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    emergencyContact: emergencyContactSchema,
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        select: false
    },
    verificationTokenExpires: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    securitySettings: {
        type: securitySettingsSchema,
        default: () => ({})
    },
    preferences: {
        type: preferencesSchema,
        default: () => ({})
    },
    lastLogin: {
        type: Date,
        index: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        location: {
            country: String,
            city: String,
            coordinates: [Number]
        },
        success: { type: Boolean, default: true },
        reason: String
    }],
    deviceTokens: [{
        token: String,
        platform: { type: String, enum: ['ios', 'android', 'web'] },
        createdAt: { type: Date, default: Date.now }
    }],
    socialAccounts: [{
        provider: { type: String, enum: ['google', 'facebook', 'apple', 'linkedin'] },
        providerId: String,
        email: String,
        connectedAt: { type: Date, default: Date.now }
    }],
    apiKeys: [{
        name: String,
        key: String,
        permissions: [String],
        createdAt: { type: Date, default: Date.now },
        lastUsed: Date,
        isActive: { type: Boolean, default: true }
    }],
    subscription: {
        plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
        status: { type: String, enum: ['active', 'cancelled', 'expired', 'trial'], default: 'active' },
        startDate: { type: Date, default: Date.now },
        endDate: Date,
        stripeCustomerId: String,
        stripeSubscriptionId: String
    },
    billing: {
        paymentMethods: [{
            type: { type: String, enum: ['card', 'bank', 'paypal'] },
            last4: String,
            brand: String,
            expiryMonth: Number,
            expiryYear: Number,
            isDefault: { type: Boolean, default: false },
            stripePaymentMethodId: String
        }],
        invoices: [{
            invoiceId: String,
            amount: Number,
            currency: { type: String, default: 'USD' },
            status: String,
            date: Date,
            downloadUrl: String
        }]
    },
    analytics: {
        totalAppointments: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        lastAppointment: Date,
        preferredDoctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
        mostCommonTreatments: [String],
        visitFrequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'yearly'] },
        riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
    },
    compliance: {
        hipaaAcknowledged: { type: Boolean, default: false },
        hipaaAcknowledgedDate: Date,
        termsAccepted: { type: Boolean, default: false },
        termsAcceptedDate: Date,
        privacyPolicyAccepted: { type: Boolean, default: false },
        privacyPolicyAcceptedDate: Date,
        consentToTreatment: { type: Boolean, default: false },
        consentToTreatmentDate: Date,
        photographyConsent: { type: Boolean, default: false },
        researchConsent: { type: Boolean, default: false }
    },
    metadata: {
        source: { type: String, default: 'direct' }, // direct, referral, marketing, etc.
        referralCode: String,
        campaignId: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        acquisitionCost: Number,
        lifetimeValue: Number,
        tags: [String],
        notes: String
    },
    flags: {
        isVip: { type: Boolean, default: false },
        isTestAccount: { type: Boolean, default: false },
        requiresAttention: { type: Boolean, default: false },
        hasOutstandingBalance: { type: Boolean, default: false },
        isHighRisk: { type: Boolean, default: false },
        marketingOptOut: { type: Boolean, default: false }
    },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletionReason: String
}, {
    timestamps: true,
    collection: 'users',
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.verificationToken;
            delete ret.verificationTokenExpires;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            delete ret.securitySettings.twoFactorSecret;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

// Text search index
userSchema.index({
    'profile.firstName': 'text',
    'profile.lastName': 'text',
    email: 'text',
    username: 'text'
});

// Compound indexes
userSchema.index({ role: 1, isActive: 1, isVerified: 1 });
userSchema.index({ 'subscription.plan': 1, isActive: 1 });

// Virtual properties
userSchema.virtual('fullName').get(function() {
    if (this.profile.middleName) {
        return `${this.profile.firstName} ${this.profile.middleName} ${this.profile.lastName}`;
    }
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.virtual('age').get(function() {
    if (!this.profile.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

userSchema.virtual('isAccountLocked').get(function() {
    return this.securitySettings.accountLocked || 
           (this.securitySettings.accountLockedUntil && this.securitySettings.accountLockedUntil > Date.now());
});

userSchema.virtual('isSubscriptionActive').get(function() {
    return this.subscription.status === 'active' && 
           (!this.subscription.endDate || this.subscription.endDate > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.securitySettings.lastPasswordChange = new Date();
    }
    
    // Generate username if not provided
    if (this.isNew && !this.username) {
        const baseUsername = this.email.split('@')[0].toLowerCase();
        let username = baseUsername;
        let counter = 1;
        
        while (await this.constructor.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        
        this.username = username;
    }
    
    // Update lastActivity
    if (this.isModified() && !this.isNew) {
        this.lastActivity = new Date();
    }
    
    next();
});

// Pre-remove middleware
userSchema.pre('remove', async function(next) {
    // Soft delete - mark as deleted instead of removing
    this.deletedAt = new Date();
    this.isActive = false;
    await this.save();
    next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role,
        isVerified: this.isVerified
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'dental-appointment-system',
        subject: this._id.toString()
    });
};

userSchema.methods.generateRefreshToken = function() {
    const payload = {
        id: this._id,
        type: 'refresh'
    };
    
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        issuer: 'dental-appointment-system',
        subject: this._id.toString()
    });
};

userSchema.methods.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

userSchema.methods.generatePasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return token;
};

userSchema.methods.recordLogin = function(ipAddress, userAgent, location = {}) {
    this.lastLogin = new Date();
    this.loginHistory.unshift({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        location,
        success: true
    });
    
    // Keep only last 50 login records
    if (this.loginHistory.length > 50) {
        this.loginHistory = this.loginHistory.slice(0, 50);
    }
    
    // Reset failed login attempts
    this.securitySettings.failedLoginAttempts = 0;
    this.securitySettings.accountLocked = false;
    this.securitySettings.accountLockedUntil = undefined;
};

userSchema.methods.recordFailedLogin = function(ipAddress, userAgent, reason) {
    this.loginHistory.unshift({
        timestamp: new Date(),
        ipAddress,
        userAgent,
        success: false,
        reason
    });
    
    this.securitySettings.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.securitySettings.failedLoginAttempts >= 5) {
        this.securitySettings.accountLocked = true;
        this.securitySettings.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
};

userSchema.methods.addDeviceToken = function(token, platform) {
    // Remove existing token if it exists
    this.deviceTokens = this.deviceTokens.filter(dt => dt.token !== token);
    
    // Add new token
    this.deviceTokens.push({ token, platform });
    
    // Keep only last 5 tokens per platform
    const platformTokens = this.deviceTokens.filter(dt => dt.platform === platform);
    if (platformTokens.length > 5) {
        const tokensToRemove = platformTokens.slice(5);
        this.deviceTokens = this.deviceTokens.filter(dt => 
            !tokensToRemove.some(tr => tr.token === dt.token)
        );
    }
};

userSchema.methods.generateApiKey = function(name, permissions = []) {
    const key = crypto.randomBytes(32).toString('hex');
    this.apiKeys.push({
        name,
        key: crypto.createHash('sha256').update(key).digest('hex'),
        permissions
    });
    return key;
};

userSchema.methods.validateApiKey = function(key) {
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = this.apiKeys.find(ak => ak.key === hashedKey && ak.isActive);
    
    if (apiKey) {
        apiKey.lastUsed = new Date();
        return apiKey;
    }
    
    return null;
};

userSchema.methods.hasPermission = function(permission) {
    const rolePermissions = {
        patient: ['view_own_appointments', 'create_appointment', 'update_own_profile'],
        doctor: ['view_appointments', 'create_treatment', 'view_patients', 'update_schedules'],
        nurse: ['view_appointments', 'view_patients', 'create_notes'],
        receptionist: ['view_appointments', 'create_appointment', 'view_patients', 'manage_schedule'],
        staff: ['view_appointments', 'view_patients'],
        manager: ['view_all_appointments', 'view_all_patients', 'manage_staff', 'view_reports'],
        admin: ['*'] // All permissions
    };
    
    const userPermissions = rolePermissions[this.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
};

userSchema.methods.canAccessResource = function(resource, action = 'view') {
    // Resource-based access control
    const accessRules = {
        patient: {
            own_appointments: ['view', 'create', 'update'],
            own_profile: ['view', 'update'],
            own_treatments: ['view'],
            own_invoices: ['view']
        },
        doctor: {
            appointments: ['view', 'create', 'update'],
            patients: ['view', 'create', 'update'],
            treatments: ['view', 'create', 'update'],
            schedules: ['view', 'update']
        },
        admin: {
            '*': ['*']
        }
    };
    
    const userAccess = accessRules[this.role] || {};
    const resourceAccess = userAccess[resource] || userAccess['*'] || [];
    
    return resourceAccess.includes('*') || resourceAccess.includes(action);
};

userSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verificationToken;
    delete obj.verificationTokenExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.securitySettings.twoFactorSecret;
    delete obj.apiKeys;
    delete obj.__v;
    return obj;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ 
        email: email.toLowerCase(),
        isActive: true,
        deletedAt: { $exists: false }
    });
};

userSchema.statics.findByUsername = function(username) {
    return this.findOne({ 
        username: username.toLowerCase(),
        isActive: true,
        deletedAt: { $exists: false }
    });
};

userSchema.statics.findByPhone = function(phone) {
    return this.findOne({ 
        phone,
        isActive: true,
        deletedAt: { $exists: false }
    });
};

userSchema.statics.searchUsers = function(query, options = {}) {
    const {
        role,
        isActive = true,
        limit = 20,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = -1
    } = options;
    
    const searchCriteria = {
        isActive,
        deletedAt: { $exists: false }
    };
    
    if (role) {
        searchCriteria.role = role;
    }
    
    if (query) {
        searchCriteria.$text = { $search: query };
    }
    
    return this.find(searchCriteria)
        .limit(limit)
        .skip(skip)
        .sort({ [sortBy]: sortOrder })
        .select('-password -verificationToken -passwordResetToken');
};

userSchema.statics.getActiveUserCount = function() {
    return this.countDocuments({ 
        isActive: true,
        deletedAt: { $exists: false }
    });
};

userSchema.statics.getUsersByRole = function(role) {
    return this.find({ 
        role,
        isActive: true,
        deletedAt: { $exists: false }
    }).select('-password -verificationToken -passwordResetToken');
};

userSchema.statics.findNearbyUsers = function(coordinates, maxDistance = 5000) {
    return this.find({
        'address.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        isActive: true,
        deletedAt: { $exists: false }
    });
};

userSchema.statics.getSubscriptionStats = function() {
    return this.aggregate([
        {
            $match: {
                isActive: true,
                deletedAt: { $exists: false }
            }
        },
        {
            $group: {
                _id: '$subscription.plan',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$analytics.totalSpent' }
            }
        }
    ]);
};

// Create and export model
const User = mongoose.model('User', userSchema);

module.exports = User;
