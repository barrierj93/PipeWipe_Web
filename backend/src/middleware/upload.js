/**
 * Upload Middleware - Multer configuration for IN-MEMORY uploads
 * ZERO DISK STORAGE - All files processed in RAM
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { ValidationError } = require('./errorHandler');

// ============================================================================
// STORAGE CONFIGURATION - MEMORY (NO DISK)
// ============================================================================

/**
 * Use memory storage - files stored as buffers in RAM
 * NO files written to disk
 */
const storage = multer.memoryStorage();

// ============================================================================
// FILE FILTER
// ============================================================================

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (config.allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        `File type ${ext} is not supported. Allowed types: ${config.allowedExtensions.join(', ')}`
      ),
      false
    );
  }
};

// ============================================================================
// MULTER INSTANCES
// ============================================================================

/**
 * Single file upload
 * File will be available as req.file.buffer (Buffer in RAM)
 */
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize * 1024 * 1024, // Convert MB to bytes
  },
}).single('file');

/**
 * Multiple files upload (batch)
 * Files will be available as req.files[].buffer (Buffers in RAM)
 */
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize * 1024 * 1024, // Convert MB to bytes
    files: config.maxBatchFiles,
  },
}).array('files', config.maxBatchFiles);

// ============================================================================
// WRAPPER MIDDLEWARE WITH ERROR HANDLING
// ============================================================================

/**
 * Wrapper for single file upload with error handling
 */
const uploadSingleMiddleware = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ValidationError(
            `File too large. Maximum size is ${config.maxFileSize}MB`
          )
        );
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ValidationError('Unexpected field name. Use "file" field'));
      }
      return next(new ValidationError(err.message));
    } else if (err) {
      // Other errors
      return next(err);
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return next(new ValidationError('No file uploaded. Use "file" field'));
    }
    
    // Add unique ID to file object for tracking
    req.file.fileId = `${Date.now()}_${uuidv4()}`;
    
    next();
  });
};

/**
 * Wrapper for multiple files upload with error handling
 */
const uploadMultipleMiddleware = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ValidationError(
            `One or more files too large. Maximum size is ${config.maxFileSize}MB per file`
          )
        );
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return next(
          new ValidationError(
            `Too many files. Maximum is ${config.maxBatchFiles} files`
          )
        );
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ValidationError('Unexpected field name. Use "files" field'));
      }
      return next(new ValidationError(err.message));
    } else if (err) {
      // Other errors
      return next(err);
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return next(new ValidationError('No files uploaded. Use "files" field'));
    }
    
    // Add unique IDs to each file
    req.files.forEach(file => {
      file.fileId = `${Date.now()}_${uuidv4()}`;
    });
    
    next();
  });
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  uploadSingle: uploadSingleMiddleware,
  uploadMultiple: uploadMultipleMiddleware,
};