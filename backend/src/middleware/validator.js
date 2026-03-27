/**
 * Validator Middleware - Input validation
 */

const path = require('path');
const { ValidationError } = require('./errorHandler');
const config = require('../config');

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Validate file metadata
 */
const validateFile = (file) => {
  if (!file) {
    throw new ValidationError('File is required');
  }
  
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.allowedExtensions.includes(ext)) {
    throw new ValidationError(`File type ${ext} is not supported`);
  }
  
  // Check size
  if (file.size > config.maxFileSize * 1024 * 1024) {
    throw new ValidationError(
      `File too large. Maximum size is ${config.maxFileSize}MB`
    );
  }
  
  return true;
};

/**
 * Validate multiple files
 */
const validateFiles = (files) => {
  if (!files || files.length === 0) {
    throw new ValidationError('At least one file is required');
  }
  
  if (files.length > config.maxBatchFiles) {
    throw new ValidationError(
      `Too many files. Maximum is ${config.maxBatchFiles} files`
    );
  }
  
  // Validate each file
  files.forEach((file, index) => {
    try {
      validateFile(file);
    } catch (error) {
      throw new ValidationError(`File ${index + 1}: ${error.message}`);
    }
  });
  
  return true;
};

/**
 * Validate removal options
 */
const validateRemovalOptions = (options) => {
  const { fileId, fields, categories, preset, removeAll } = options;
  
  // fileId is required
  if (!fileId || typeof fileId !== 'string') {
    throw new ValidationError('fileId is required and must be a string');
  }
  
  // At least one removal option must be specified
  const hasFields = fields && Array.isArray(fields) && fields.length > 0;
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0;
  const hasPreset = preset && typeof preset === 'string';
  const hasRemoveAll = removeAll === true;
  
  if (!hasFields && !hasCategories && !hasPreset && !hasRemoveAll) {
    throw new ValidationError(
      'At least one removal option must be specified: fields, categories, preset, or removeAll'
    );
  }
  
  // Validate fields array
  if (fields && !Array.isArray(fields)) {
    throw new ValidationError('fields must be an array');
  }
  
  // Validate categories array
  if (categories && !Array.isArray(categories)) {
    throw new ValidationError('categories must be an array');
  }
  
  // Validate preset
  if (preset && typeof preset !== 'string') {
    throw new ValidationError('preset must be a string');
  }
  
  return true;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Validate single file upload
 */
const validateSingleFile = (req, res, next) => {
  try {
    validateFile(req.file);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate multiple files upload
 */
const validateMultipleFiles = (req, res, next) => {
  try {
    validateFiles(req.files);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate removal request body
 */
const validateRemovalRequest = (req, res, next) => {
  try {
    validateRemovalOptions(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
};

/**
 * Sanitize field name
 */
const sanitizeFieldName = (fieldName) => {
  return fieldName
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  // Validation functions
  validateFile,
  validateFiles,
  validateRemovalOptions,
  
  // Middleware
  validateSingleFile,
  validateMultipleFiles,
  validateRemovalRequest,
  
  // Sanitization
  sanitizeFilename,
  sanitizeFieldName,
};
