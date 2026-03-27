/**
 * Rate Limiting Middleware - Protect against abuse
 */

const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const config = require('../config');

// ============================================================================
// GENERAL API RATE LIMITER
// ============================================================================

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000, // Convert minutes to ms
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: `Too many requests. Please try again in ${config.rateLimitWindow} minutes.`,
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests from this IP. Please try again in ${config.rateLimitWindow} minutes.`,
      },
    });
  },
  skip: (req) => {
    // Skip rate limiting in development if needed
    return config.nodeEnv === 'development' && !config.enableRateLimit;
  },
});

// ============================================================================
// STRICT RATE LIMITER FOR RESOURCE-INTENSIVE OPERATIONS
// ============================================================================

/**
 * Strict rate limiter for file uploads and processing
 * More restrictive than general API limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 uploads per 15 minutes
  message: {
    success: false,
    error: {
      code: 'UPLOAD_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_LIMIT_EXCEEDED',
        message: 'Too many file uploads from this IP. Please try again in 15 minutes.',
      },
    });
  },
  skip: (req) => {
    return config.nodeEnv === 'development' && !config.enableRateLimit;
  },
});

// ============================================================================
// BATCH OPERATIONS RATE LIMITER
// ============================================================================

/**
 * Very strict rate limiter for batch operations
 * Batch operations are resource-intensive
 */
const batchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 batch operations per hour
  message: {
    success: false,
    error: {
      code: 'BATCH_LIMIT_EXCEEDED',
      message: 'Too many batch operations. Please try again in 1 hour.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Batch rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'BATCH_LIMIT_EXCEEDED',
        message: 'Too many batch operations from this IP. Please try again in 1 hour.',
      },
    });
  },
  skip: (req) => {
    return config.nodeEnv === 'development' && !config.enableRateLimit;
  },
});

// ============================================================================
// CUSTOM RATE LIMITER FACTORY
// ============================================================================

/**
 * Create a custom rate limiter
 */
function createRateLimiter(options) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    code = 'TOO_MANY_REQUESTS',
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code,
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Custom rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        limit: max,
      });
      
      res.status(429).json({
        success: false,
        error: {
          code,
          message,
        },
      });
    },
    skip: (req) => {
      return config.nodeEnv === 'development' && !config.enableRateLimit;
    },
  });
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  apiLimiter,
  uploadLimiter,
  batchLimiter,
  createRateLimiter,
};
