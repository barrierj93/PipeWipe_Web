/**
 * ExifTool Wrapper - Metadata extraction using ExifTool
 * EXTENDED WITH IN-MEMORY PROCESSING (Buffer support)
 * 
 * Replace: backend/src/native/ExifToolWrapper.js
 */

const { exiftool, Tags } = require('exiftool-vendored');
const logger = require('../middleware/logger');
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// ============================================================================
// EXIFTOOL CONFIGURATION
// ============================================================================

// Configure ExifTool with custom settings
exiftool.maxProcs = config.exifToolMaxProc;
exiftool.taskTimeoutMillis = config.exifToolTimeout;

// ============================================================================
// METADATA EXTRACTION - BUFFER SUPPORT (NEW)
// ============================================================================

/**
 * Extract metadata from a buffer (in-memory file)
 * @param {Buffer} buffer - File buffer
 * @param {Object} fileInfo - { originalname, mimetype, size }
 * @returns {Promise<Object>} - Extracted metadata
 */
async function extractMetadataFromBuffer(buffer, fileInfo = {}) {
  let tempPath = null;
  
  try {
    logger.debug(`Extracting metadata from buffer (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    const startTime = Date.now();
    
    // Create temporary file in /tmp (tmpfs = memory on most systems)
    const ext = path.extname(fileInfo.originalname || '.tmp');
    tempPath = path.join(os.tmpdir(), `pipewipe_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
    
    // Write buffer to temp location
    await fs.writeFile(tempPath, buffer);
    
    // Extract metadata using ExifTool
    const tags = await exiftool.read(tempPath);
    
    // Delete temp file immediately
    await fs.unlink(tempPath);
    tempPath = null;
    
    const duration = Date.now() - startTime;
    logger.debug(`Metadata extraction from buffer completed in ${duration}ms`);
    
    // Convert Tags object to plain object
    const metadata = {};
    for (const [key, value] of Object.entries(tags)) {
      if (value !== undefined && value !== null) {
        metadata[key] = value;
      }
    }
    
    return {
      raw: metadata,
      extractionTime: duration,
    };
  } catch (error) {
    // Cleanup on error
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        logger.error(`Failed to cleanup temp file: ${cleanupError.message}`);
      }
    }
    
    logger.error(`ExifTool buffer extraction failed: ${error.message}`);
    throw new Error(`Failed to extract metadata from buffer: ${error.message}`);
  }
}

/**
 * Remove metadata from buffer and return cleaned buffer
 * @param {Buffer} inputBuffer - Original file buffer
 * @param {Object} options - Removal options { removeAll, fields, categories }
 * @returns {Promise<Buffer>} - Cleaned file buffer
 */
async function removeMetadataFromBuffer(inputBuffer, options = {}) {
  let tempInputPath = null;
  let tempOutputPath = null;
  
  try {
    logger.debug('Removing metadata from buffer');
    
    // Create temp files
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    tempInputPath = path.join(os.tmpdir(), `pipewipe_input_${timestamp}_${random}`);
    tempOutputPath = path.join(os.tmpdir(), `pipewipe_output_${timestamp}_${random}`);
    
    // Write input buffer to temp file
    await fs.writeFile(tempInputPath, inputBuffer);
    
    // Copy to output (ExifTool will modify it)
    await fs.copyFile(tempInputPath, tempOutputPath);
    
    // Remove metadata based on options
    if (options.removeAll) {
      await exiftool.write(tempOutputPath, { all: '' }, ['-overwrite_original']);
    } else if (options.fields && options.fields.length > 0) {
      const tags = {};
      options.fields.forEach(field => {
        // Skip filesystem fields
        if (!isReadOnlyField(field)) {
          tags[field] = '';
        }
      });
      
      if (Object.keys(tags).length > 0) {
        await exiftool.write(tempOutputPath, tags, ['-overwrite_original']);
      }
    }
    
    // Read cleaned file into buffer
    const cleanedBuffer = await fs.readFile(tempOutputPath);
    
    // Delete temp files
    await fs.unlink(tempInputPath);
    await fs.unlink(tempOutputPath);
    
    logger.debug('Metadata removed successfully from buffer');
    
    return cleanedBuffer;
    
  } catch (error) {
    // Cleanup on error
    if (tempInputPath) {
      try { await fs.unlink(tempInputPath); } catch (e) {}
    }
    if (tempOutputPath) {
      try { await fs.unlink(tempOutputPath); } catch (e) {}
    }
    
    logger.error(`Failed to remove metadata from buffer: ${error.message}`);
    throw error;
  }
}

