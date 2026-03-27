/**
 * Secure Removal - Multi-pass metadata overwriting for forensic-level deletion
 * COMPLETELY REWRITTEN: Robust file handling without -overwrite_original issues
 */

const { exiftool } = require('exiftool-vendored');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('../middleware/logger');

// ============================================================================
// SECURE REMOVAL CONFIGURATION
// ============================================================================

const SECURE_PASSES = 3; // Number of overwrite passes

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random string for overwriting
 */
function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely delete a file if it exists
 */
async function safeDelete(filePath) {
  try {
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      logger.debug(`Deleted: ${filePath}`);
    }
  } catch (error) {
    logger.warn(`Could not delete ${filePath}: ${error.message}`);
  }
}

// ============================================================================
// SECURE METADATA REMOVAL - SIMPLIFIED ROBUST APPROACH
// ============================================================================

/**
 * Securely remove metadata with multi-pass overwriting
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {Object} options - Removal options
 * @returns {Promise<Object>} - Removal result with verification
 */
async function secureRemoveMetadata(inputPath, outputPath, options = {}) {
  const {
    fields = null,
    categories = null,
    removeAll = false,
    passes = SECURE_PASSES,
  } = options;

  try {
    logger.info(`Starting secure removal (${passes} passes) from: ${inputPath}`);
    logger.debug(`Output will be at: ${outputPath}`);
    const startTime = Date.now();

    // Step 1: Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fsSync.existsSync(outputDir)) {
      logger.debug(`Creating output directory: ${outputDir}`);
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Step 2: Verify input file exists
    if (!fsSync.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    logger.debug('Input file verified');

    // Step 3: Get original metadata to determine what to remove
    logger.debug('Reading original metadata...');
    const originalMetadata = await exiftool.read(inputPath);
    const originalFieldCount = Object.keys(originalMetadata).length;
    logger.debug(`Original metadata fields: ${originalFieldCount}`);

    // Step 4: Determine fields to remove
    let fieldsToRemove = [];
    
    if (removeAll) {
      fieldsToRemove = Object.keys(originalMetadata);
      logger.debug('Remove ALL mode activated');
    } else if (fields && fields.length > 0) {
      fieldsToRemove = fields;
      logger.debug(`Specific fields mode: ${fieldsToRemove.length} fields`);
    } else if (categories && categories.length > 0) {
      const { categorizeMetadata } = require('./ExifToolWrapper');
      const categorized = categorizeMetadata(originalMetadata);
      
      categories.forEach((category) => {
        const categoryUpper = category.toUpperCase();
        if (categorized[categoryUpper]) {
          categorized[categoryUpper].forEach((item) => {
            fieldsToRemove.push(item.field);
          });
        }
      });
      
      logger.debug(`Category mode: ${fieldsToRemove.length} fields from ${categories.join(', ')}`);
    }

    if (fieldsToRemove.length === 0) {
      logger.warn('No fields to remove');
      await fs.copyFile(inputPath, outputPath);
      return {
        success: true,
        passes: 0,
        fieldsRemoved: 0,
        verified: true,
        processingTime: Date.now() - startTime,
      };
    }

    logger.info(`Will remove ${fieldsToRemove.length} fields through ${passes} passes`);
    if (fieldsToRemove.length <= 15) {
      logger.debug(`Fields: ${fieldsToRemove.join(', ')}`);
    }

    // Step 5: Create initial working copy
    const tempPath = `${outputPath}.temp`;
    await fs.copyFile(inputPath, tempPath);
    logger.debug(`Working copy created at: ${tempPath}`);

    // Step 6: Multi-pass overwriting
    for (let pass = 1; pass <= passes; pass++) {
      logger.debug(`=== Pass ${pass}/${passes} ===`);
      
      // Verify temp file exists
      if (!fsSync.existsSync(tempPath)) {
        throw new Error(`Temp file missing before pass ${pass}`);
      }

      // Build tags for this pass
      const tags = {};
      fieldsToRemove.forEach((field) => {
        if (pass < passes) {
          // Intermediate passes: random data
          tags[field] = generateRandomString(32);
        } else {
          // Final pass: empty to remove
          tags[field] = '';
        }
      });

      // Write tags WITHOUT -overwrite_original
      // This creates a backup file automatically
      logger.debug(`Writing ${Object.keys(tags).length} tags (pass ${pass})...`);
      
      try {
        // exiftool.write without -overwrite_original creates tempfile_original as backup
        await exiftool.write(tempPath, tags);
        logger.debug(`Pass ${pass} write completed`);
        
        // Wait a moment for filesystem
        await sleep(100);
        
        // Clean up the _original backup file that exiftool creates
        const backupPath = `${tempPath}_original`;
        await safeDelete(backupPath);
        
        // Verify temp file still exists and has content
        if (!fsSync.existsSync(tempPath)) {
          throw new Error(`Temp file disappeared after pass ${pass}`);
        }
        
        const stats = await fs.stat(tempPath);
        if (stats.size === 0) {
          throw new Error(`Temp file is empty after pass ${pass}`);
        }
        
        logger.debug(`Pass ${pass} verified (file size: ${stats.size} bytes)`);
        
      } catch (error) {
        logger.error(`Pass ${pass} failed: ${error.message}`);
        throw error;
      }
    }

    // Step 7: Move temp file to final destination
    logger.debug('All passes completed, moving to final location...');
    
    // Delete output file if it exists
    await safeDelete(outputPath);
    
    // Move temp to output
    await fs.rename(tempPath, outputPath);
    logger.debug('File moved to final destination');

    // Step 8: Verify removal
    logger.debug('Verifying metadata removal...');
    const finalMetadata = await exiftool.read(outputPath);
    const finalFieldCount = Object.keys(finalMetadata).length;
    
    const stillPresent = fieldsToRemove.filter((field) => field in finalMetadata);
    const verified = stillPresent.length === 0;

    if (!verified) {
      logger.warn(`${stillPresent.length} fields still present: ${stillPresent.slice(0, 10).join(', ')}...`);
    } else {
      logger.debug('All targeted fields successfully removed');
    }

    const processingTime = Date.now() - startTime;
    
    logger.info(
      `Secure removal completed: ${fieldsToRemove.length - stillPresent.length}/${fieldsToRemove.length} fields removed in ${processingTime}ms`
    );

    return {
      success: true,
      passes,
      fieldsRemoved: fieldsToRemove.length - stillPresent.length,
      fieldsAttempted: fieldsToRemove.length,
      originalFieldCount,
      finalFieldCount,
      stillPresent: stillPresent.length,
      stillPresentFields: stillPresent,
      verified,
      processingTime,
    };

  } catch (error) {
    logger.error(`Secure removal failed: ${error.message}`);
    
    // Cleanup temp files
    const tempPath = `${outputPath}.temp`;
    await safeDelete(tempPath);
    await safeDelete(`${tempPath}_original`);
    
    throw new Error(`Secure metadata removal failed: ${error.message}`);
  }
}

/**
 * Overwrite file metadata with random data (single pass)
 * @param {string} filePath - File path
 * @param {string[]} fields - Fields to overwrite
 * @returns {Promise<void>}
 */
async function overwriteWithRandomData(filePath, fields) {
  try {
    const tags = {};
    fields.forEach((field) => {
      tags[field] = generateRandomString(32);
    });

    await exiftool.write(filePath, tags, ['-overwrite_original']);
    logger.debug(`Overwrote ${fields.length} fields with random data`);
  } catch (error) {
    logger.error(`Failed to overwrite with random data: ${error.message}`);
    throw error;
  }
}

/**
 * Verify metadata removal
 * @param {string} filePath - File path
 * @param {string[]} expectedRemovedFields - Fields that should be removed
 * @returns {Promise<Object>} - Verification result
 */
async function verifyRemoval(filePath, expectedRemovedFields) {
  try {
    const metadata = await exiftool.read(filePath);
    const stillPresent = expectedRemovedFields.filter((field) => field in metadata);
    
    return {
      verified: stillPresent.length === 0,
      totalExpected: expectedRemovedFields.length,
      stillPresent: stillPresent.length,
      presentFields: stillPresent,
    };
  } catch (error) {
    logger.error(`Verification failed: ${error.message}`);
    throw error;
  }
}

/**
 * Calculate removal preview
 * @param {Object} metadata - File metadata
 * @param {Object} options - Removal options
 * @returns {Object} - Preview of what will be removed
 */
function calculateRemovalPreview(metadata, options) {
  const { fields = null, categories = null, removeAll = false } = options;
  
  let fieldsToRemove = [];
  
  if (removeAll) {
    fieldsToRemove = Object.keys(metadata);
  } else if (fields && fields.length > 0) {
    fieldsToRemove = fields;
  } else if (categories && categories.length > 0) {
    const { categorizeMetadata } = require('./ExifToolWrapper');
    const categorized = categorizeMetadata(metadata);
    
    categories.forEach((category) => {
      const categoryUpper = category.toUpperCase();
      if (categorized[categoryUpper]) {
        categorized[categoryUpper].forEach((item) => {
          fieldsToRemove.push(item.field);
        });
      }
    });
  }
  
  return {
    totalFields: Object.keys(metadata).length,
    fieldsToRemove: fieldsToRemove.length,
    fieldsToKeep: Object.keys(metadata).length - fieldsToRemove.length,
    fields: fieldsToRemove,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  secureRemoveMetadata,
  overwriteWithRandomData,
  verifyRemoval,
  calculateRemovalPreview,
  SECURE_PASSES,
};
