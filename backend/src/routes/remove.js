/**
 * Remove Routes - IN-MEMORY metadata removal
 * Processes buffers and sends cleaned files directly to browser
 */

const express = require('express');
const router = express.Router();
const { asyncHandler, ValidationError } = require('../middleware/errorHandler');
const { validateRemovalRequest } = require('../middleware/validator');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  extractMetadataFromBuffer,
  removeMetadataFromBuffer,
  categorizeMetadata,
} = require('../native/ExifToolWrapper');
const logger = require('../middleware/logger');

// ============================================================================
// IN-MEMORY FILE CACHE
// ============================================================================

// Global cache to store file buffers temporarily
// Files auto-delete after 10 minutes
if (!global.fileBufferCache) {
  global.fileBufferCache = new Map();
}

// ============================================================================
// REMOVAL PRESETS (OPTIMIZED)
// ============================================================================

const REMOVAL_PRESETS = {
  'social-media': {
    name: 'Social Media',
    description: 'Remove GPS and personal identity, keep dates and technical info',
    categories: ['LOCATION', 'IDENTITY'],
  },
  'professional': {
    name: 'Professional',
    description: 'Remove GPS, identity, and ALL technical info (software, devices, profiles)',
    categories: ['LOCATION', 'IDENTITY', 'DEVICE'],
  },
  'maximum-privacy': {
    name: 'Maximum Privacy',
    description: 'Remove ALL metadata except color profiles needed for display',
    removeAll: true,
  },
  'minimal': {
    name: 'Minimal',
    description: 'Remove only GPS coordinates',
    categories: ['LOCATION'],
  },
};

// ============================================================================
// REMOVE METADATA ENDPOINT
// ============================================================================

/**
 * POST /api/remove
 * Remove metadata and send cleaned file directly to browser
 */
router.post(
  '/remove',
  uploadLimiter,
  validateRemovalRequest,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const { fileId, fields, categories, preset, removeAll } = req.body;
    
    logger.info(`Removing metadata from file: ${fileId}`);
    if (preset) {
      logger.info(`Using preset: ${preset}`);
    }
    
    // Get file buffer from memory cache
    if (!global.fileBufferCache.has(fileId)) {
      throw new ValidationError('File not found. Please upload the file first.');
    }
    
    const { buffer, originalname, mimetype } = global.fileBufferCache.get(fileId);
    
    try {
      // Extract metadata before removal
      const beforeResult = await extractMetadataFromBuffer(buffer, {
        originalname,
        mimetype,
        size: buffer.length,
      });
      
      const beforeMetadata = beforeResult.raw;
      const beforeCount = Object.keys(beforeMetadata).length;
      
      logger.info(`Original file has ${beforeCount} metadata fields`);
      
      // Determine what fields to remove
      let fieldsToRemove = [];
      let shouldRemoveAll = false;
      
      if (removeAll) {
        shouldRemoveAll = true;
      } else if (preset && REMOVAL_PRESETS[preset]) {
        const presetConfig = REMOVAL_PRESETS[preset];
        logger.info(`Using preset: ${preset} - ${presetConfig.name}`);
        
        if (presetConfig.removeAll) {
          shouldRemoveAll = true;
        } else if (presetConfig.categories) {
          const categorized = categorizeMetadata(beforeMetadata);
          presetConfig.categories.forEach(cat => {
            if (categorized[cat.toUpperCase()]) {
              categorized[cat.toUpperCase()].forEach(item => {
                fieldsToRemove.push(item.field);
              });
            }
          });
          logger.info(`Found ${fieldsToRemove.length} fields to remove from categories`);
        }
      } else if (categories && categories.length > 0) {
        const categorized = categorizeMetadata(beforeMetadata);
        categories.forEach(cat => {
          if (categorized[cat.toUpperCase()]) {
            categorized[cat.toUpperCase()].forEach(item => {
              fieldsToRemove.push(item.field);
            });
          }
        });
        logger.info(`Found ${fieldsToRemove.length} fields to remove from categories`);
      } else if (fields && fields.length > 0) {
        fieldsToRemove = fields;
        logger.info(`Removing ${fieldsToRemove.length} specific fields`);
      } else {
        throw new ValidationError('Specify what to remove: fields, categories, preset, or removeAll');
      }
      
      // Remove metadata from buffer
      const cleanedBuffer = await removeMetadataFromBuffer(buffer, {
        removeAll: shouldRemoveAll,
        fields: fieldsToRemove,
      });
      
      // Extract metadata after removal (for verification)
      const afterResult = await extractMetadataFromBuffer(cleanedBuffer, {
        originalname,
        mimetype,
        size: cleanedBuffer.length,
      });
      
      const afterMetadata = afterResult.raw;
      const afterCount = Object.keys(afterMetadata).length;
      
      logger.info(`Cleaned file has ${afterCount} metadata fields`);
      
      // Calculate removed fields
      const removedFields = Object.keys(beforeMetadata).filter(
        key => !(key in afterMetadata)
      );
      
      const processingTime = Date.now() - startTime;
      
      logger.info(
        `Metadata removed successfully: ${removedFields.length} fields (${processingTime}ms)`
      );
      
      // Generate cleaned filename
      const ext = originalname.substring(originalname.lastIndexOf('.'));
      const nameWithoutExt = originalname.substring(0, originalname.lastIndexOf('.'));
      const cleanedFilename = `${nameWithoutExt}_cleaned${ext}`;
      
      // Send cleaned file directly to browser
      res.setHeader('Content-Type', mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${cleanedFilename}"`);
      res.setHeader('X-Removed-Fields-Count', removedFields.length.toString());
      res.setHeader('X-Processing-Time-Ms', processingTime.toString());
      res.setHeader('X-Original-Fields', beforeCount.toString());
      res.setHeader('X-Remaining-Fields', afterCount.toString());
      
      // Send buffer directly
      res.send(cleanedBuffer);
      
      // Delete from memory cache immediately
      global.fileBufferCache.delete(fileId);
      logger.debug(`File removed from memory cache: ${fileId}`);
      
    } catch (error) {
      logger.error(`Metadata removal failed: ${error.message}`);
      throw error;
    }
  })
);

