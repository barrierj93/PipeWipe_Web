/**
 * Cleanup Utilities - Manage temporary files, cache, and old processed files
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const logger = require('../middleware/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CLEANUP_CONFIG = {
  // How often to run cleanup (in milliseconds)
  cleanupIntervalMs: 60 * 60 * 1000, // Every hour
  
  // Delete files from cleaned/ older than this (in hours)
  cleanedMaxAgeHours: 24,
  
  // Delete files from uploads/ older than this (in hours)
  uploadsMaxAgeHours: 48,
  
  // Clean ExifTool cache folders (those with hash names)
  cleanExifToolCache: true,
};

// ============================================================================
// FILE AGE CHECKING
// ============================================================================

/**
 * Check if a file is older than specified hours
 * @param {string} filePath - Path to file
 * @param {number} maxAgeHours - Maximum age in hours
 * @returns {Promise<boolean>}
 */
async function isFileOlderThan(filePath, maxAgeHours) {
  try {
    const stats = await fs.stat(filePath);
    const ageMs = Date.now() - stats.mtimeMs;
    const ageHours = ageMs / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a directory name looks like an ExifTool cache (32-char hex hash)
 * @param {string} dirName - Directory name
 * @returns {boolean}
 */
function isExifToolCacheDir(dirName) {
  // ExifTool cache dirs are 32-character hexadecimal strings
  return /^[a-f0-9]{32}$/i.test(dirName);
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Clean old files from a directory
 * @param {string} dirPath - Directory path
 * @param {number} maxAgeHours - Maximum age in hours
 * @returns {Promise<Object>} - Cleanup stats
 */
async function cleanOldFiles(dirPath, maxAgeHours) {
  const stats = {
    scanned: 0,
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    if (!fsSync.existsSync(dirPath)) {
      logger.debug(`Directory doesn't exist: ${dirPath}`);
      return stats;
    }

    const files = await fs.readdir(dirPath);
    stats.scanned = files.length;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stat = await fs.stat(filePath);
        
        // Skip directories
        if (stat.isDirectory()) {
          continue;
        }

        // Check age
        if (await isFileOlderThan(filePath, maxAgeHours)) {
          await fs.unlink(filePath);
          stats.deleted++;
          logger.debug(`Deleted old file: ${file} (age: ${maxAgeHours}+ hours)`);
        }
      } catch (error) {
        stats.failed++;
        stats.errors.push({ file, error: error.message });
        logger.error(`Failed to process file ${file}: ${error.message}`);
      }
    }

    return stats;
  } catch (error) {
    logger.error(`Failed to clean directory ${dirPath}: ${error.message}`);
    return stats;
  }
}

/**
 * Clean ExifTool cache directories
 * @param {string} baseDir - Base directory to scan (usually backend root)
 * @returns {Promise<Object>} - Cleanup stats
 */
async function cleanExifToolCache(baseDir) {
  const stats = {
    scanned: 0,
    deleted: 0,
    failed: 0,
    errors: [],
  };

  try {
    if (!fsSync.existsSync(baseDir)) {
      return stats;
    }

    const items = await fs.readdir(baseDir);
    
    for (const item of items) {
      const itemPath = path.join(baseDir, item);
      
      try {
        const stat = await fs.stat(itemPath);
        
        // Only process directories that look like ExifTool cache
        if (stat.isDirectory() && isExifToolCacheDir(item)) {
          stats.scanned++;
          
          // Delete the entire cache directory
          await fs.rm(itemPath, { recursive: true, force: true });
          stats.deleted++;
          logger.debug(`Deleted ExifTool cache directory: ${item}`);
        }
      } catch (error) {
        stats.failed++;
        stats.errors.push({ item, error: error.message });
        logger.error(`Failed to delete cache dir ${item}: ${error.message}`);
      }
    }

    return stats;
  } catch (error) {
    logger.error(`Failed to clean ExifTool cache: ${error.message}`);
    return stats;
  }
}

/**
 * Run complete cleanup process
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} - Cleanup results
 */
async function runCleanup(options = {}) {
  const {
    cleanedDir = path.join(__dirname, '../../cleaned'),
    uploadsDir = path.join(__dirname, '../../uploads'),
    backendDir = path.join(__dirname, '../..'),
    cleanedMaxAge = CLEANUP_CONFIG.cleanedMaxAgeHours,
    uploadsMaxAge = CLEANUP_CONFIG.uploadsMaxAgeHours,
    cleanCache = CLEANUP_CONFIG.cleanExifToolCache,
  } = options;

  logger.info('Starting cleanup process...');
  const startTime = Date.now();

  const results = {
    cleaned: { scanned: 0, deleted: 0, failed: 0 },
    uploads: { scanned: 0, deleted: 0, failed: 0 },
    cache: { scanned: 0, deleted: 0, failed: 0 },
    duration: 0,
  };

  // Clean old files from cleaned directory
  if (cleanedMaxAge > 0) {
    logger.debug(`Cleaning files older than ${cleanedMaxAge}h from: ${cleanedDir}`);
    results.cleaned = await cleanOldFiles(cleanedDir, cleanedMaxAge);
  }

  // Clean old files from uploads directory
  if (uploadsMaxAge > 0) {
    logger.debug(`Cleaning files older than ${uploadsMaxAge}h from: ${uploadsDir}`);
    results.uploads = await cleanOldFiles(uploadsDir, uploadsMaxAge);
  }

  // Clean ExifTool cache directories
  if (cleanCache) {
    logger.debug(`Cleaning ExifTool cache from: ${backendDir}`);
    results.cache = await cleanExifToolCache(backendDir);
  }

  results.duration = Date.now() - startTime;

  // Log summary
  const totalDeleted = results.cleaned.deleted + results.uploads.deleted + results.cache.deleted;
  logger.info(
    `Cleanup completed in ${results.duration}ms: ` +
    `${totalDeleted} items deleted ` +
    `(cleaned: ${results.cleaned.deleted}, uploads: ${results.uploads.deleted}, cache: ${results.cache.deleted})`
  );

  return results;
}

/**
 * Start automatic periodic cleanup
 * @param {Object} options - Cleanup options
 * @returns {NodeJS.Timeout} - Interval handle
 */
function startPeriodicCleanup(options = {}) {
  const intervalMs = options.intervalMs || CLEANUP_CONFIG.cleanupIntervalMs;
  
  logger.info(`Starting periodic cleanup (every ${intervalMs / 1000 / 60} minutes)`);
  
  // Run immediately on start
  runCleanup(options).catch((error) => {
    logger.error(`Periodic cleanup failed: ${error.message}`);
  });

  // Then run periodically
  const interval = setInterval(() => {
    runCleanup(options).catch((error) => {
      logger.error(`Periodic cleanup failed: ${error.message}`);
    });
  }, intervalMs);

  return interval;
}

/**
 * Clean specific file immediately
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} - Success
 */
async function cleanFile(filePath) {
  try {
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
      logger.debug(`Cleaned file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Failed to clean file ${filePath}: ${error.message}`);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  runCleanup,
  startPeriodicCleanup,
  cleanOldFiles,
  cleanExifToolCache,
  cleanFile,
  isFileOlderThan,
  isExifToolCacheDir,
  CLEANUP_CONFIG,
};
