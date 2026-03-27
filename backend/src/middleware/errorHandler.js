/**
 * Error Handler - Centralized error handling middleware
 */

const logger = require('./logger');
const config = require('../config');

// ============================================================================
// ERROR CLASSES
// ============================================================================

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  
  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error', {
      error: message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn('Client Error', {
      error: message,
      code,
      url: req.originalUrl,
      method: req.method,
    });
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_INPUT';
    message = 'Invalid input data';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
    message = `File too large. Maximum size is ${config.maxFileSize}MB`;
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    code = 'TOO_MANY_FILES';
    message = `Too many files. Maximum is ${config.maxBatchFiles} files`;
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    code = 'UNEXPECTED_FILE';
    message = 'Unexpected file field';
  }
  
  // Construct error response
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };
  
  // Include stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  // Send response
  res.status(statusCode).json(errorResponse);
};

// ============================================================================
// 404 HANDLER
// ============================================================================

const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// ============================================================================
// ASYNC ERROR WRAPPER
// ============================================================================

/**
 * Wrapper for async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.ConflictError = ConflictError;
module.exports.TooManyRequestsError = TooManyRequestsError;
module.exports.notFoundHandler = notFoundHandler;
module.exports.asyncHandler = asyncHandler;
