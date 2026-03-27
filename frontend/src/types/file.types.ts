/**
 * File Types - File handling and upload interfaces
 */

import type { ExtractionResponse } from "./api.types";

// ============================================================================
// FILE UPLOAD STATES
// ============================================================================

export enum FileUploadStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

// ============================================================================
// FILE OBJECT
// ============================================================================

export interface ProcessedFile {
  id: string;
  file: File;
  status: FileUploadStatus;
  uploadProgress: number;
  extractionResult?: ExtractionResponse;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// FILE PREVIEW
// ============================================================================

export interface FilePreview {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview?: string; // base64 or URL for images
  icon?: string; // lucide icon name for non-images
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  errors: FileValidationError[];
}

export interface FileValidationError {
  code: string;
  message: string;
  file?: string;
}

export enum FileValidationErrorCode {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_TYPE = "INVALID_TYPE",
  EMPTY_FILE = "EMPTY_FILE",
  TOO_MANY_FILES = "TOO_MANY_FILES",
  DUPLICATE_FILE = "DUPLICATE_FILE",
}

// ============================================================================
// FILE CATEGORIES
// ============================================================================

export enum FileCategory {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  ARCHIVE = "ARCHIVE",
  OTHER = "OTHER",
}

export interface FileCategoryInfo {
  category: FileCategory;
  icon: string;
  color: string;
  extensions: string[];
}

// ============================================================================
// DOWNLOAD OPTIONS
// ============================================================================

export interface DownloadOptions {
  filename?: string;
  format?: "original" | "zip";
  includeReport?: boolean;
}

// ============================================================================
// BATCH FILE PROCESSING
// ============================================================================

export interface BatchFileGroup {
  id: string;
  files: ProcessedFile[];
  createdAt: Date;
  status: BatchProcessingStatus;
  progress: {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
  };
}

export enum BatchProcessingStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  PARTIAL = "PARTIAL",
  FAILED = "FAILED",
}

// ============================================================================
// FILE COMPARISON
// ============================================================================

export interface FileComparison {
  originalFile: ProcessedFile;
  cleanedFile: ProcessedFile;
  differences: {
    sizeReduction: number;
    sizeReductionPercentage: number;
    metadataRemoved: number;
    metadataKept: number;
  };
}

// ============================================================================
// FILE MIME TYPES
// ============================================================================

export const MIME_TYPES = {
  // Images
  JPEG: "image/jpeg",
  PNG: "image/png",
  GIF: "image/gif",
  WEBP: "image/webp",
  SVG: "image/svg+xml",
  TIFF: "image/tiff",
  BMP: "image/bmp",
  HEIC: "image/heic",
  HEIF: "image/heif",
  
  // Videos
  MP4: "video/mp4",
  MOV: "video/quicktime",
  AVI: "video/x-msvideo",
  MKV: "video/x-matroska",
  WEBM: "video/webm",
  
  // Audio
  MP3: "audio/mpeg",
  WAV: "audio/wav",
  FLAC: "audio/flac",
  AAC: "audio/aac",
  OGG: "audio/ogg",
  M4A: "audio/mp4",
  
  // Documents
  PDF: "application/pdf",
  DOC: "application/msword",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS: "application/vnd.ms-excel",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPT: "application/vnd.ms-powerpoint",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  
  // Archives
  ZIP: "application/zip",
  RAR: "application/x-rar-compressed",
  TAR: "application/x-tar",
  GZ: "application/gzip",
} as const;

// ============================================================================
// FILE ICONS MAPPING
// ============================================================================

export const FILE_ICONS: Record<FileCategory, string> = {
  IMAGE: "Image",
  VIDEO: "Video",
  AUDIO: "Music",
  DOCUMENT: "FileText",
  ARCHIVE: "Archive",
  OTHER: "File",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith("image/")) return FileCategory.IMAGE;
  if (mimeType.startsWith("video/")) return FileCategory.VIDEO;
  if (mimeType.startsWith("audio/")) return FileCategory.AUDIO;
  if (mimeType.includes("pdf") || mimeType.includes("document")) return FileCategory.DOCUMENT;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive")) {
    return FileCategory.ARCHIVE;
  }
  return FileCategory.OTHER;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.substring(lastDot).toLowerCase();
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Check if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return file.type.includes("pdf") || file.type.includes("document");
}
