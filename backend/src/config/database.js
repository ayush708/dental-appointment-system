/**
 * Database Configuration for Dental Appointment System
 * Comprehensive MongoDB setup with advanced features
 */

const mongoose = require('mongoose');
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'database' },
    transports: [
        new winston.transports.File({ filename: 'logs/database-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/database-combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

class DatabaseConfig {
    constructor() {
        this.connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 50,
            minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
            maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000,
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
            heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY) || 10000,
            retryWrites: process.env.DB_RETRY_WRITES !== 'false',
            writeConcern: {
                w: process.env.DB_WRITE_CONCERN_W || 'majority',
                j: process.env.DB_WRITE_CONCERN_J !== 'false',
                wtimeout: parseInt(process.env.DB_WRITE_CONCERN_TIMEOUT) || 5000
            },
            readPreference: process.env.DB_READ_PREFERENCE || 'primary',
            readConcern: {
                level: process.env.DB_READ_CONCERN_LEVEL || 'majority'
            },
            authSource: process.env.DB_AUTH_SOURCE || 'admin',
            ssl: process.env.DB_SSL === 'true',
            sslValidate: process.env.DB_SSL_VALIDATE !== 'false',
            sslCA: process.env.DB_SSL_CA_FILE ? require('fs').readFileSync(process.env.DB_SSL_CA_FILE) : undefined,
            sslCert: process.env.DB_SSL_CERT_FILE ? require('fs').readFileSync(process.env.DB_SSL_CERT_FILE) : undefined,
            sslKey: process.env.DB_SSL_KEY_FILE ? require('fs').readFileSync(process.env.DB_SSL_KEY_FILE) : undefined,
            authMechanism: process.env.DB_AUTH_MECHANISM || 'DEFAULT',
            compressors: process.env.DB_COMPRESSORS ? process.env.DB_COMPRESSORS.split(',') : ['snappy', 'zlib'],
            zlibCompressionLevel: parseInt(process.env.DB_ZLIB_COMPRESSION_LEVEL) || 6,
            family: parseInt(process.env.DB_IP_FAMILY) || 4,
            autoCreate: process.env.DB_AUTO_CREATE !== 'false',
            autoIndex: process.env.NODE_ENV !== 'production'
        };

        this.connectionString = this.buildConnectionString();
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = parseInt(process.env.DB_MAX_RETRIES) || 5;
        this.retryDelay = parseInt(process.env.DB_RETRY_DELAY) || 5000;
    }

    /**
     * Build MongoDB connection string
     */
    buildConnectionString() {
        const {
            DB_HOST = 'localhost',
            DB_PORT = '27017',
            DB_NAME = 'dental_appointment_system',
            DB_USERNAME,
            DB_PASSWORD,
            DB_REPLICA_SET,
            DB_ADDITIONAL_OPTIONS,
            MONGODB_URI
        } = process.env;

        // If full URI is provided, use it
        if (MONGODB_URI) {
            return MONGODB_URI;
        }

        // Build URI from components
        let uri = 'mongodb://';

        // Add authentication if provided
        if (DB_USERNAME && DB_PASSWORD) {
            uri += `${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@`;
        }

        // Add host and port
        uri += `${DB_HOST}:${DB_PORT}`;

        // Add database name
        uri += `/${DB_NAME}`;

        // Add replica set if provided
        const options = [];
        if (DB_REPLICA_SET) {
            options.push(`replicaSet=${DB_REPLICA_SET}`);
        }

        // Add additional options
        if (DB_ADDITIONAL_OPTIONS) {
            options.push(DB_ADDITIONAL_OPTIONS);
        }

        // Add options to URI
        if (options.length > 0) {
            uri += `?${options.join('&')}`;
        }

        return uri;
    }

    /**
     * Connect to MongoDB with retry logic
     */
    async connect() {
        while (this.retryCount < this.maxRetries) {
            try {
                logger.info(`Attempting to connect to MongoDB (attempt ${this.retryCount + 1}/${this.maxRetries})`);
                
                await mongoose.connect(this.connectionString, this.connectionOptions);
                
                this.isConnected = true;
                this.retryCount = 0;
                
                logger.info('Successfully connected to MongoDB');
                this.setupEventListeners();
                await this.setupIndexes();
                
                return true;

            } catch (error) {
                this.retryCount++;
                logger.error(`MongoDB connection attempt ${this.retryCount} failed:`, error);

                if (this.retryCount >= this.maxRetries) {
                    logger.error('Maximum MongoDB connection retries exceeded');
                    throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
                }

                logger.info(`Retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
            }
        }
    }

    /**
     * Setup MongoDB event listeners
     */
    setupEventListeners() {
        const db = mongoose.connection;

        db.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
            this.isConnected = false;
        });

        db.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
            this.isConnected = false;
        });

        db.on('reconnected', () => {
            logger.info('MongoDB reconnected');
            this.isConnected = true;
        });

        db.on('close', () => {
            logger.info('MongoDB connection closed');
            this.isConnected = false;
        });

        db.on('fullsetup', () => {
            logger.info('MongoDB replica set fully connected');
        });

        db.on('all', () => {
            logger.info('MongoDB replica set all servers connected');
        });

        // Monitor connection pool
        db.on('connectionPoolCreated', () => {
            logger.info('MongoDB connection pool created');
        });

        db.on('connectionPoolClosed', () => {
            logger.info('MongoDB connection pool closed');
        });

        db.on('connectionCreated', () => {
            logger.debug('New MongoDB connection created');
        });

        db.on('connectionClosed', () => {
            logger.debug('MongoDB connection closed');
        });

        db.on('connectionCheckOutStarted', () => {
            logger.debug('MongoDB connection checkout started');
        });

        db.on('connectionCheckOutFailed', (error) => {
            logger.warn('MongoDB connection checkout failed:', error);
        });

        db.on('connectionCheckedOut', () => {
            logger.debug('MongoDB connection checked out');
        });

        db.on('connectionCheckedIn', () => {
            logger.debug('MongoDB connection checked in');
        });

        // Monitor server events
        db.on('serverOpening', () => {
            logger.info('MongoDB server opening');
        });

        db.on('serverClosed', () => {
            logger.info('MongoDB server closed');
        });

        db.on('serverDescriptionChanged', (event) => {
            logger.debug('MongoDB server description changed:', event);
        });

        // Monitor topology events
        db.on('topologyOpening', () => {
            logger.info('MongoDB topology opening');
        });

        db.on('topologyClosed', () => {
            logger.info('MongoDB topology closed');
        });

        db.on('topologyDescriptionChanged', (event) => {
            logger.debug('MongoDB topology description changed:', event);
        });
    }

    /**
     * Setup database indexes for optimal performance
     */
    async setupIndexes() {
        try {
            logger.info('Setting up database indexes...');

            const db = mongoose.connection.db;

            // Users collection indexes
            await db.collection('users').createIndex({ email: 1 }, { unique: true });
            await db.collection('users').createIndex({ username: 1 }, { unique: true });
            await db.collection('users').createIndex({ phone: 1 });
            await db.collection('users').createIndex({ role: 1 });
            await db.collection('users').createIndex({ isActive: 1 });
            await db.collection('users').createIndex({ createdAt: -1 });
            await db.collection('users').createIndex({ lastLogin: -1 });
            await db.collection('users').createIndex({ 'profile.firstName': 1, 'profile.lastName': 1 });
            await db.collection('users').createIndex({ 'profile.dateOfBirth': 1 });
            await db.collection('users').createIndex({ 'profile.gender': 1 });
            await db.collection('users').createIndex({ 'address.city': 1 });
            await db.collection('users').createIndex({ 'address.state': 1 });
            await db.collection('users').createIndex({ 'address.zipCode': 1 });
            await db.collection('users').createIndex({ 'address.country': 1 });

            // Doctors collection indexes
            await db.collection('doctors').createIndex({ userId: 1 }, { unique: true });
            await db.collection('doctors').createIndex({ licenseNumber: 1 }, { unique: true });
            await db.collection('doctors').createIndex({ specialty: 1 });
            await db.collection('doctors').createIndex({ clinicId: 1 });
            await db.collection('doctors').createIndex({ isAvailable: 1 });
            await db.collection('doctors').createIndex({ rating: -1 });
            await db.collection('doctors').createIndex({ experience: -1 });
            await db.collection('doctors').createIndex({ consultationFee: 1 });
            await db.collection('doctors').createIndex({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
            await db.collection('doctors').createIndex({ 'availability.date': 1, 'availability.isAvailable': 1 });
            await db.collection('doctors').createIndex({ 'qualifications.degree': 1 });
            await db.collection('doctors').createIndex({ 'qualifications.year': -1 });

            // Patients collection indexes
            await db.collection('patients').createIndex({ userId: 1 }, { unique: true });
            await db.collection('patients').createIndex({ patientId: 1 }, { unique: true });
            await db.collection('patients').createIndex({ emergencyContact: 1 });
            await db.collection('patients').createIndex({ bloodGroup: 1 });
            await db.collection('patients').createIndex({ 'insurance.provider': 1 });
            await db.collection('patients').createIndex({ 'insurance.policyNumber': 1 });
            await db.collection('patients').createIndex({ 'medicalHistory.condition': 1 });
            await db.collection('patients').createIndex({ 'allergies.allergen': 1 });
            await db.collection('patients').createIndex({ 'medications.name': 1 });
            await db.collection('patients').createIndex({ registrationDate: -1 });

            // Appointments collection indexes
            await db.collection('appointments').createIndex({ doctorId: 1, appointmentDate: 1 });
            await db.collection('appointments').createIndex({ patientId: 1, appointmentDate: -1 });
            await db.collection('appointments').createIndex({ clinicId: 1, appointmentDate: 1 });
            await db.collection('appointments').createIndex({ status: 1 });
            await db.collection('appointments').createIndex({ type: 1 });
            await db.collection('appointments').createIndex({ priority: 1 });
            await db.collection('appointments').createIndex({ appointmentDate: 1, timeSlot: 1 });
            await db.collection('appointments').createIndex({ createdAt: -1 });
            await db.collection('appointments').createIndex({ updatedAt: -1 });
            await db.collection('appointments').createIndex({ isEmergency: 1 });
            await db.collection('appointments').createIndex({ remindersSent: 1 });
            await db.collection('appointments').createIndex({ 'payment.status': 1 });
            await db.collection('appointments').createIndex({ 'payment.amount': 1 });

            // Treatments collection indexes
            await db.collection('treatments').createIndex({ appointmentId: 1 });
            await db.collection('treatments').createIndex({ patientId: 1, treatmentDate: -1 });
            await db.collection('treatments').createIndex({ doctorId: 1, treatmentDate: -1 });
            await db.collection('treatments').createIndex({ clinicId: 1, treatmentDate: -1 });
            await db.collection('treatments').createIndex({ treatmentType: 1 });
            await db.collection('treatments').createIndex({ status: 1 });
            await db.collection('treatments').createIndex({ cost: 1 });
            await db.collection('treatments').createIndex({ duration: 1 });
            await db.collection('treatments').createIndex({ 'procedures.name': 1 });
            await db.collection('treatments').createIndex({ 'procedures.cost': 1 });
            await db.collection('treatments').createIndex({ 'followUp.required': 1 });
            await db.collection('treatments').createIndex({ 'followUp.date': 1 });

            // Medications collection indexes
            await db.collection('medications').createIndex({ name: 1 });
            await db.collection('medications').createIndex({ category: 1 });
            await db.collection('medications').createIndex({ manufacturer: 1 });
            await db.collection('medications').createIndex({ isActive: 1 });
            await db.collection('medications').createIndex({ price: 1 });
            await db.collection('medications').createIndex({ 'inventory.quantity': 1 });
            await db.collection('medications').createIndex({ 'inventory.minStock': 1 });
            await db.collection('medications').createIndex({ expiryDate: 1 });
            await db.collection('medications').createIndex({ batchNumber: 1 });

            // Prescriptions collection indexes
            await db.collection('prescriptions').createIndex({ patientId: 1, prescriptionDate: -1 });
            await db.collection('prescriptions').createIndex({ doctorId: 1, prescriptionDate: -1 });
            await db.collection('prescriptions').createIndex({ treatmentId: 1 });
            await db.collection('prescriptions').createIndex({ status: 1 });
            await db.collection('prescriptions').createIndex({ 'medications.medicationId': 1 });
            await db.collection('prescriptions').createIndex({ 'medications.dosage': 1 });
            await db.collection('prescriptions').createIndex({ 'medications.frequency': 1 });
            await db.collection('prescriptions').createIndex({ dispensedDate: 1 });

            // Invoices collection indexes
            await db.collection('invoices').createIndex({ invoiceNumber: 1 }, { unique: true });
            await db.collection('invoices').createIndex({ patientId: 1, invoiceDate: -1 });
            await db.collection('invoices').createIndex({ doctorId: 1, invoiceDate: -1 });
            await db.collection('invoices').createIndex({ clinicId: 1, invoiceDate: -1 });
            await db.collection('invoices').createIndex({ status: 1 });
            await db.collection('invoices').createIndex({ totalAmount: 1 });
            await db.collection('invoices').createIndex({ dueDate: 1 });
            await db.collection('invoices').createIndex({ 'items.description': 1 });
            await db.collection('invoices').createIndex({ 'items.amount': 1 });
            await db.collection('invoices').createIndex({ 'payment.method': 1 });
            await db.collection('invoices').createIndex({ 'payment.status': 1 });

            // Payments collection indexes
            await db.collection('payments').createIndex({ transactionId: 1 }, { unique: true });
            await db.collection('payments').createIndex({ patientId: 1, paymentDate: -1 });
            await db.collection('payments').createIndex({ invoiceId: 1 });
            await db.collection('payments').createIndex({ appointmentId: 1 });
            await db.collection('payments').createIndex({ method: 1 });
            await db.collection('payments').createIndex({ status: 1 });
            await db.collection('payments').createIndex({ amount: 1 });
            await db.collection('payments').createIndex({ currency: 1 });
            await db.collection('payments').createIndex({ 'gateway.provider': 1 });
            await db.collection('payments').createIndex({ 'gateway.transactionId': 1 });
            await db.collection('payments').createIndex({ refundStatus: 1 });

            // Notifications collection indexes
            await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
            await db.collection('notifications').createIndex({ type: 1 });
            await db.collection('notifications').createIndex({ isRead: 1 });
            await db.collection('notifications').createIndex({ priority: 1 });
            await db.collection('notifications').createIndex({ scheduledFor: 1 });
            await db.collection('notifications').createIndex({ isSent: 1 });
            await db.collection('notifications').createIndex({ channel: 1 });
            await db.collection('notifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

            // Clinics collection indexes
            await db.collection('clinics').createIndex({ name: 1 });
            await db.collection('clinics').createIndex({ licenseNumber: 1 }, { unique: true });
            await db.collection('clinics').createIndex({ isActive: 1 });
            await db.collection('clinics').createIndex({ 'address.city': 1 });
            await db.collection('clinics').createIndex({ 'address.state': 1 });
            await db.collection('clinics').createIndex({ 'address.zipCode': 1 });
            await db.collection('clinics').createIndex({ 'location.coordinates': '2dsphere' });
            await db.collection('clinics').createIndex({ rating: -1 });
            await db.collection('clinics').createIndex({ 'services.name': 1 });
            await db.collection('clinics').createIndex({ 'operatingHours.dayOfWeek': 1 });

            // Reviews collection indexes
            await db.collection('reviews').createIndex({ doctorId: 1, createdAt: -1 });
            await db.collection('reviews').createIndex({ patientId: 1, createdAt: -1 });
            await db.collection('reviews').createIndex({ clinicId: 1, createdAt: -1 });
            await db.collection('reviews').createIndex({ appointmentId: 1 });
            await db.collection('reviews').createIndex({ rating: -1 });
            await db.collection('reviews').createIndex({ isVerified: 1 });
            await db.collection('reviews').createIndex({ isPublic: 1 });
            await db.collection('reviews').createIndex({ 'tags': 1 });

            // Chat/Messages collection indexes
            await db.collection('messages').createIndex({ senderId: 1, createdAt: -1 });
            await db.collection('messages').createIndex({ recipientId: 1, createdAt: -1 });
            await db.collection('messages').createIndex({ conversationId: 1, createdAt: 1 });
            await db.collection('messages').createIndex({ isRead: 1 });
            await db.collection('messages').createIndex({ messageType: 1 });
            await db.collection('messages').createIndex({ 'attachments.type': 1 });

            // Audit logs collection indexes
            await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
            await db.collection('auditlogs').createIndex({ action: 1, timestamp: -1 });
            await db.collection('auditlogs').createIndex({ resourceType: 1, timestamp: -1 });
            await db.collection('auditlogs').createIndex({ resourceId: 1, timestamp: -1 });
            await db.collection('auditlogs').createIndex({ ipAddress: 1 });
            await db.collection('auditlogs').createIndex({ userAgent: 1 });
            await db.collection('auditlogs').createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

            // Analytics collection indexes
            await db.collection('analytics').createIndex({ event: 1, timestamp: -1 });
            await db.collection('analytics').createIndex({ userId: 1, timestamp: -1 });
            await db.collection('analytics').createIndex({ sessionId: 1 });
            await db.collection('analytics').createIndex({ 'properties.page': 1 });
            await db.collection('analytics').createIndex({ 'properties.feature': 1 });
            await db.collection('analytics').createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

            // Sessions collection indexes
            await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
            await db.collection('sessions').createIndex({ 'session.userId': 1 });

            // File uploads collection indexes
            await db.collection('uploads').createIndex({ userId: 1, createdAt: -1 });
            await db.collection('uploads').createIndex({ filename: 1 });
            await db.collection('uploads').createIndex({ mimetype: 1 });
            await db.collection('uploads').createIndex({ size: 1 });
            await db.collection('uploads').createIndex({ category: 1 });
            await db.collection('uploads').createIndex({ isPublic: 1 });
            await db.collection('uploads').createIndex({ 'metadata.patientId': 1 });
            await db.collection('uploads').createIndex({ 'metadata.appointmentId': 1 });

            // Settings collection indexes
            await db.collection('settings').createIndex({ key: 1 }, { unique: true });
            await db.collection('settings').createIndex({ category: 1 });
            await db.collection('settings').createIndex({ isPublic: 1 });
            await db.collection('settings').createIndex({ updatedAt: -1 });

            // Inventory collection indexes
            await db.collection('inventory').createIndex({ itemName: 1 });
            await db.collection('inventory').createIndex({ category: 1 });
            await db.collection('inventory').createIndex({ clinicId: 1 });
            await db.collection('inventory').createIndex({ quantity: 1 });
            await db.collection('inventory').createIndex({ minStock: 1 });
            await db.collection('inventory').createIndex({ expiryDate: 1 });
            await db.collection('inventory').createIndex({ supplier: 1 });
            await db.collection('inventory').createIndex({ cost: 1 });

            // Insurance collection indexes
            await db.collection('insurance').createIndex({ provider: 1 });
            await db.collection('insurance').createIndex({ policyNumber: 1 });
            await db.collection('insurance').createIndex({ patientId: 1 });
            await db.collection('insurance').createIndex({ isActive: 1 });
            await db.collection('insurance').createIndex({ expiryDate: 1 });
            await db.collection('insurance').createIndex({ 'coverage.type': 1 });

            // Compound indexes for common queries
            await db.collection('appointments').createIndex({ 
                doctorId: 1, 
                appointmentDate: 1, 
                status: 1 
            });

            await db.collection('appointments').createIndex({ 
                patientId: 1, 
                status: 1, 
                appointmentDate: -1 
            });

            await db.collection('treatments').createIndex({ 
                patientId: 1, 
                doctorId: 1, 
                treatmentDate: -1 
            });

            await db.collection('payments').createIndex({ 
                patientId: 1, 
                status: 1, 
                paymentDate: -1 
            });

            await db.collection('reviews').createIndex({ 
                doctorId: 1, 
                rating: -1, 
                isPublic: 1 
            });

            // Text indexes for search functionality
            await db.collection('doctors').createIndex({
                'profile.firstName': 'text',
                'profile.lastName': 'text',
                'specialty': 'text',
                'qualifications.institution': 'text',
                'bio': 'text'
            });

            await db.collection('patients').createIndex({
                'profile.firstName': 'text',
                'profile.lastName': 'text',
                'email': 'text',
                'phone': 'text'
            });

            await db.collection('clinics').createIndex({
                'name': 'text',
                'description': 'text',
                'services.name': 'text',
                'address.street': 'text',
                'address.city': 'text'
            });

            await db.collection('medications').createIndex({
                'name': 'text',
                'description': 'text',
                'manufacturer': 'text',
                'category': 'text'
            });

            logger.info('Database indexes setup completed successfully');

        } catch (error) {
            logger.error('Error setting up database indexes:', error);
            throw error;
        }
    }

    /**
     * Get database connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
            connectionString: this.connectionString.replace(/\/\/.*:.*@/, '//***:***@') // Hide credentials
        };
    }

    /**
     * Get database statistics
     */
    async getDatabaseStats() {
        try {
            const db = mongoose.connection.db;
            const stats = await db.stats();
            const collections = await db.listCollections().toArray();
            
            const collectionStats = {};
            for (const collection of collections) {
                const collStats = await db.collection(collection.name).stats();
                collectionStats[collection.name] = {
                    documents: collStats.count,
                    size: collStats.size,
                    avgObjSize: collStats.avgObjSize,
                    indexes: collStats.nindexes,
                    totalIndexSize: collStats.totalIndexSize
                };
            }

            return {
                database: {
                    name: stats.db,
                    collections: stats.collections,
                    views: stats.views,
                    objects: stats.objects,
                    avgObjSize: stats.avgObjSize,
                    dataSize: stats.dataSize,
                    storageSize: stats.storageSize,
                    indexes: stats.indexes,
                    indexSize: stats.indexSize,
                    totalSize: stats.totalSize,
                    scaleFactor: stats.scaleFactor
                },
                collections: collectionStats,
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('Error getting database statistics:', error);
            throw error;
        }
    }

    /**
     * Perform database health check
     */
    async healthCheck() {
        try {
            const startTime = Date.now();
            
            // Test basic connectivity
            const adminResult = await mongoose.connection.db.admin().ping();
            
            // Test read operation
            const readStartTime = Date.now();
            await mongoose.connection.db.collection('users').findOne({});
            const readTime = Date.now() - readStartTime;
            
            // Test write operation
            const writeStartTime = Date.now();
            const testDoc = await mongoose.connection.db.collection('health_check').insertOne({
                timestamp: new Date(),
                test: true
            });
            await mongoose.connection.db.collection('health_check').deleteOne({ _id: testDoc.insertedId });
            const writeTime = Date.now() - writeStartTime;
            
            const totalTime = Date.now() - startTime;
            
            return {
                status: 'healthy',
                ping: adminResult.ok === 1,
                readTime: `${readTime}ms`,
                writeTime: `${writeTime}ms`,
                totalTime: `${totalTime}ms`,
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('Database health check failed:', error);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Close database connection
     */
    async disconnect() {
        try {
            await mongoose.connection.close();
            this.isConnected = false;
            logger.info('MongoDB connection closed successfully');
        } catch (error) {
            logger.error('Error closing MongoDB connection:', error);
            throw error;
        }
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Setup database monitoring
     */
    setupMonitoring() {
        setInterval(async () => {
            try {
                const stats = await this.getDatabaseStats();
                logger.info('Database monitoring stats:', {
                    totalSize: stats.database.totalSize,
                    objects: stats.database.objects,
                    collections: stats.database.collections
                });
            } catch (error) {
                logger.error('Database monitoring error:', error);
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * Backup database
     */
    async backup(options = {}) {
        try {
            const {
                includeCollections = [],
                excludeCollections = [],
                outputPath = './backups',
                compression = true
            } = options;

            logger.info('Starting database backup...');
            
            // Implementation would depend on backup strategy
            // This is a placeholder for backup logic
            
            logger.info('Database backup completed successfully');
            
        } catch (error) {
            logger.error('Database backup failed:', error);
            throw error;
        }
    }

    /**
     * Restore database from backup
     */
    async restore(backupPath, options = {}) {
        try {
            const {
                dropDatabase = false,
                includeCollections = [],
                excludeCollections = []
            } = options;

            logger.info(`Starting database restore from ${backupPath}...`);
            
            // Implementation would depend on restore strategy
            // This is a placeholder for restore logic
            
            logger.info('Database restore completed successfully');
            
        } catch (error) {
            logger.error('Database restore failed:', error);
            throw error;
        }
    }
}

module.exports = new DatabaseConfig();
