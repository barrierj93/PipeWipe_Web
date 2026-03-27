/**
 * Configuration - Centralized application configuration
 */

require('dotenv').config();

module.exports = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // File Processing
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 100, // MB
  maxBatchFiles: parseInt(process.env.MAX_BATCH_FILES, 10) || 50,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  cleanedDir: process.env.CLEANED_DIR || 'cleaned',
  tempDir: process.env.TEMP_DIR || 'temp',
  autoDeleteUploads: process.env.AUTO_DELETE_UPLOADS === 'true',
  autoDeleteCleanedHours: parseInt(process.env.AUTO_DELETE_CLEANED_HOURS, 10) || 24,
  
  // Metadata Extraction
  exifToolTimeout: parseInt(process.env.EXIFTOOL_TIMEOUT, 10) || 30000,
  exifToolMaxProc: parseInt(process.env.EXIFTOOL_MAX_PROC, 10) || 4,
  ffmpegTimeout: parseInt(process.env.FFMPEG_TIMEOUT, 10) || 60000,
  enableExifTool: process.env.ENABLE_EXIFTOOL !== 'false',
  enableFFmpeg: process.env.ENABLE_FFMPEG !== 'false',
  enablePoppler: process.env.ENABLE_POPPLER !== 'false',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || 'logs',
  logRotationDays: parseInt(process.env.LOG_ROTATION_DAYS, 10) || 7,
  
  // Rate Limiting
  enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15, // minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  
  // Security
  enableHelmet: process.env.ENABLE_HELMET !== 'false',
  enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  
  // Allowed Extensions
  allowedExtensions: process.env.ALLOWED_EXTENSIONS
    ? process.env.ALLOWED_EXTENSIONS.split(',')
    : [
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg',
        '.heic', '.heif',
        // Videos
        '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
        // Audio
        '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a',
        // Documents
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        // Archives
        '.zip', '.rar',
      ],
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiBasePath: process.env.API_BASE_PATH || '/api',
  enableApiDocs: process.env.ENABLE_API_DOCS !== 'false',

  // Al final del objeto config:
autoDeleteCleanedHours: 24,
autoDeleteUploadsHours: 48,
cleanupIntervalMinutes: 60,
cleanExifToolCache: true,
};