/**
 * Check if field is read-only (filesystem field)
 */
function isReadOnlyField(field) {
  const readOnlyFields = [
    'SourceFile',
    'FileSize',
    'FileModifyDate',
    'FileAccessDate',
    'FileCreateDate',
    'FilePermissions',
    'FileType',
    'FileTypeExtension',
    'MIMEType',
  ];
  
  return readOnlyFields.includes(field);
}

// ============================================================================
// METADATA EXTRACTION - FILE PATH (ORIGINAL)
// ============================================================================

/**
 * Extract metadata from a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} - Extracted metadata
 */
async function extractMetadata(filePath) {
  try {
    logger.debug(`Extracting metadata from: ${filePath}`);
    
    const startTime = Date.now();
    const tags = await exiftool.read(filePath);
    const duration = Date.now() - startTime;
    
    logger.debug(`Metadata extraction completed in ${duration}ms`);
    
    // Convert Tags object to plain object
    const metadata = {};
    for (const [key, value] of Object.entries(tags)) {
      if (value !== undefined && value !== null) {
        metadata[key] = value;
      }
    }
    
    return {
      raw: metadata,
      extractionTime: duration,
    };
  } catch (error) {
    logger.error(`ExifTool extraction failed: ${error.message}`);
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
}

/**
 * Extract metadata from multiple files
 * @param {string[]} filePaths - Array of file paths
 * @returns {Promise<Object[]>} - Array of extracted metadata
 */
async function extractMetadataBatch(filePaths) {
  try {
    logger.debug(`Batch extracting metadata from ${filePaths.length} files`);
    
    const startTime = Date.now();
    const results = await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          return await extractMetadata(filePath);
        } catch (error) {
          logger.error(`Failed to extract metadata from ${filePath}: ${error.message}`);
          return {
            error: error.message,
            filePath,
          };
        }
      })
    );
    
    const duration = Date.now() - startTime;
    logger.debug(`Batch extraction completed in ${duration}ms`);
    
    return results;
  } catch (error) {
    logger.error(`Batch extraction failed: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// METADATA REMOVAL - FILE PATH (ORIGINAL)
// ============================================================================

/**
 * Remove all metadata from a file
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
async function removeAllMetadata(inputPath, outputPath) {
  try {
    logger.debug(`Removing all metadata from: ${inputPath}`);
    
    // First copy the file
    await fs.copyFile(inputPath, outputPath);
    
    // Then remove all metadata from the copy
    await exiftool.write(outputPath, { all: '' }, ['-overwrite_original']);
    
    logger.debug(`All metadata removed successfully`);
  } catch (error) {
    logger.error(`Failed to remove all metadata: ${error.message}`);
    throw new Error(`Failed to remove metadata: ${error.message}`);
  }
}

/**
 * Remove specific metadata fields
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {string[]} fields - Array of field names to remove
 * @returns {Promise<void>}
 */
async function removeMetadataFields(inputPath, outputPath, fields) {
  try {
    logger.debug(`Removing ${fields.length} metadata fields from: ${inputPath}`);
    
    // First copy the file
    await fs.copyFile(inputPath, outputPath);
    
    // Build tags object with empty values for fields to remove
    const tags = {};
    fields.forEach((field) => {
      if (!isReadOnlyField(field)) {
        tags[field] = '';
      }
    });
    
    if (Object.keys(tags).length > 0) {
      // Remove fields from the copy
      await exiftool.write(outputPath, tags, ['-overwrite_original']);
    }
    
    logger.debug(`Metadata fields removed successfully`);
  } catch (error) {
    logger.error(`Failed to remove metadata fields: ${error.message}`);
    throw new Error(`Failed to remove metadata fields: ${error.message}`);
  }
}

/**
 * Remove metadata by category
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {string[]} categories - Array of categories to remove (LOCATION, IDENTITY, DEVICE)
 * @returns {Promise<void>}
 */
async function removeMetadataByCategory(inputPath, outputPath, categories) {
  try {
    logger.debug(`Removing metadata categories from: ${inputPath}`);
    
    // Get all metadata first
    const { raw: metadata } = await extractMetadata(inputPath);
    
    // Categorize fields
    const categorizedFields = categorizeMetadata(metadata);
    
    // Collect fields to remove based on categories
    const fieldsToRemove = [];
    
    categories.forEach((category) => {
      const categoryUpper = category.toUpperCase();
      if (categorizedFields[categoryUpper]) {
        categorizedFields[categoryUpper].forEach((item) => {
          fieldsToRemove.push(item.field);
        });
      }
    });
    
    if (fieldsToRemove.length === 0) {
      logger.warn(`No fields found for categories: ${categories.join(', ')}`);
      // Still copy the file
      await fs.copyFile(inputPath, outputPath);
      return;
    }
    
    // Remove the fields
    await removeMetadataFields(inputPath, outputPath, fieldsToRemove);
    
    logger.debug(`Metadata categories removed successfully`);
  } catch (error) {
    logger.error(`Failed to remove metadata by category: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// METADATA CATEGORIZATION
// ============================================================================

/**
 * Categorize metadata fields by privacy concern
 */
function categorizeMetadata(metadata) {
  const categorized = {
    LOCATION: [],
    IDENTITY: [],
    DEVICE: [],
    TEMPORAL: [],
    TECHNICAL: [],
    OTHER: [],
  };
  
  // GPS and Location fields
  const locationFields = [
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSPosition',
    'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef',
    'GPSDateTime', 'GPSDateStamp', 'GPSTimeStamp',
    'LocationCreatedCity', 'LocationCreatedCountryName',
    'LocationCreatedProvinceState', 'LocationCreatedSublocation',
  ];
  
  // Identity fields
  const identityFields = [
    'Creator', 'Author', 'Artist', 'Copyright', 'OwnerName',
    'By-line', 'Credit', 'Source', 'CopyrightNotice',
    'PersonInImage', 'CatalogSets', 'Producer', 'Publisher',
    'ProfileCopyright', // ICC profile copyright
  ];
  
  // Device fields - ALL technical info
  const deviceFields = [
    'Make', 'Model', 'Software', 'LensModel', 'LensInfo',
    'SerialNumber', 'InternalSerialNumber', 'DeviceManufacturer',
    'DeviceModel', 'UniqueCameraModel', 'LensSerialNumber',
    'CreatorTool', 'ProfileCreator', // Software/Tools used
  ];
  
  // Temporal fields
  const temporalFields = [
    'CreateDate', 'DateTimeOriginal', 'ModifyDate',
    'DateCreated', 'TimeCreated', 'DateTimeCreated',
    'MetadataDate',
  ];
  
  // Categorize each field
  Object.entries(metadata).forEach(([field, value]) => {
    // Skip read-only fields
    if (isReadOnlyField(field)) {
      return;
    }
    
    let category = 'OTHER';
    
    if (locationFields.some(f => field.includes(f) || f.includes(field))) {
      category = 'LOCATION';
    } else if (identityFields.some(f => field.includes(f) || f.includes(field))) {
      category = 'IDENTITY';
    } else if (deviceFields.some(f => field.includes(f) || f.includes(field))) {
      category = 'DEVICE';
    } else if (temporalFields.some(f => field.includes(f) || f.includes(field))) {
      category = 'TEMPORAL';
    } else {
      category = 'TECHNICAL';
    }
    
    categorized[category].push({
      field,
      value,
      category,
    });
  });
  
  return categorized;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * End ExifTool process
 */
async function cleanup() {
  try {
    await exiftool.end();
    logger.info('ExifTool process ended');
  } catch (error) {
    logger.error(`Failed to end ExifTool process: ${error.message}`);
  }
}

// Cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  // Buffer-based functions (NEW)
  extractMetadataFromBuffer,
  removeMetadataFromBuffer,
  
  // Original file-based functions (KEPT for compatibility)
  extractMetadata,
  extractMetadataBatch,
  removeAllMetadata,
  removeMetadataFields,
  removeMetadataByCategory,
  
  // Utility functions
  categorizeMetadata,
  cleanup,
};