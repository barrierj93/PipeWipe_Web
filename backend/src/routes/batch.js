/**
 * Batch Routes - Batch processing endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadMultiple } = require('../middleware/upload');
const { validateMultipleFiles } = require('../middleware/validator');
const { batchLimiter } = require('../middleware/rateLimiter');
const { extractMetadataBatch, categorizeMetadata } = require('../native/ExifToolWrapper');
const { getFileCategory, deleteFile } = require('../utils/fileUtils');
const logger = require('../middleware/logger');
const config = require('../config');

// ============================================================================
// BATCH EXTRACT ENDPOINT
// ============================================================================

/**
 * POST /api/batch/extract
 * Extract metadata from multiple files
 */
router.post(
  '/batch/extract',
  batchLimiter,
  uploadMultiple,
  validateMultipleFiles,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const files = req.files;
    
    logger.info(`Batch processing ${files.length} files`);
    
    try {
      // Extract metadata from all files
      const filePaths = files.map((f) => f.path);
      const results = await extractMetadataBatch(filePaths);
      
      // Process each result
      const processedFiles = files.map((file, index) => {
        const result = results[index];
        
        if (result.error) {
          // File had an error
          logger.error(`Error processing ${file.originalname}: ${result.error}`);
          return {
            success: false,
            fileId: path.basename(file.filename, path.extname(file.filename)),
            file: {
              name: file.originalname,
              size: file.size,
              type: file.mimetype,
              category: getFileCategory(file.originalname),
            },
            error: {
              code: 'EXTRACTION_FAILED',
              message: result.error,
            },
          };
        }
        
        // File processed successfully
        const { raw: rawMetadata } = result;
        const categorizedMetadata = categorizeMetadata(rawMetadata);
        
        // Analyze risks
        const locationAnalysis = analyzeLocation(categorizedMetadata.LOCATION);
        const identityAnalysis = analyzeIdentity(categorizedMetadata.IDENTITY);
        const deviceAnalysis = analyzeDevice(categorizedMetadata.DEVICE);
        
        const riskAssessment = calculateRiskAssessment({
          location: locationAnalysis,
          identity: identityAnalysis,
          device: deviceAnalysis,
        });
        
        const totalFields = Object.keys(rawMetadata).length;
        
        return {
          success: true,
          fileId: path.basename(file.filename, path.extname(file.filename)),
          file: {
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            category: getFileCategory(file.originalname),
          },
          metadata: {
            total_fields: totalFields,
            categorized: {
              critical: categorizedMetadata.LOCATION.length,
              high: categorizedMetadata.IDENTITY.length,
              medium: categorizedMetadata.DEVICE.length,
              low: categorizedMetadata.TEMPORAL.length,
            },
          },
          risk_assessment: riskAssessment,
        };
      });
      
      // Calculate batch statistics
      const successCount = processedFiles.filter((f) => f.success).length;
      const errorCount = processedFiles.filter((f) => !f.success).length;
      const totalFields = processedFiles
        .filter((f) => f.success)
        .reduce((sum, f) => sum + f.metadata.total_fields, 0);
      
      // Overall risk assessment
      const riskScores = processedFiles
        .filter((f) => f.success && f.risk_assessment)
        .map((f) => f.risk_assessment.overall_score);
      
      const avgRiskScore =
        riskScores.length > 0
          ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
          : 0;
      
      let overallRiskLevel = 'MINIMAL';
      if (avgRiskScore >= 0.8) overallRiskLevel = 'CRITICAL';
      else if (avgRiskScore >= 0.6) overallRiskLevel = 'HIGH';
      else if (avgRiskScore >= 0.4) overallRiskLevel = 'MEDIUM';
      else if (avgRiskScore >= 0.2) overallRiskLevel = 'LOW';
      
      // Processing time
      const processingTime = Date.now() - startTime;
      
      // Build response
      const response = {
        success: true,
        batch: {
          total_files: files.length,
          successful: successCount,
          failed: errorCount,
          total_metadata_fields: totalFields,
          avg_fields_per_file: successCount > 0 ? Math.round(totalFields / successCount) : 0,
        },
        overall_risk: {
          average_score: avgRiskScore,
          level: overallRiskLevel,
        },
        files: processedFiles,
        processing_time_ms: processingTime,
      };
      
      logger.info(
        `Batch processing completed: ${successCount}/${files.length} successful (${processingTime}ms)`
      );
      
      // Auto-delete uploaded files if configured
      if (config.autoDeleteUploads) {
        setTimeout(async () => {
          for (const file of files) {
            try {
              await deleteFile(file.path);
              logger.debug(`Auto-deleted uploaded file: ${file.path}`);
            } catch (error) {
              logger.error(`Failed to auto-delete file: ${error.message}`);
            }
          }
        }, 60000); // Delete after 1 minute
      }
      
      res.json(response);
    } catch (error) {
      // Clean up uploaded files on error
      for (const file of files) {
        try {
          await deleteFile(file.path);
        } catch (deleteError) {
          logger.error(`Failed to delete file after error: ${deleteError.message}`);
        }
      }
      
      throw error;
    }
  })
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function analyzeLocation(locationFields) {
  const hasGPS = locationFields.some(
    (f) => f.field.includes('GPS') && f.field.includes('Latitude')
  );
  const riskScore = hasGPS ? 0.9 : locationFields.length > 0 ? 0.5 : 0.0;
  return { has_gps: hasGPS, risk_score: riskScore };
}

function analyzeIdentity(identityFields) {
  const hasIdentityInfo = identityFields.length > 0;
  const riskScore = hasIdentityInfo ? 0.7 : 0.0;
  return { has_identity_info: hasIdentityInfo, risk_score: riskScore };
}

function analyzeDevice(deviceFields) {
  const hasDeviceInfo = deviceFields.length > 0;
  const riskScore = hasDeviceInfo ? 0.5 : 0.0;
  return { has_device_info: hasDeviceInfo, risk_score: riskScore };
}

function calculateRiskAssessment(analyses) {
  const locationRisk = analyses.location.risk_score;
  const identityRisk = analyses.identity.risk_score;
  const deviceRisk = analyses.device.risk_score;
  
  const overallScore = locationRisk * 0.5 + identityRisk * 0.3 + deviceRisk * 0.2;
  
  let level = 'MINIMAL';
  if (overallScore >= 0.8) level = 'CRITICAL';
  else if (overallScore >= 0.6) level = 'HIGH';
  else if (overallScore >= 0.4) level = 'MEDIUM';
  else if (overallScore >= 0.2) level = 'LOW';
  
  return {
    overall_score: overallScore,
    level,
    breakdown: {
      location_risk: locationRisk,
      identity_risk: identityRisk,
      device_risk: deviceRisk,
    },
  };
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;
