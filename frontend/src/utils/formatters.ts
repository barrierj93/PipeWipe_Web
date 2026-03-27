/**
 * Formatters - Data formatting utilities
 */

import { format, formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { RiskLevel } from "@/lib/constants";

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format size reduction
 */
export function formatSizeReduction(originalSize: number, newSize: number): string {
  const reduction = originalSize - newSize;
  const percentage = ((reduction / originalSize) * 100).toFixed(1);
  return `${formatFileSize(reduction)} (${percentage}%)`;
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format score (0.0 - 1.0) to percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format number as ordinal (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

// ============================================================================
// DATE/TIME FORMATTING
// ============================================================================

/**
 * Format date
 */
export function formatDate(date: Date | string, formatStr: string = "PPP"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, formatStr);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "PPP p"); // e.g., "Apr 29, 2021 12:45 PM"
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format duration in milliseconds
 */
export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  
  const duration = intervalToDuration({ start: 0, end: ms });
  return formatDuration(duration, { format: ["minutes", "seconds"] });
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp: number): string {
  return formatDateTime(new Date(timestamp));
}

// ============================================================================
// STRING FORMATTING
// ============================================================================

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Title case
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Truncate string
 */
export function truncate(str: string, maxLength: number, suffix: string = "..."): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format field name (convert snake_case or camelCase to readable)
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Format enum value to readable string
 */
export function formatEnumValue(value: string): string {
  return value
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// ============================================================================
// METADATA FORMATTING
// ============================================================================

/**
 * Format metadata value for display
 */
export function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return formatNumber(value, 2);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

/**
 * Format GPS coordinates
 */
export function formatGPSCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

/**
 * Format GPS coordinate (single)
 */
export function formatGPSCoordinate(coord: number, isLatitude: boolean): string {
  const dir = isLatitude ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W";
  return `${Math.abs(coord).toFixed(6)}° ${dir}`;
}

// ============================================================================
// RISK LEVEL FORMATTING
// ============================================================================

/**
 * Format risk level to display text
 */
export function formatRiskLevel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: "Critical",
    [RiskLevel.HIGH]: "High",
    [RiskLevel.MEDIUM]: "Medium",
    [RiskLevel.LOW]: "Low",
    [RiskLevel.MINIMAL]: "Minimal",
  };
  return labels[level];
}

/**
 * Get risk level emoji
 */
export function getRiskLevelEmoji(level: RiskLevel): string {
  const emojis: Record<RiskLevel, string> = {
    [RiskLevel.CRITICAL]: "🔴",
    [RiskLevel.HIGH]: "🟠",
    [RiskLevel.MEDIUM]: "🟡",
    [RiskLevel.LOW]: "🔵",
    [RiskLevel.MINIMAL]: "🟢",
  };
  return emojis[level];
}

// ============================================================================
// LIST FORMATTING
// ============================================================================

/**
 * Format list with commas and "and"
 */
export function formatList(items: string[], maxItems: number = 3): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  if (items.length > maxItems) {
    const visible = items.slice(0, maxItems);
    const remaining = items.length - maxItems;
    return `${visible.join(", ")}, and ${remaining} more`;
  }

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(", ")}, and ${lastItem}`;
}

/**
 * Format array as bullet list
 */
export function formatBulletList(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

// ============================================================================
// URL/PATH FORMATTING
// ============================================================================

/**
 * Format URL for display (remove protocol, truncate)
 */
export function formatURL(url: string, maxLength: number = 50): string {
  let formatted = url.replace(/^https?:\/\//, "");
  return truncate(formatted, maxLength);
}

/**
 * Format file path (show only filename)
 */
export function formatFilePath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1];
}

// ============================================================================
// JSON FORMATTING
// ============================================================================

/**
 * Format JSON for display
 */
export function formatJSON(obj: unknown, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}

/**
 * Pretty print JSON with syntax highlighting
 */
export function formatJSONWithColors(obj: unknown): string {
  const json = formatJSON(obj);
  // Basic syntax highlighting (for terminal/console)
  return json
    .replace(/"([^"]+)":/g, '\x1b[36m"$1"\x1b[0m:') // Keys in cyan
    .replace(/: "([^"]+)"/g, ': \x1b[33m"$1"\x1b[0m') // String values in yellow
    .replace(/: (\d+)/g, ": \x1b[35m$1\x1b[0m") // Numbers in magenta
    .replace(/: (true|false)/g, ": \x1b[32m$1\x1b[0m"); // Booleans in green
}

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format phone number (basic US format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

// ============================================================================
// PRIVACY SCORE FORMATTING
// ============================================================================

/**
 * Format privacy score with description
 */
export function formatPrivacyScore(score: number): { value: string; label: string } {
  const percentage = Math.round(score * 100);
  let label = "Excellent";
  
  if (score >= 0.8) label = "Critical Risk";
  else if (score >= 0.6) label = "High Risk";
  else if (score >= 0.4) label = "Medium Risk";
  else if (score >= 0.2) label = "Low Risk";
  else label = "Minimal Risk";
  
  return {
    value: `${percentage}%`,
    label,
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const formatters = {
  fileSize: formatFileSize,
  sizeReduction: formatSizeReduction,
  number: formatNumber,
  percentage: formatPercentage,
  score: formatScore,
  ordinal: formatOrdinal,
  date: formatDate,
  dateTime: formatDateTime,
  relativeTime: formatRelativeTime,
  durationMs: formatDurationMs,
  timestamp: formatTimestamp,
  capitalize,
  titleCase,
  truncate,
  fieldName: formatFieldName,
  enumValue: formatEnumValue,
  metadataValue: formatMetadataValue,
  gpsCoordinates: formatGPSCoordinates,
  gpsCoordinate: formatGPSCoordinate,
  riskLevel: formatRiskLevel,
  riskLevelEmoji: getRiskLevelEmoji,
  list: formatList,
  bulletList: formatBulletList,
  url: formatURL,
  filePath: formatFilePath,
  json: formatJSON,
  jsonWithColors: formatJSONWithColors,
  phoneNumber: formatPhoneNumber,
  privacyScore: formatPrivacyScore,
};