// ============================================================================
// GET REMOVAL PRESETS
// ============================================================================

router.get('/remove/presets', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    presets: Object.entries(REMOVAL_PRESETS).map(([key, preset]) => ({
      id: key,
      name: preset.name,
      description: preset.description,
      categories: preset.categories || [],
      removeAll: preset.removeAll || false,
    })),
  });
}));

// ============================================================================
// PREVIEW REMOVAL
// ============================================================================

router.post(
  '/remove/preview',
  asyncHandler(async (req, res) => {
    const { fileId, fields, categories, preset, removeAll } = req.body;
    
    // Get file buffer from memory cache
    if (!global.fileBufferCache.has(fileId)) {
      throw new ValidationError('File not found');
    }
    
    const { buffer, originalname, mimetype } = global.fileBufferCache.get(fileId);
    
    // Extract metadata
    const { raw: metadata } = await extractMetadataFromBuffer(buffer, {
      originalname,
      mimetype,
      size: buffer.length,
    });
    
    // Determine what would be removed
    let fieldsToRemove = [];
    
    if (removeAll || (preset && REMOVAL_PRESETS[preset]?.removeAll)) {
      fieldsToRemove = Object.keys(metadata);
    } else {
      const categoriesToRemove = preset && REMOVAL_PRESETS[preset]
        ? REMOVAL_PRESETS[preset].categories
        : categories;
      
      if (categoriesToRemove && categoriesToRemove.length > 0) {
        const categorized = categorizeMetadata(metadata);
        categoriesToRemove.forEach(cat => {
          if (categorized[cat.toUpperCase()]) {
            categorized[cat.toUpperCase()].forEach(item => {
              fieldsToRemove.push(item.field);
            });
          }
        });
      } else if (fields) {
        fieldsToRemove = fields;
      }
    }
    
    const preview = {
      total_fields: Object.keys(metadata).length,
      fields_to_remove: fieldsToRemove.length,
      fields_remaining: Object.keys(metadata).length - fieldsToRemove.length,
      fields_list: fieldsToRemove,
    };
    
    res.json({
      success: true,
      preview,
    });
  })
);

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;