/**
 * Comprehensive Logging Configuration for Dental Appointment System
 * Advanced Winston-based logging with multiple transports and formatters
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

// Define log colors
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'grey',
    debug: 'blue',
    silly: 'rainbow'
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (stack) {
            log += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.metadata(),
    winston.format.printf(({ timestamp, level, message, stack, metadata, ...meta }) => {
        const logEntry = {
            timestamp,
            level,
            message,
            pid: process.pid,
            hostname: os.hostname(),
            environment: process.env.NODE_ENV || 'development',
            service: 'dental-appointment-system',
            version: process.env.npm_package_version || '1.0.0',
            ...meta
        };
        
        if (stack) {
            logEntry.stack = stack;
        }
        
        if (metadata && Object.keys(metadata).length > 0) {
            logEntry.metadata = metadata;
        }
        
        return JSON.stringify(logEntry);
    })
);

// Custom format for audit logs
const auditFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const auditEntry = {
            timestamp,
            level,
            message,
            userId: meta.userId || 'system',
            action: meta.action,
            resource: meta.resource,
            resourceId: meta.resourceId,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            sessionId: meta.sessionId,
            requestId: meta.requestId,
            changes: meta.changes,
            result: meta.result,
            duration: meta.duration,
            ...meta
        };
        
        return JSON.stringify(auditEntry);
    })
);

// Custom format for performance logs
const performanceFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const perfEntry = {
            timestamp,
            level,
            message,
            requestId: meta.requestId,
            method: meta.method,
            url: meta.url,
            statusCode: meta.statusCode,
            responseTime: meta.responseTime,
            userAgent: meta.userAgent,
            ipAddress: meta.ipAddress,
            userId: meta.userId,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            ...meta
        };
        
        return JSON.stringify(perfEntry);
    })
);

// Custom format for security logs
const securityFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const securityEntry = {
            timestamp,
            level,
            message,
            severity: meta.severity || 'medium',
            category: meta.category,
            userId: meta.userId,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            sessionId: meta.sessionId,
            requestId: meta.requestId,
            endpoint: meta.endpoint,
            method: meta.method,
            payload: meta.payload,
            result: meta.result,
            riskScore: meta.riskScore,
            ...meta
        };
        
        return JSON.stringify(securityEntry);
    })
);

// Create daily rotate file transport for application logs
const applicationLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
    level: process.env.LOG_LEVEL || 'info'
});

// Create daily rotate file transport for error logs
const errorLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '60d',
    format: fileFormat,
    level: 'error'
});

// Create daily rotate file transport for audit logs
const auditLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m',
    maxFiles: '365d',
    format: auditFormat
});

// Create daily rotate file transport for performance logs
const performanceLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'performance-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '30m',
    maxFiles: '30d',
    format: performanceFormat
});

// Create daily rotate file transport for security logs
const securityLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m',
    maxFiles: '365d',
    format: securityFormat
});

// Create daily rotate file transport for access logs
const accessLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '90d',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    )
});

// Create daily rotate file transport for database logs
const databaseLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'database-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '30m',
    maxFiles: '30d',
    format: fileFormat
});

// Create daily rotate file transport for API logs
const apiLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'api-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '50m',
    maxFiles: '30d',
    format: fileFormat
});

// Create daily rotate file transport for queue logs
const queueLogTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'queue-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '30m',
    maxFiles: '30d',
    format: fileFormat
});

// Create console transport
const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Main application logger
const logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,
    defaultMeta: {
        service: 'dental-appointment-system',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        hostname: os.hostname()
    },
    transports: [
        applicationLogTransport,
        errorLogTransport
    ],
    exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(consoleTransport);
}

// Audit logger
const auditLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: auditFormat,
    transports: [
        auditLogTransport
    ],
    exitOnError: false
});

// Performance logger
const performanceLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: performanceFormat,
    transports: [
        performanceLogTransport
    ],
    exitOnError: false
});

// Security logger
const securityLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: securityFormat,
    transports: [
        securityLogTransport
    ],
    exitOnError: false
});

// Access logger
const accessLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        accessLogTransport
    ],
    exitOnError: false
});

// Database logger
const databaseLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: fileFormat,
    transports: [
        databaseLogTransport
    ],
    exitOnError: false
});

// API logger
const apiLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: fileFormat,
    transports: [
        apiLogTransport
    ],
    exitOnError: false
});

// Queue logger
const queueLogger = winston.createLogger({
    levels: logLevels,
    level: 'info',
    format: fileFormat,
    transports: [
        queueLogTransport
    ],
    exitOnError: false
});

// Error handling for log transports
const logTransports = [
    applicationLogTransport,
    errorLogTransport,
    auditLogTransport,
    performanceLogTransport,
    securityLogTransport,
    accessLogTransport,
    databaseLogTransport,
    apiLogTransport,
    queueLogTransport
];

logTransports.forEach(transport => {
    transport.on('error', (err) => {
        console.error('Log transport error:', err);
    });
    
    transport.on('rotate', (oldFilename, newFilename) => {
        console.log(`Log file rotated: ${oldFilename} -> ${newFilename}`);
    });
});

// Log system information on startup
logger.info('Logging system initialized', {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    cwd: process.cwd(),
    execPath: process.execPath
});

// Helper functions for structured logging
const logHelpers = {
    // Log API request
    logRequest: (req, res, responseTime) => {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            userId: req.user ? req.user.id : null,
            requestId: req.id,
            contentLength: res.get('Content-Length') || 0,
            referer: req.get('Referer'),
            query: req.query,
            params: req.params,
            body: req.body && Object.keys(req.body).length > 0 ? 
                  (req.body.password ? { ...req.body, password: '[REDACTED]' } : req.body) : 
                  undefined
        };
        
        if (res.statusCode >= 400) {
            apiLogger.error('API request failed', logData);
        } else if (responseTime > 1000) {
            apiLogger.warn('Slow API request', logData);
        } else {
            apiLogger.info('API request', logData);
        }
    },

    // Log authentication events
    logAuth: (action, userId, ipAddress, userAgent, success, details = {}) => {
        const logData = {
            action,
            userId,
            ipAddress,
            userAgent,
            success,
            timestamp: new Date().toISOString(),
            ...details
        };
        
        if (success) {
            auditLogger.info(`Authentication ${action} successful`, logData);
        } else {
            securityLogger.warn(`Authentication ${action} failed`, {
                ...logData,
                severity: 'high',
                category: 'authentication'
            });
        }
    },

    // Log authorization events
    logAuthorization: (userId, action, resource, allowed, ipAddress, details = {}) => {
        const logData = {
            userId,
            action,
            resource,
            allowed,
            ipAddress,
            timestamp: new Date().toISOString(),
            ...details
        };
        
        if (allowed) {
            auditLogger.info('Authorization granted', logData);
        } else {
            securityLogger.warn('Authorization denied', {
                ...logData,
                severity: 'medium',
                category: 'authorization'
            });
        }
    },

    // Log data access
    logDataAccess: (userId, action, resource, resourceId, ipAddress, details = {}) => {
        auditLogger.info('Data access', {
            userId,
            action,
            resource,
            resourceId,
            ipAddress,
            timestamp: new Date().toISOString(),
            ...details
        });
    },

    // Log security events
    logSecurity: (event, severity, userId, ipAddress, details = {}) => {
        securityLogger.warn('Security event', {
            event,
            severity,
            userId,
            ipAddress,
            timestamp: new Date().toISOString(),
            category: 'security',
            ...details
        });
    },

    // Log performance metrics
    logPerformance: (operation, duration, details = {}) => {
        const logData = {
            operation,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            ...details
        };
        
        if (duration > 5000) {
            performanceLogger.warn('Slow operation detected', logData);
        } else if (duration > 1000) {
            performanceLogger.info('Operation performance', logData);
        } else {
            performanceLogger.debug('Operation performance', logData);
        }
    },

    // Log database operations
    logDatabase: (operation, collection, duration, details = {}) => {
        databaseLogger.info('Database operation', {
            operation,
            collection,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...details
        });
    },

    // Log queue operations
    logQueue: (queueName, operation, jobId, duration, details = {}) => {
        queueLogger.info('Queue operation', {
            queueName,
            operation,
            jobId,
            duration: duration ? `${duration}ms` : undefined,
            timestamp: new Date().toISOString(),
            ...details
        });
    },

    // Log business events
    logBusiness: (event, userId, details = {}) => {
        logger.info('Business event', {
            event,
            userId,
            timestamp: new Date().toISOString(),
            ...details
        });
    },

    // Log errors with context
    logError: (error, context = {}) => {
        logger.error('Application error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            timestamp: new Date().toISOString(),
            ...context
        });
    },

    // Log system health
    logHealth: (component, status, metrics = {}) => {
        const level = status === 'healthy' ? 'info' : 'warn';
        logger[level]('System health check', {
            component,
            status,
            timestamp: new Date().toISOString(),
            ...metrics
        });
    }
};

// Create stream for Morgan HTTP logger
const httpLogStream = {
    write: (message) => {
        accessLogger.info(message.trim());
    }
};

// Export loggers and helpers
module.exports = {
    logger,
    auditLogger,
    performanceLogger,
    securityLogger,
    accessLogger,
    databaseLogger,
    apiLogger,
    queueLogger,
    httpLogStream,
    logHelpers,
    
    // Additional utility functions
    createChildLogger: (service, metadata = {}) => {
        return logger.child({
            service,
            ...metadata
        });
    },
    
    // Set log level dynamically
    setLogLevel: (level) => {
        logger.level = level;
        logger.info(`Log level changed to: ${level}`);
    },
    
    // Get current log level
    getLogLevel: () => {
        return logger.level;
    },
    
    // Add custom transport
    addTransport: (transport) => {
        logger.add(transport);
    },
    
    // Remove transport
    removeTransport: (transport) => {
        logger.remove(transport);
    },
    
    // Flush all logs
    flush: () => {
        return new Promise((resolve) => {
            logger.on('finish', resolve);
            logger.end();
        });
    },
    
    // Log levels for external use
    levels: logLevels
};
