/**
 * FFmpeg Wrapper - Video and audio metadata extraction
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const logger = require('../middleware/logger');
const config = require('../config');

// Set FFmpeg path to the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract metadata from video/audio file using FFprobe
 * @param {string} filePath - Path to the media file
 * @returns {Promise<Object>} - Extracted metadata
 */
async function extractMediaMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    logger.debug(`Extracting media metadata from: ${filePath}`);
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error(`FFprobe extraction failed: ${err.message}`);
        return reject(new Error(`Failed to extract media metadata: ${err.message}`));
      }
      
      const duration = Date.now() - startTime;
      logger.debug(`Media metadata extraction completed in ${duration}ms`);
      
      // Parse and organize metadata
      const organized = organizeMediaMetadata(metadata);
      
      resolve({
        raw: metadata,
        organized,
        extractionTime: duration,
      });
    });
  });
}

/**
 * Organize FFprobe metadata into structured format
 */
function organizeMediaMetadata(metadata) {
  const organized = {
    format: {},
    streams: [],
    video: {},
    audio: {},
    metadata: {},
  };
  
  // Format information
  if (metadata.format) {
    organized.format = {
      filename: metadata.format.filename,
      format_name: metadata.format.format_name,
      format_long_name: metadata.format.format_long_name,
      duration: metadata.format.duration,
      size: metadata.format.size,
      bit_rate: metadata.format.bit_rate,
      probe_score: metadata.format.probe_score,
    };
    
    // Format tags (metadata)
    if (metadata.format.tags) {
      organized.metadata = metadata.format.tags;
    }
  }
  
  // Stream information
  if (metadata.streams && Array.isArray(metadata.streams)) {
    metadata.streams.forEach((stream) => {
      const streamInfo = {
        index: stream.index,
        codec_name: stream.codec_name,
        codec_long_name: stream.codec_long_name,
        codec_type: stream.codec_type,
        duration: stream.duration,
      };
      
      if (stream.codec_type === 'video') {
        organized.video = {
          ...streamInfo,
          width: stream.width,
          height: stream.height,
          display_aspect_ratio: stream.display_aspect_ratio,
          pix_fmt: stream.pix_fmt,
          fps: eval(stream.r_frame_rate || '0/1'),
          bit_rate: stream.bit_rate,
        };
      } else if (stream.codec_type === 'audio') {
        organized.audio = {
          ...streamInfo,
          sample_rate: stream.sample_rate,
          channels: stream.channels,
          channel_layout: stream.channel_layout,
          bit_rate: stream.bit_rate,
        };
      }
      
      organized.streams.push(streamInfo);
    });
  }
  
  return organized;
}

/**
 * Categorize media metadata for privacy analysis
 */
function categorizeMediaMetadata(metadata) {
  const categorized = {
    LOCATION: [],
    IDENTITY: [],
    DEVICE: [],
    TEMPORAL: [],
    TECHNICAL: [],
  };
  
  if (!metadata.format || !metadata.format.tags) {
    return categorized;
  }
  
  const tags = metadata.format.tags;
  
  // Identity fields
  const identityFields = [
    'artist', 'album_artist', 'composer', 'performer',
    'author', 'copyright', 'publisher', 'encoded_by',
    'comment', 'title', 'album',
  ];
  
  // Device/software fields
  const deviceFields = [
    'encoder', 'encoding_tool', 'creation_tool',
    'make', 'model', 'software',
  ];
  
  // Temporal fields
  const temporalFields = [
    'creation_time', 'date', 'year', 'recording_date',
  ];
  
  // GPS/Location fields
  const locationFields = [
    'location', 'gps_latitude', 'gps_longitude',
    'location_eng', 'location_desc',
  ];
  
  // Categorize each tag
  Object.entries(tags).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();
    
    if (locationFields.some((f) => keyLower.includes(f))) {
      categorized.LOCATION.push({ field: key, value, category: 'LOCATION' });
    } else if (identityFields.some((f) => keyLower.includes(f))) {
      categorized.IDENTITY.push({ field: key, value, category: 'IDENTITY' });
    } else if (deviceFields.some((f) => keyLower.includes(f))) {
      categorized.DEVICE.push({ field: key, value, category: 'DEVICE' });
    } else if (temporalFields.some((f) => keyLower.includes(f))) {
      categorized.TEMPORAL.push({ field: key, value, category: 'TEMPORAL' });
    } else {
      categorized.TECHNICAL.push({ field: key, value, category: 'TECHNICAL' });
    }
  });
  
  return categorized;
}

// ============================================================================
// MEDIA FILE DETECTION
// ============================================================================

/**
 * Check if file is a video file
 */
function isVideoFile(filename) {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return videoExtensions.includes(ext);
}

/**
 * Check if file is an audio file
 */
function isAudioFile(filename) {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return audioExtensions.includes(ext);
}

/**
 * Check if file is a media file (video or audio)
 */
function isMediaFile(filename) {
  return isVideoFile(filename) || isAudioFile(filename);
}

// ============================================================================
// METADATA REMOVAL (EXPERIMENTAL)
// ============================================================================

/**
 * Remove metadata from media file by re-encoding without metadata
 * Note: This re-encodes the file which may reduce quality
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @returns {Promise<void>}
 */
async function removeMediaMetadata(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    logger.debug(`Removing media metadata from: ${inputPath}`);
    
    ffmpeg(inputPath)
      .outputOptions([
        '-map_metadata', '-1', // Remove all metadata
        '-c', 'copy', // Copy streams without re-encoding (fast)
      ])
      .output(outputPath)
      .on('end', () => {
        logger.debug('Media metadata removed successfully');
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Failed to remove media metadata: ${err.message}`);
        reject(new Error(`Failed to remove media metadata: ${err.message}`));
      })
      .run();
  });
}

// ============================================================================
// GET MEDIA INFO
// ============================================================================

/**
 * Get basic info about media file (duration, dimensions, codec)
 */
async function getMediaInfo(filePath) {
  try {
    const { raw, organized } = await extractMediaMetadata(filePath);
    
    const info = {
      duration: organized.format.duration || 0,
      size: organized.format.size || 0,
      bitrate: organized.format.bit_rate || 0,
      format: organized.format.format_name || 'unknown',
    };
    
    if (organized.video && Object.keys(organized.video).length > 0) {
      info.type = 'video';
      info.width = organized.video.width || 0;
      info.height = organized.video.height || 0;
      info.fps = organized.video.fps || 0;
      info.video_codec = organized.video.codec_name || 'unknown';
    } else if (organized.audio && Object.keys(organized.audio).length > 0) {
      info.type = 'audio';
      info.sample_rate = organized.audio.sample_rate || 0;
      info.channels = organized.audio.channels || 0;
      info.audio_codec = organized.audio.codec_name || 'unknown';
    }
    
    return info;
  } catch (error) {
    logger.error(`Failed to get media info: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  extractMediaMetadata,
  categorizeMediaMetadata,
  organizeMediaMetadata,
  removeMediaMetadata,
  getMediaInfo,
  isVideoFile,
  isAudioFile,
  isMediaFile,
};
