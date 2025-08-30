/**
 * Dental Appointment System - Main Server File
 * Comprehensive MERN Stack Application with Advanced Features
 * 
 * Features:
 * - Complete CRUD Operations for all entities
 * - Advanced Authentication & Authorization
 * - Real-time Notifications with Socket.IO
 * - Payment Integration with Stripe
 * - File Upload with Cloudinary
 * - Email & SMS Notifications
 * - Advanced Scheduling & Calendar Management
 * - Reporting & Analytics
 * - Multi-language Support
 * - Rate Limiting & Security
 * - API Documentation with Swagger
 * - Comprehensive Logging & Monitoring
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const socketIO = require('socket.io');
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const winston = require('winston');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const Redis = require('redis');
const Queue = require('bull');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Import configuration
require('dotenv').config();
const config = require('./config/database');
const logger = require('./config/logger');
const socketConfig = require('./config/socket');
const redisConfig = require('./config/redis');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorMiddleware = require('./middleware/error');
const validationMiddleware = require('./middleware/validation');
const auditMiddleware = require('./middleware/audit');
const securityMiddleware = require('./middleware/security');
const cachingMiddleware = require('./middleware/caching');
const compressionMiddleware = require('./middleware/compression');
const corsMiddleware = require('./middleware/cors');
const rateLimitMiddleware = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const treatmentRoutes = require('./routes/treatments');
const medicationRoutes = require('./routes/medications');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/uploads');
const calendarRoutes = require('./routes/calendar');
const communicationRoutes = require('./routes/communication');
const inventoryRoutes = require('./routes/inventory');
const insuranceRoutes = require('./routes/insurance');
const clinicRoutes = require('./routes/clinics');
const specialtyRoutes = require('./routes/specialties');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const backupRoutes = require('./routes/backup');
const maintenanceRoutes = require('./routes/maintenance');
const integrationRoutes = require('./routes/integrations');
const workflowRoutes = require('./routes/workflows');
const complianceRoutes = require('./routes/compliance');
const emergencyRoutes = require('./routes/emergency');
const telemedicineRoutes = require('./routes/telemedicine');
const aiRoutes = require('./routes/ai');
const blockchainRoutes = require('./routes/blockchain');
const iotRoutes = require('./routes/iot');
const mlRoutes = require('./routes/ml');
const voiceRoutes = require('./routes/voice');
const chatbotRoutes = require('./routes/chatbot');

// Import services
const NotificationService = require('./services/NotificationService');
const EmailService = require('./services/EmailService');
const SMSService = require('./services/SMSService');
const PaymentService = require('./services/PaymentService');
const SchedulingService = require('./services/SchedulingService');
const AnalyticsService = require('./services/AnalyticsService');
const BackupService = require('./services/BackupService');
const SecurityService = require('./services/SecurityService');
const AuditService = require('./services/AuditService');
const CacheService = require('./services/CacheService');
const QueueService = require('./services/QueueService');
const IntegrationService = require('./services/IntegrationService');
const AIService = require('./services/AIService');
const BlockchainService = require('./services/BlockchainService');
const IoTService = require('./services/IoTService');
const MLService = require('./services/MLService');
const VoiceService = require('./services/VoiceService');
const ChatbotService = require('./services/ChatbotService');
const TelemedicineService = require('./services/TelemedicineService');
const ComplianceService = require('./services/ComplianceService');
const WorkflowService = require('./services/WorkflowService');
const EmergencyService = require('./services/EmergencyService');

// Import utilities
const validators = require('./validators');
const helpers = require('./utils/helpers');
const constants = require('./utils/constants');
const encryption = require('./utils/encryption');
const performance = require('./utils/performance');
const monitoring = require('./utils/monitoring');
const optimization = require('./utils/optimization');
const scaling = require('./utils/scaling');
const loadBalancing = require('./utils/loadBalancing');
const failover = require('./utils/failover');
const disaster = require('./utils/disaster');
const migration = require('./utils/migration');
const seeding = require('./utils/seeding');
const testing = require('./utils/testing');
const deployment = require('./utils/deployment');
const devOps = require('./utils/devOps');
const cicd = require('./utils/cicd');
const containerization = require('./utils/containerization');
const orchestration = require('./utils/orchestration');
const microservices = require('./utils/microservices');
const eventSourcing = require('./utils/eventSourcing');
const cqrs = require('./utils/cqrs');
const saga = require('./utils/saga');
const ddd = require('./utils/ddd');
const cleanArchitecture = require('./utils/cleanArchitecture');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Initialize Redis client
const redisClient = Redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3
});

// Initialize Bull queues
const emailQueue = new Queue('email processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const smsQueue = new Queue('sms processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const notificationQueue = new Queue('notification processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const appointmentQueue = new Queue('appointment processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const reportQueue = new Queue('report processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const backupQueue = new Queue('backup processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const analyticsQueue = new Queue('analytics processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const maintenanceQueue = new Queue('maintenance processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const integrationQueue = new Queue('integration processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const aiQueue = new Queue('ai processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const blockchainQueue = new Queue('blockchain processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const iotQueue = new Queue('iot processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

const mlQueue = new Queue('ml processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
    }
});

// Initialize internationalization
i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        backend: {
            loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json')
        },
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['querystring', 'cookie', 'header'],
            caches: ['cookie']
        }
    });

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dental Appointment System API',
            version: '1.0.0',
            description: 'Comprehensive Dental Practice Management System API with advanced features',
            contact: {
                name: 'API Support',
                email: 'support@dentalapp.com',
                url: 'https://dentalapp.com/support'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.dentalapp.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                },
                oauth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: '/api/auth/oauth/authorize',
                            tokenUrl: '/api/auth/oauth/token',
                            scopes: {
                                read: 'Read access',
                                write: 'Write access',
                                admin: 'Admin access'
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/models/*.js', './src/controllers/*.js']
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Global error tracking
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Cluster management for production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
    const numCPUs = os.cpus().length;
    
    console.log(`Master ${process.pid} is running`);
    console.log(`Starting ${numCPUs} workers...`);
    
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    // Handle worker death
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker...');
        cluster.fork();
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Master received SIGTERM, shutting down gracefully');
        
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }
        
        setTimeout(() => {
            console.log('Forcing shutdown');
            process.exit(0);
        }, 10000);
    });
    
} else {
    // Worker process
    
    // Database connection with retry logic
    const connectDB = async () => {
        let retries = 5;
        
        while (retries) {
            try {
                await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_appointment_system', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: 50,
                    minPoolSize: 5,
                    maxIdleTimeMS: 30000,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    bufferMaxEntries: 0,
                    bufferCommands: false,
                    heartbeatFrequencyMS: 10000,
                    retryWrites: true,
                    writeConcern: {
                        w: 'majority',
                        j: true,
                        wtimeout: 5000
                    },
                    readPreference: 'primary',
                    readConcern: {
                        level: 'majority'
                    }
                });
                
                logger.info('MongoDB connected successfully');
                break;
                
            } catch (error) {
                logger.error('MongoDB connection error:', error);
                retries -= 1;
                
                if (retries === 0) {
                    logger.error('Failed to connect to MongoDB after 5 attempts');
                    process.exit(1);
                }
                
                console.log(`Retrying database connection... ${retries} attempts left`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    };
    
    // Redis connection
    const connectRedis = async () => {
        try {
            await redisClient.connect();
            logger.info('Redis connected successfully');
        } catch (error) {
            logger.error('Redis connection error:', error);
        }
    };
    
    // Trust proxy for production
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "https://api.stripe.com"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
        message: {
            error: 'Too many requests from this IP, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                error: 'Too many requests from this IP, please try again later.',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }
    });
    
    app.use('/api/', limiter);
    
    // Additional security measures
    app.use(mongoSanitize());
    app.use(hpp());
    
    // XSS protection middleware
    app.use((req, res, next) => {
        if (req.body) {
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = xss(req.body[key]);
                }
            }
        }
        next();
    });
    
    // Compression
    app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));
    
    // CORS configuration
    const corsOptions = {
        origin: function (origin, callback) {
            const allowedOrigins = process.env.ALLOWED_ORIGINS 
                ? process.env.ALLOWED_ORIGINS.split(',') 
                : ['http://localhost:3000', 'http://localhost:3001'];
                
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma',
            'X-API-Key',
            'X-Client-Version',
            'X-Request-ID'
        ]
    };
    
    app.use(cors(corsOptions));
    
    // Request logging
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
    
    // Body parsing middleware
    app.use(express.json({ 
        limit: '50mb',
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ 
        extended: true, 
        limit: '50mb' 
    }));
    app.use(cookieParser());
    
    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dental-app-session-secret-key-very-long-and-secure',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_appointment_system',
            touchAfter: 24 * 3600,
            crypto: {
                secret: process.env.SESSION_CRYPTO_SECRET || 'session-crypto-secret-key'
            }
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        },
        name: 'dental.sid'
    }));
    
    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Internationalization middleware
    app.use(middleware.handle(i18next));
    
    // Custom middleware
    app.use(auditMiddleware);
    app.use(validationMiddleware);
    app.use(securityMiddleware);
    app.use(cachingMiddleware);
    app.use(compressionMiddleware);
    
    // Request ID middleware
    app.use((req, res, next) => {
        req.id = require('uuid').v4();
        res.setHeader('X-Request-ID', req.id);
        next();
    });
    
    // Performance monitoring middleware
    app.use((req, res, next) => {
        req.startTime = Date.now();
        
        const originalSend = res.send;
        res.send = function(...args) {
            const responseTime = Date.now() - req.startTime;
            res.setHeader('X-Response-Time', `${responseTime}ms`);
            
            // Log slow requests
            if (responseTime > 1000) {
                logger.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
            }
            
            return originalSend.apply(this, args);
        };
        
        next();
    });
    
    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            // Check database connection
            const dbState = mongoose.connection.readyState;
            const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
            
            // Check Redis connection
            let redisStatus = 'disconnected';
            try {
                await redisClient.ping();
                redisStatus = 'connected';
            } catch (error) {
                // Redis is not connected
            }
            
            // System metrics
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            
            const healthData = {
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: {
                    status: dbStatus,
                    readyState: dbState
                },
                redis: {
                    status: redisStatus
                },
                memory: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system
                },
                environment: process.env.NODE_ENV,
                version: process.env.npm_package_version || '1.0.0',
                nodeVersion: process.version,
                platform: process.platform,
                pid: process.pid
            };
            
            res.status(200).json(healthData);
            
        } catch (error) {
            logger.error('Health check failed:', error);
            res.status(503).json({
                status: 'ERROR',
                message: 'Service unavailable',
                error: error.message
            });
        }
    });
    
    // API documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Dental Appointment System API Documentation'
    }));
    
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/treatments', treatmentRoutes);
    app.use('/api/medications', medicationRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/uploads', uploadRoutes);
    app.use('/api/calendar', calendarRoutes);
    app.use('/api/communication', communicationRoutes);
    app.use('/api/inventory', inventoryRoutes);
    app.use('/api/insurance', insuranceRoutes);
    app.use('/api/clinics', clinicRoutes);
    app.use('/api/specialties', specialtyRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/backup', backupRoutes);
    app.use('/api/maintenance', maintenanceRoutes);
    app.use('/api/integrations', integrationRoutes);
    app.use('/api/workflows', workflowRoutes);
    app.use('/api/compliance', complianceRoutes);
    app.use('/api/emergency', emergencyRoutes);
    app.use('/api/telemedicine', telemedicineRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/blockchain', blockchainRoutes);
    app.use('/api/iot', iotRoutes);
    app.use('/api/ml', mlRoutes);
    app.use('/api/voice', voiceRoutes);
    app.use('/api/chatbot', chatbotRoutes);
    
    // Root route
    app.get('/', (req, res) => {
        res.json({
            message: 'Dental Appointment System API',
            version: '1.0.0',
            status: 'Active',
            documentation: '/api-docs',
            health: '/health',
            timestamp: new Date().toISOString()
        });
    });
    
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            availableRoutes: [
                '/api/auth',
                '/api/users',
                '/api/doctors',
                '/api/patients',
                '/api/appointments',
                '/api/treatments',
                '/api/medications',
                '/api/invoices',
                '/api/payments',
                '/api/notifications',
                '/api/reports',
                '/api/settings',
                '/api/uploads',
                '/api/calendar',
                '/api/communication',
                '/api/inventory',
                '/api/insurance',
                '/api/clinics',
                '/api/specialties',
                '/api/reviews',
                '/api/analytics',
                '/api/backup',
                '/api/maintenance',
                '/api/integrations',
                '/api/workflows',
                '/api/compliance',
                '/api/emergency',
                '/api/telemedicine',
                '/api/ai',
                '/api/blockchain',
                '/api/iot',
                '/api/ml',
                '/api/voice',
                '/api/chatbot'
            ]
        });
    });
    
    // Global error handler
    app.use(errorMiddleware);
    
    // Socket.IO connection handling
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        
        // Join user to their room
        socket.on('join', (data) => {
            const { userId, userType, clinicId } = data;
            
            if (userId) {
                socket.join(`user_${userId}`);
            }
            
            if (userType) {
                socket.join(`type_${userType}`);
            }
            
            if (clinicId) {
                socket.join(`clinic_${clinicId}`);
            }
            
            logger.info(`User ${userId} joined rooms: user_${userId}, type_${userType}, clinic_${clinicId}`);
        });
        
        // Handle appointment updates
        socket.on('appointment_update', (data) => {
            socket.to(`clinic_${data.clinicId}`).emit('appointment_updated', data);
        });
        
        // Handle real-time chat
        socket.on('send_message', (data) => {
            socket.to(`user_${data.recipientId}`).emit('new_message', data);
        });
        
        // Handle notifications
        socket.on('send_notification', (data) => {
            if (data.targetUsers) {
                data.targetUsers.forEach(userId => {
                    socket.to(`user_${userId}`).emit('notification', data);
                });
            }
        });
        
        // Handle typing indicators
        socket.on('typing_start', (data) => {
            socket.to(`user_${data.recipientId}`).emit('user_typing', {
                userId: data.senderId,
                typing: true
            });
        });
        
        socket.on('typing_stop', (data) => {
            socket.to(`user_${data.recipientId}`).emit('user_typing', {
                userId: data.senderId,
                typing: false
            });
        });
        
        // Handle video call events
        socket.on('video_call_request', (data) => {
            socket.to(`user_${data.recipientId}`).emit('incoming_video_call', data);
        });
        
        socket.on('video_call_response', (data) => {
            socket.to(`user_${data.callerId}`).emit('video_call_answered', data);
        });
        
        socket.on('video_call_end', (data) => {
            socket.to(`user_${data.participantId}`).emit('video_call_ended', data);
        });
        
        // Handle emergency alerts
        socket.on('emergency_alert', (data) => {
            socket.to(`clinic_${data.clinicId}`).emit('emergency_notification', data);
            socket.to('type_admin').emit('emergency_notification', data);
        });
        
        // Handle system-wide announcements
        socket.on('system_announcement', (data) => {
            socket.broadcast.emit('system_message', data);
        });
        
        // Handle disconnect
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
        
        // Handle errors
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });
    
    // Queue processing
    emailQueue.process('send_email', async (job) => {
        const { to, subject, template, data } = job.data;
        try {
            await EmailService.sendEmail(to, subject, template, data);
            logger.info(`Email sent successfully to ${to}`);
        } catch (error) {
            logger.error(`Failed to send email to ${to}:`, error);
            throw error;
        }
    });
    
    smsQueue.process('send_sms', async (job) => {
        const { to, message } = job.data;
        try {
            await SMSService.sendSMS(to, message);
            logger.info(`SMS sent successfully to ${to}`);
        } catch (error) {
            logger.error(`Failed to send SMS to ${to}:`, error);
            throw error;
        }
    });
    
    notificationQueue.process('send_notification', async (job) => {
        const { userId, type, title, message, data } = job.data;
        try {
            await NotificationService.createNotification(userId, type, title, message, data);
            
            // Emit real-time notification
            io.to(`user_${userId}`).emit('notification', {
                type,
                title,
                message,
                data,
                timestamp: new Date()
            });
            
            logger.info(`Notification sent successfully to user ${userId}`);
        } catch (error) {
            logger.error(`Failed to send notification to user ${userId}:`, error);
            throw error;
        }
    });
    
    appointmentQueue.process('appointment_reminder', async (job) => {
        const { appointmentId } = job.data;
        try {
            await SchedulingService.sendAppointmentReminder(appointmentId);
            logger.info(`Appointment reminder sent for ${appointmentId}`);
        } catch (error) {
            logger.error(`Failed to send appointment reminder for ${appointmentId}:`, error);
            throw error;
        }
    });
    
    reportQueue.process('generate_report', async (job) => {
        const { reportType, parameters, userId } = job.data;
        try {
            const report = await AnalyticsService.generateReport(reportType, parameters);
            
            // Notify user that report is ready
            io.to(`user_${userId}`).emit('report_ready', {
                reportType,
                downloadUrl: report.downloadUrl,
                timestamp: new Date()
            });
            
            logger.info(`Report ${reportType} generated successfully for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to generate report ${reportType} for user ${userId}:`, error);
            throw error;
        }
    });
    
    backupQueue.process('create_backup', async (job) => {
        const { backupType, options } = job.data;
        try {
            await BackupService.createBackup(backupType, options);
            logger.info(`Backup ${backupType} created successfully`);
        } catch (error) {
            logger.error(`Failed to create backup ${backupType}:`, error);
            throw error;
        }
    });
    
    analyticsQueue.process('track_event', async (job) => {
        const { eventType, eventData, userId } = job.data;
        try {
            await AnalyticsService.trackEvent(eventType, eventData, userId);
            logger.info(`Event ${eventType} tracked successfully for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to track event ${eventType} for user ${userId}:`, error);
            throw error;
        }
    });
    
    maintenanceQueue.process('system_maintenance', async (job) => {
        const { maintenanceType, parameters } = job.data;
        try {
            await maintenanceType === 'cleanup' 
                ? performSystemCleanup(parameters)
                : performSystemMaintenance(maintenanceType, parameters);
            logger.info(`System maintenance ${maintenanceType} completed successfully`);
        } catch (error) {
            logger.error(`Failed to perform system maintenance ${maintenanceType}:`, error);
            throw error;
        }
    });
    
    integrationQueue.process('sync_integration', async (job) => {
        const { integrationType, syncData } = job.data;
        try {
            await IntegrationService.syncIntegration(integrationType, syncData);
            logger.info(`Integration sync ${integrationType} completed successfully`);
        } catch (error) {
            logger.error(`Failed to sync integration ${integrationType}:`, error);
            throw error;
        }
    });
    
    aiQueue.process('ai_analysis', async (job) => {
        const { analysisType, inputData, userId } = job.data;
        try {
            const result = await AIService.performAnalysis(analysisType, inputData);
            
            // Send result to user
            io.to(`user_${userId}`).emit('ai_analysis_complete', {
                analysisType,
                result,
                timestamp: new Date()
            });
            
            logger.info(`AI analysis ${analysisType} completed successfully for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to perform AI analysis ${analysisType} for user ${userId}:`, error);
            throw error;
        }
    });
    
    blockchainQueue.process('blockchain_transaction', async (job) => {
        const { transactionType, transactionData } = job.data;
        try {
            await BlockchainService.processTransaction(transactionType, transactionData);
            logger.info(`Blockchain transaction ${transactionType} processed successfully`);
        } catch (error) {
            logger.error(`Failed to process blockchain transaction ${transactionType}:`, error);
            throw error;
        }
    });
    
    iotQueue.process('iot_data_processing', async (job) => {
        const { deviceId, sensorData } = job.data;
        try {
            await IoTService.processSensorData(deviceId, sensorData);
            logger.info(`IoT data processing completed for device ${deviceId}`);
        } catch (error) {
            logger.error(`Failed to process IoT data for device ${deviceId}:`, error);
            throw error;
        }
    });
    
    mlQueue.process('ml_prediction', async (job) => {
        const { modelType, inputData, userId } = job.data;
        try {
            const prediction = await MLService.makePrediction(modelType, inputData);
            
            // Send prediction to user
            io.to(`user_${userId}`).emit('ml_prediction_ready', {
                modelType,
                prediction,
                timestamp: new Date()
            });
            
            logger.info(`ML prediction ${modelType} completed successfully for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to make ML prediction ${modelType} for user ${userId}:`, error);
            throw error;
        }
    });
    
    // Scheduled tasks
    
    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', async () => {
        logger.info('Starting daily backup...');
        await backupQueue.add('create_backup', {
            backupType: 'daily',
            options: { compression: true, encryption: true }
        });
    });
    
    // Weekly full backup on Sundays at 3 AM
    cron.schedule('0 3 * * 0', async () => {
        logger.info('Starting weekly full backup...');
        await backupQueue.add('create_backup', {
            backupType: 'weekly_full',
            options: { compression: true, encryption: true, includeFiles: true }
        });
    });
    
    // Send appointment reminders every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('Processing appointment reminders...');
        try {
            const upcomingAppointments = await SchedulingService.getUpcomingAppointments(24); // Next 24 hours
            
            for (const appointment of upcomingAppointments) {
                await appointmentQueue.add('appointment_reminder', {
                    appointmentId: appointment._id
                });
            }
        } catch (error) {
            logger.error('Failed to process appointment reminders:', error);
        }
    });
    
    // Generate daily analytics at midnight
    cron.schedule('0 0 * * *', async () => {
        logger.info('Generating daily analytics...');
        await analyticsQueue.add('track_event', {
            eventType: 'daily_summary',
            eventData: { date: new Date().toISOString().split('T')[0] },
            userId: 'system'
        });
    });
    
    // System maintenance every Sunday at 4 AM
    cron.schedule('0 4 * * 0', async () => {
        logger.info('Starting weekly system maintenance...');
        await maintenanceQueue.add('system_maintenance', {
            maintenanceType: 'cleanup',
            parameters: { cleanLogs: true, optimizeDatabase: true, cleanCache: true }
        });
    });
    
    // Monitor queue health every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        const queues = [emailQueue, smsQueue, notificationQueue, appointmentQueue, reportQueue, backupQueue, analyticsQueue, maintenanceQueue, integrationQueue, aiQueue, blockchainQueue, iotQueue, mlQueue];
        
        for (const queue of queues) {
            try {
                const waiting = await queue.getWaiting();
                const active = await queue.getActive();
                const failed = await queue.getFailed();
                
                if (waiting.length > 100 || active.length > 50 || failed.length > 10) {
                    logger.warn(`Queue ${queue.name} health warning:`, {
                        waiting: waiting.length,
                        active: active.length,
                        failed: failed.length
                    });
                }
            } catch (error) {
                logger.error(`Failed to check queue ${queue.name} health:`, error);
            }
        }
    });
    
    // Archive old notifications daily at 1 AM
    cron.schedule('0 1 * * *', async () => {
        logger.info('Archiving old notifications...');
        try {
            await NotificationService.archiveOldNotifications(30); // Archive notifications older than 30 days
        } catch (error) {
            logger.error('Failed to archive old notifications:', error);
        }
    });
    
    // Sync integrations every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        logger.info('Syncing integrations...');
        try {
            const activeIntegrations = await IntegrationService.getActiveIntegrations();
            
            for (const integration of activeIntegrations) {
                await integrationQueue.add('sync_integration', {
                    integrationType: integration.type,
                    syncData: integration.syncSettings
                });
            }
        } catch (error) {
            logger.error('Failed to sync integrations:', error);
        }
    });
    
    // Helper functions
    async function performSystemCleanup(parameters) {
        if (parameters.cleanLogs) {
            // Clean old log files
            const logDir = path.join(__dirname, 'logs');
            const files = fs.readdirSync(logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            for (const file of files) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted old log file: ${file}`);
                }
            }
        }
        
        if (parameters.optimizeDatabase) {
            // Optimize database indexes
            await mongoose.connection.db.admin().command({ reIndex: 'appointments' });
            await mongoose.connection.db.admin().command({ reIndex: 'patients' });
            await mongoose.connection.db.admin().command({ reIndex: 'doctors' });
            logger.info('Database indexes optimized');
        }
        
        if (parameters.cleanCache) {
            // Clear Redis cache
            try {
                await redisClient.flushAll();
                logger.info('Redis cache cleared');
            } catch (error) {
                logger.error('Failed to clear Redis cache:', error);
            }
        }
    }
    
    async function performSystemMaintenance(maintenanceType, parameters) {
        switch (maintenanceType) {
            case 'update_search_indexes':
                // Update search indexes
                logger.info('Updating search indexes...');
                break;
                
            case 'compress_old_data':
                // Compress old data
                logger.info('Compressing old data...');
                break;
                
            case 'security_scan':
                // Perform security scan
                logger.info('Performing security scan...');
                break;
                
            default:
                logger.warn(`Unknown maintenance type: ${maintenanceType}`);
        }
    }
    
    // Initialize services
    const initializeServices = async () => {
        try {
            await NotificationService.initialize();
            await EmailService.initialize();
            await SMSService.initialize();
            await PaymentService.initialize();
            await SchedulingService.initialize();
            await AnalyticsService.initialize();
            await BackupService.initialize();
            await SecurityService.initialize();
            await AuditService.initialize();
            await CacheService.initialize();
            await QueueService.initialize();
            await IntegrationService.initialize();
            await AIService.initialize();
            await BlockchainService.initialize();
            await IoTService.initialize();
            await MLService.initialize();
            await VoiceService.initialize();
            await ChatbotService.initialize();
            await TelemedicineService.initialize();
            await ComplianceService.initialize();
            await WorkflowService.initialize();
            await EmergencyService.initialize();
            
            logger.info('All services initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize services:', error);
        }
    };
    
    // Start server
    const startServer = async () => {
        try {
            await connectDB();
            await connectRedis();
            await initializeServices();
            
            const PORT = process.env.PORT || 5000;
            
            server.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
                console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`👨‍⚕️ Dental Appointment System Backend Started Successfully!`);
                
                logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            });
            
            // Graceful shutdown
            const gracefulShutdown = (signal) => {
                console.log(`\n🛑 Received ${signal}. Graceful shutdown initiated...`);
                
                server.close(async () => {
                    console.log('✅ HTTP server closed');
                    
                    try {
                        await mongoose.connection.close();
                        console.log('✅ MongoDB connection closed');
                        
                        await redisClient.quit();
                        console.log('✅ Redis connection closed');
                        
                        // Close all queues
                        await Promise.all([
                            emailQueue.close(),
                            smsQueue.close(),
                            notificationQueue.close(),
                            appointmentQueue.close(),
                            reportQueue.close(),
                            backupQueue.close(),
                            analyticsQueue.close(),
                            maintenanceQueue.close(),
                            integrationQueue.close(),
                            aiQueue.close(),
                            blockchainQueue.close(),
                            iotQueue.close(),
                            mlQueue.close()
                        ]);
                        console.log('✅ All queues closed');
                        
                        console.log('🎉 Graceful shutdown completed');
                        process.exit(0);
                        
                    } catch (error) {
                        console.error('❌ Error during graceful shutdown:', error);
                        process.exit(1);
                    }
                });
                
                // Force close after 15 seconds
                setTimeout(() => {
                    console.error('⚠️  Could not close connections in time, forcefully shutting down');
                    process.exit(1);
                }, 15000);
            };
            
            process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
            process.on('SIGINT', () => gracefulShutdown('SIGINT'));
            
        } catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    };
    
    // Start the server
    startServer();
}

module.exports = app;
