/**
 * Health Check Routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/health
 * Health check and service status
 */
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {
      exiftool: await checkExifTool(),
      ffmpeg: await checkFFmpeg(),
      poppler: await checkPoppler(),
    },
  };
  
  res.json(health);
}));

// ============================================================================
// SERVICE CHECKS
// ============================================================================

/**
 * Check if ExifTool is available
 */
async function checkExifTool() {
  try {
    const { exiftool } = require('exiftool-vendored');
    await exiftool.version();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if FFmpeg is available
 */
async function checkFFmpeg() {
  try {
    const ffmpeg = require('fluent-ffmpeg');
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        resolve(!err && formats !== undefined);
      });
    });
  } catch (error) {
    return false;
  }
}

/**
 * Check if Poppler is available (for PDF processing)
 */
async function checkPoppler() {
  // For now, return true as pdf-parse doesn't require system Poppler
  // It's a pure JavaScript implementation
  return true;
}

// ============================================================================
// SUPPORTED TYPES ENDPOINT
// ============================================================================

/**
 * GET /api/supported-types
 * Get list of supported file types
 */
router.get('/supported-types', asyncHandler(async (req, res) => {
  const config = require('../config');
  
  const supportedTypes = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.heic', '.heif'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'],
    audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    archives: ['.zip', '.rar'],
  };
  
  res.json({
    success: true,
    supportedTypes,
    maxFileSize: `${config.maxFileSize}MB`,
    maxBatchFiles: config.maxBatchFiles,
  });
}));

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;
