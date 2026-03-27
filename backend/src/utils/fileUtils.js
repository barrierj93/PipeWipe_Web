/**
 * File Utils - File system utilities
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../middleware/logger');
const config = require('../config');

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
async function getFileStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    logger.error(`Failed to get file stats: ${error.message}`);
    throw error;
  }
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  const stats = await getFileStats(filePath);
  return stats.size;
}

/**
 * Delete file
 */
async function deleteFile(filePath) {
  try {
    if (await fileExists(filePath)) {
      await fs.unlink(filePath);
      logger.debug(`Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Failed to delete file: ${error.message}`);
    throw error;
  }
}

/**
 * Copy file
 */
async function copyFile(sourcePath, destPath) {
  try {
    await fs.copyFile(sourcePath, destPath);
    logger.debug(`Copied file from ${sourcePath} to ${destPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to copy file: ${error.message}`);
    throw error;
  }
}

/**
 * Move file
 */
async function moveFile(sourcePath, destPath) {
  try {
    await fs.rename(sourcePath, destPath);
    logger.debug(`Moved file from ${sourcePath} to ${destPath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to move file: ${error.message}`);
    throw error;
  }
}

/**
 * Read file as buffer
 */
async function readFileBuffer(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    logger.error(`Failed to read file: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// DIRECTORY OPERATIONS
// ============================================================================

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    if (!fsSync.existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    logger.error(`Failed to create directory: ${error.message}`);
    throw error;
  }
}

/**
 * List files in directory
 */
async function listFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    logger.error(`Failed to list files: ${error.message}`);
    throw error;
  }
}

/**
 * Delete all files in directory
 */
async function clearDirectory(dirPath) {
  try {
    const files = await listFiles(dirPath);
    await Promise.all(
      files.map((file) => deleteFile(path.join(dirPath, file)))
    );
    logger.debug(`Cleared directory: ${dirPath}`);
    return files.length;
  } catch (error) {
    logger.error(`Failed to clear directory: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// FILE INFORMATION
// ============================================================================

/**
 * Get file extension
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * Get file name without extension
 */
function getFileNameWithoutExt(filename) {
  return path.basename(filename, path.extname(filename));
}

/**
 * Get file MIME type based on extension
 */
function getMimeType(filename) {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.svg': 'image/svg+xml',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    // Videos
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get file category based on extension
 */
function getFileCategory(filename) {
  const ext = getFileExtension(filename);
  
  const categories = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.heic', '.heif'],
    video: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'],
    audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    archive: ['.zip', '.rar'],
  };
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return 'unknown';
}

// ============================================================================
// FILE CLEANUP
// ============================================================================

/**
 * Auto-delete old files in directory
 */
async function cleanupOldFiles(dirPath, maxAgeHours) {
  try {
    const files = await listFiles(dirPath);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to ms
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await getFileStats(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        await deleteFile(filePath);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} old files from ${dirPath}`);
    }
    
    return deletedCount;
  } catch (error) {
    logger.error(`Failed to cleanup old files: ${error.message}`);
    throw error;
  }
}

/**
 * Schedule periodic cleanup
 */
function scheduleCleanup() {
  // Run cleanup every hour
  const interval = 60 * 60 * 1000; // 1 hour
  
  setInterval(async () => {
    try {
      // Cleanup uploads if auto-delete is enabled
      if (config.autoDeleteUploads) {
        const uploadDir = path.join(__dirname, '../../', config.uploadDir);
        await cleanupOldFiles(uploadDir, 1); // Delete files older than 1 hour
      }
      
      // Cleanup cleaned files
      const cleanedDir = path.join(__dirname, '../../', config.cleanedDir);
      await cleanupOldFiles(cleanedDir, config.autoDeleteCleanedHours);
      
      // Cleanup temp files
      const tempDir = path.join(__dirname, '../../', config.tempDir);
      await cleanupOldFiles(tempDir, 1); // Delete temp files older than 1 hour
    } catch (error) {
      logger.error(`Cleanup task failed: ${error.message}`);
    }
  }, interval);
  
  logger.info('File cleanup scheduler started');
}

// Start cleanup scheduler
if (config.nodeEnv === 'production' || config.autoDeleteUploads) {
  scheduleCleanup();
}

// ============================================================================
// PATH HELPERS
// ============================================================================

/**
 * Get upload directory path
 */
function getUploadDir() {
  return path.join(__dirname, '../../', config.uploadDir);
}

/**
 * Get cleaned directory path
 */
function getCleanedDir() {
  return path.join(__dirname, '../../', config.cleanedDir);
}

/**
 * Get temp directory path
 */
function getTempDir() {
  return path.join(__dirname, '../../', config.tempDir);
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName);
  const nameWithoutExt = getFileNameWithoutExt(originalName);
  return `${uuidv4()}-${nameWithoutExt}${ext}`;
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  // File operations
  fileExists,
  getFileStats,
  getFileSize,
  deleteFile,
  copyFile,
  moveFile,
  readFileBuffer,
  
  // Directory operations
  ensureDir,
  listFiles,
  clearDirectory,
  
  // File information
  getFileExtension,
  getFileNameWithoutExt,
  getMimeType,
  getFileCategory,
  
  // Cleanup
  cleanupOldFiles,
  scheduleCleanup,
  
  // Path helpers
  getUploadDir,
  getCleanedDir,
  getTempDir,
  generateUniqueFilename,
};
