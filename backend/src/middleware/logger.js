/**
 * Logger - Winston-based logging
 */

const winston = require('winston');
const path = require('path');
const config = require('../config');

// ============================================================================
// WINSTON CONFIGURATION
// ============================================================================

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// ============================================================================
// CREATE LOGGER
// ============================================================================

const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'pipewipe-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    
    // File transport - all logs
    new winston.transports.File({
      filename: path.join(config.logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: config.logRotationDays,
    }),
    
    // File transport - error logs only
    new winston.transports.File({
      filename: path.join(config.logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: config.logRotationDays,
    }),
  ],
});

// ============================================================================
// DEVELOPMENT LOGGING
// ============================================================================

if (config.nodeEnv === 'development') {
  logger.debug('Logger initialized in development mode');
}

// ============================================================================
// EXPRESS MIDDLEWARE
// ============================================================================

/**
 * HTTP request logger middleware
 */
logger.requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = logger;
