/**
 * Validators - Data validation functions
 */

import { FILE_CONFIG, PATTERNS } from "@/lib/constants";
import type {
  FileValidationResult,
  FileValidationError,
  FileValidationErrorCode,
} from "@/types";

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate a single file
 */
export function validateFile(file: File): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    errors.push({
      code: "FILE_TOO_LARGE" as FileValidationErrorCode,
      message: `File "${file.name}" exceeds maximum size of ${formatBytes(FILE_CONFIG.MAX_SIZE)}`,
      file: file.name,
    });
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push({
      code: "EMPTY_FILE" as FileValidationErrorCode,
      message: `File "${file.name}" is empty`,
      file: file.name,
    });
  }

  // Check file type
  const extension = getFileExtension(file.name);
  if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push({
      code: "INVALID_TYPE" as FileValidationErrorCode,
      message: `File type "${extension}" is not supported`,
      file: file.name,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check batch size
  if (files.length > FILE_CONFIG.MAX_BATCH_SIZE) {
    errors.push({
      code: "TOO_MANY_FILES" as FileValidationErrorCode,
      message: `Cannot upload more than ${FILE_CONFIG.MAX_BATCH_SIZE} files at once`,
    });
  }

  // Check for duplicates
  const fileNames = files.map((f) => f.name);
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    duplicates.forEach((name) => {
      errors.push({
        code: "DUPLICATE_FILE" as FileValidationErrorCode,
        message: `Duplicate file: "${name}"`,
        file: name,
      });
    });
  }

  // Validate each file
  files.forEach((file) => {
    const result = validateFile(file);
    errors.push(...result.errors);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// STRING VALIDATION
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return PATTERNS.EMAIL.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  return PATTERNS.PHONE.test(phone);
}

/**
 * Validate GPS coordinate
 */
export function isValidGPSCoordinate(coord: string): boolean {
  return PATTERNS.GPS_COORDINATE.test(coord);
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  return PATTERNS.URL.test(url);
}

// ============================================================================
// METADATA VALIDATION
// ============================================================================

/**
 * Validate metadata field value
 */
export function isValidMetadataValue(value: unknown): boolean {
  // Null and undefined are valid
  if (value === null || value === undefined) return true;

  // Check for valid types
  const type = typeof value;
  return (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    Array.isArray(value) ||
    (type === "object" && value !== null)
  );
}

/**
 * Sanitize metadata field name
 */
export function sanitizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/[^a-zA-Z0-9_.-]/g, "_") // Replace invalid chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): boolean {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return isValidNumber(value) && value >= min && value <= max;
}

/**
 * Validate latitude
 */
export function isValidLatitude(lat: number): boolean {
  return isInRange(lat, -90, 90);
}

/**
 * Validate longitude
 */
export function isValidLongitude(lon: number): boolean {
  return isInRange(lon, -180, 180);
}

// ============================================================================
// ARRAY VALIDATION
// ============================================================================

/**
 * Check if array is not empty
 */
export function isNonEmptyArray<T>(arr: T[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Check if all items in array are unique
 */
export function hasUniqueItems<T>(arr: T[]): boolean {
  return new Set(arr).size === arr.length;
}

// ============================================================================
// OBJECT VALIDATION
// ============================================================================

/**
 * Check if object has required keys
 */
export function hasRequiredKeys<T extends object>(
  obj: T,
  requiredKeys: (keyof T)[]
): boolean {
  return requiredKeys.every((key) => key in obj);
}

/**
 * Check if object is empty
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Check if date is valid
 */
export function isValidDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() > Date.now();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.substring(lastDot).toLowerCase();
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

// ============================================================================
// SCHEMA VALIDATION (Simple type checking)
// ============================================================================

/**
 * Simple schema validator
 */
export function validateSchema<T extends object>(
  data: unknown,
  schema: Record<keyof T, string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    errors.push("Data must be an object");
    return { valid: false, errors };
  }

  Object.entries(schema).forEach(([key, expectedType]) => {
    const value = (data as Record<string, unknown>)[key];
    const actualType = Array.isArray(value) ? "array" : typeof value;

    if (actualType !== expectedType && value !== null && value !== undefined) {
      errors.push(`Field "${key}" should be ${expectedType}, got ${actualType}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize string (remove potentially dangerous characters)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars
    .replace(/_{2,}/g, "_") // Replace multiple underscores
    .replace(/^\.+/, "") // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Escape HTML
 */
export function escapeHTML(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
