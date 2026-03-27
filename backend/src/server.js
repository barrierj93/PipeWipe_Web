/**
 * PipeWipe Professional Backend
 * Main server entry point with automatic cleanup
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');
const { startPeriodicCleanup } = require('./utils/cleanupUtils');

// Import routes
const healthRoutes = require('./routes/health');
const extractRoutes = require('./routes/extract');
const removeRoutes = require('./routes/remove');
const batchRoutes = require('./routes/batch');

// ============================================================================
// APP INITIALIZATION
// ============================================================================

const app = express();
const PORT = config.port;

// Global reference for cleanup interval
let cleanupInterval = null;

// ============================================================================
// ENSURE REQUIRED DIRECTORIES EXIST
// ============================================================================

const requiredDirs = [
  config.uploadDir,
  config.cleanedDir,
  config.tempDir,
  config.logDir,
];

requiredDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
if (config.enableHelmet) {
  app.use(helmet());
}

// CORS
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);

// Compression
if (config.enableCompression) {
  app.use(compression());
}

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.use('/api', healthRoutes);

// Metadata extraction
app.use('/api', extractRoutes);

// Metadata removal
app.use('/api', removeRoutes);

// Batch processing
app.use('/api', batchRoutes);

// Serve cleaned files for download
app.use('/download', express.static(path.join(__dirname, '..', config.cleanedDir)));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PipeWipe Professional API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// ============================================================================
// ERROR HANDLER (must be last)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  logger.info(`🚀 PipeWipe Professional Backend started`);
  logger.info(`🌐 Server running on http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`📁 Upload directory: ${config.uploadDir}`);
  logger.info(`🧹 Cleaned directory: ${config.cleanedDir}`);
  logger.info(`📊 Logging to: ${config.logDir}`);
  
  // Log enabled features
  const features = [];
  if (config.enableExifTool) features.push('ExifTool');
  if (config.enableFFmpeg) features.push('FFmpeg');
  if (config.enablePoppler) features.push('Poppler');
  logger.info(`✨ Enabled engines: ${features.join(', ')}`);
  
  // ============================================================================
  // START AUTOMATIC CLEANUP SYSTEM
  // ============================================================================
  
  try {
    cleanupInterval = startPeriodicCleanup({
      cleanedDir: path.join(__dirname, '..', config.cleanedDir),
      uploadsDir: path.join(__dirname, '..', config.uploadDir),
      backendDir: path.join(__dirname, '..'),
      cleanedMaxAge: config.autoDeleteCleanedHours || 24,
      uploadsMaxAge: config.autoDeleteUploadsHours || 48,
      intervalMs: (config.cleanupIntervalMinutes || 60) * 60 * 1000,
      cleanCache: config.cleanExifToolCache !== false,
    });
    
    logger.info('🧹 Automatic cleanup system started');
    logger.info(`   - Cleaned files: auto-delete after ${config.autoDeleteCleanedHours || 24}h`);
    logger.info(`   - Uploaded files: auto-delete after ${config.autoDeleteUploadsHours || 48}h`);
    logger.info(`   - ExifTool cache: ${config.cleanExifToolCache !== false ? 'enabled' : 'disabled'}`);
    logger.info(`   - Cleanup runs every: ${config.cleanupIntervalMinutes || 60} minutes`);
  } catch (error) {
    logger.error(`Failed to start cleanup system: ${error.message}`);
    logger.warn('Server will continue without automatic cleanup');
  }
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Stop cleanup interval
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    logger.info('Cleanup interval stopped');
  }
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close ExifTool process
    const { cleanup: exifToolCleanup } = require('./native/ExifToolWrapper');
    exifToolCleanup()
      .then(() => {
        logger.info('ExifTool process closed');
      })
      .catch((error) => {
        logger.error(`ExifTool cleanup failed: ${error.message}`);
      })
      .finally(() => {
        logger.info('Graceful shutdown complete');
        process.exit(0);
      });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// UNHANDLED ERRORS
// ============================================================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

module.exports = app;
