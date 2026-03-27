/**
 * Extract Routes - Metadata extraction endpoints (UPDATED FOR MEMORY)
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadSingle } = require('../middleware/upload');
const { validateSingleFile } = require('../middleware/validator');
const { extractMetadataFromBuffer, categorizeMetadata } = require('../native/ExifToolWrapper');
const { getFileSize, getMimeType, getFileCategory } = require('../utils/fileUtils');
const logger = require('../middleware/logger');
const config = require('../config');

// ============================================================================
// INITIALIZE MEMORY CACHE
// ============================================================================

// Global cache to store file buffers temporarily
if (!global.fileBufferCache) {
  global.fileBufferCache = new Map();
}

// ============================================================================
// EXTRACT SINGLE FILE ENDPOINT
// ============================================================================

/**
 * POST /api/extract
 * Extract metadata from a single file (IN-MEMORY processing)
 */
router.post(
  '/extract',
  uploadSingle,
  validateSingleFile,
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const file = req.file;
    
    logger.info(`Processing file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    try {
      // Extract metadata from buffer (NO disk I/O)
      const { raw: rawMetadata, extractionTime } = await extractMetadataFromBuffer(
        file.buffer,
        {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }
      );
      
      // Categorize metadata by privacy concern
      const categorizedMetadata = categorizeMetadata(rawMetadata);
      
      // Calculate risk levels for each category
      const riskLevels = calculateRiskLevels(categorizedMetadata);
      
      // Analyze location data
      const locationAnalysis = analyzeLocation(categorizedMetadata.LOCATION);
      
      // Analyze identity data
      const identityAnalysis = analyzeIdentity(categorizedMetadata.IDENTITY);
      
      // Analyze device data
      const deviceAnalysis = analyzeDevice(categorizedMetadata.DEVICE);
      
      // Calculate overall risk assessment
      const riskAssessment = calculateRiskAssessment({
        location: locationAnalysis,
        identity: identityAnalysis,
        device: deviceAnalysis,
      });
      
      // Generate recommendations
      const recommendations = generateRecommendations(riskAssessment, categorizedMetadata);
      
      // Get file info
      const fileInfo = {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        category: getFileCategory(file.originalname),
        uploadedAt: new Date().toISOString(),
      };
      
      // Calculate total fields
      const totalFields = Object.keys(rawMetadata).length;
      
      // Categorize fields by risk level
      const categorizedByRisk = {
        critical: categorizedMetadata.LOCATION,
        high: categorizedMetadata.IDENTITY,
        medium: categorizedMetadata.DEVICE,
        low: categorizedMetadata.TEMPORAL,
      };
      
      // Processing time
      const processingTime = Date.now() - startTime;
      
      // Store buffer in memory cache for later removal
      const fileId = file.fileId; // Set by upload middleware
      global.fileBufferCache.set(fileId, {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        uploadedAt: Date.now(),
      });
      
      // Auto-cleanup after 10 minutes
      setTimeout(() => {
        if (global.fileBufferCache.has(fileId)) {
          global.fileBufferCache.delete(fileId);
          logger.debug(`Auto-deleted file from memory: ${fileId}`);
        }
      }, 10 * 60 * 1000); // 10 minutes
      
      // Build response
      const response = {
        success: true,
        fileId: fileId,
        file: fileInfo,
        metadata: {
          raw: rawMetadata,
          categorized: categorizedByRisk,
          total_fields: totalFields,
        },
        analysis: {
          location: locationAnalysis,
          identity: identityAnalysis,
          device: deviceAnalysis,
        },
        risk_assessment: riskAssessment,
        recommendations,
        processing_time_ms: processingTime,
      };
      
      logger.info(
        `File processed successfully: ${file.originalname} (${processingTime}ms, ${totalFields} fields)`
      );
      
      res.json(response);
    } catch (error) {
      logger.error(`Metadata extraction failed: ${error.message}`);
      throw error;
    }
  })
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate risk levels for each category
 */
function calculateRiskLevels(categorizedMetadata) {
  return {
    location: categorizedMetadata.LOCATION.length > 0 ? 'CRITICAL' : 'MINIMAL',
    identity: categorizedMetadata.IDENTITY.length > 0 ? 'HIGH' : 'MINIMAL',
    device: categorizedMetadata.DEVICE.length > 0 ? 'MEDIUM' : 'MINIMAL',
    temporal: categorizedMetadata.TEMPORAL.length > 0 ? 'LOW' : 'MINIMAL',
  };
}

/**
 * Analyze location metadata
 */
function analyzeLocation(locationFields) {
  const hasGPS = locationFields.some(
    (f) => f.field.includes('GPS') && f.field.includes('Latitude')
  );
  
  let coordinates = null;
  if (hasGPS) {
    const lat = locationFields.find((f) => f.field === 'GPSLatitude');
    const lon = locationFields.find((f) => f.field === 'GPSLongitude');
    if (lat && lon) {
      coordinates = {
        latitude: lat.value,
        longitude: lon.value,
      };
    }
  }
  
  const riskScore = hasGPS ? 0.9 : locationFields.length > 0 ? 0.5 : 0.0;
  
  return {
    has_gps: hasGPS,
    coordinates,
    location_fields: locationFields.map((f) => f.field),
    risk_score: riskScore,
    findings: hasGPS
      ? ['Exact GPS coordinates found - pinpoints your location']
      : locationFields.length > 0
      ? ['Location information found']
      : [],
  };
}

/**
 * Analyze identity metadata
 */
function analyzeIdentity(identityFields) {
  const personalNames = identityFields
    .filter((f) => ['Creator', 'Author', 'Artist', 'OwnerName'].includes(f.field))
    .map((f) => f.value);
  
  const hasIdentityInfo = identityFields.length > 0;
  const riskScore = hasIdentityInfo ? 0.7 : 0.0;
  
  return {
    has_identity_info: hasIdentityInfo,
    personal_names: personalNames,
    identity_fields: identityFields.map((f) => f.field),
    risk_score: riskScore,
    findings: hasIdentityInfo
      ? ['Personal identity information found']
      : [],
  };
}

/**
 * Analyze device metadata
 */
function analyzeDevice(deviceFields) {
  const deviceInfo = {};
  
  deviceFields.forEach((f) => {
    if (f.field === 'Make') deviceInfo.manufacturer = f.value;
    if (f.field === 'Model') deviceInfo.model = f.value;
    if (f.field === 'Software') deviceInfo.software = f.value;
    if (f.field === 'SerialNumber') deviceInfo.serialNumber = f.value;
  });
  
  const hasDeviceInfo = deviceFields.length > 0;
  const riskScore = hasDeviceInfo ? 0.5 : 0.0;
  
  return {
    has_device_info: hasDeviceInfo,
    device_info: deviceInfo,
    device_fields: deviceFields.map((f) => f.field),
    risk_score: riskScore,
    findings: hasDeviceInfo
      ? ['Device information found - can identify your equipment']
      : [],
  };
}

/**
 * Calculate overall risk assessment
 */
function calculateRiskAssessment(analyses) {
  const locationRisk = analyses.location.risk_score;
  const identityRisk = analyses.identity.risk_score;
  const deviceRisk = analyses.device.risk_score;
  
  // Weighted average (location is most critical)
  const overallScore =
    locationRisk * 0.5 + identityRisk * 0.3 + deviceRisk * 0.2;
  
  // Determine risk level
  let level = 'MINIMAL';
  if (overallScore >= 0.8) level = 'CRITICAL';
  else if (overallScore >= 0.6) level = 'HIGH';
  else if (overallScore >= 0.4) level = 'MEDIUM';
  else if (overallScore >= 0.2) level = 'LOW';
  
  // Count critical issues
  const criticalIssues =
    (analyses.location.has_gps ? 1 : 0) +
    (analyses.identity.personal_names.length > 0 ? 1 : 0);
  
  return {
    overall_score: overallScore,
    level,
    breakdown: {
      location_risk: locationRisk,
      identity_risk: identityRisk,
      device_risk: deviceRisk,
    },
    total_issues:
      analyses.location.location_fields.length +
      analyses.identity.identity_fields.length +
      analyses.device.device_fields.length,
    critical_issues: criticalIssues,
  };
}

/**
 * Generate recommendations based on risk assessment
 */
function generateRecommendations(riskAssessment, categorizedMetadata) {
  const recommendations = [];
  
  // Location recommendation
  if (categorizedMetadata.LOCATION.length > 0) {
    recommendations.push({
      id: '1',
      priority: 'critical',
      category: 'LOCATION',
      title: 'Remove GPS coordinates',
      description: 'Your file contains exact GPS coordinates that pinpoint your location',
      action: 'Remove all location data before sharing',
    });
  }
  
  // Identity recommendation
  if (categorizedMetadata.IDENTITY.length > 0) {
    recommendations.push({
      id: '2',
      priority: 'high',
      category: 'IDENTITY',
      title: 'Remove personal identity information',
      description: 'Your file contains personal information like names or copyright',
      action: 'Remove identity fields to protect privacy',
    });
  }
  
  // Device recommendation
  if (categorizedMetadata.DEVICE.length > 0) {
    recommendations.push({
      id: '3',
      priority: 'medium',
      category: 'DEVICE',
      title: 'Remove device information',
      description: 'Your file contains device details that can identify your equipment',
      action: 'Consider removing device information',
    });
  }
  
  // General recommendation
  if (riskAssessment.overall_score > 0.5) {
    recommendations.push({
      id: '4',
      priority: 'high',
      category: 'GENERAL',
      title: 'High privacy risk detected',
      description: `Overall privacy risk is ${riskAssessment.level}`,
      action: 'Use metadata removal tool before sharing this file',
    });
  }
  
  return recommendations;
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;