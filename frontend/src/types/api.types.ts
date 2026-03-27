/**
 * API Types - Request and Response interfaces
 */

import type { MetadataField, MetadataAnalysis, RiskAssessment, Recommendation } from "./metadata.types";

// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  services: {
    exiftool: boolean;
    ffmpeg: boolean;
    poppler: boolean;
  };
}

// ============================================================================
// SUPPORTED TYPES
// ============================================================================

export interface SupportedTypesResponse {
  categories: {
    images: string[];
    videos: string[];
    audio: string[];
    documents: string[];
    other: string[];
  };
  total: number;
}

// ============================================================================
// EXTRACTION
// ============================================================================

export interface ExtractionRequest {
  file: File;
  options?: ExtractionOptions;
}

export interface ExtractionOptions {
  includeRaw?: boolean;
  analyzeThumbnails?: boolean;
  deepScan?: boolean;
}

export interface ExtractionResponse {
  success: boolean;
  fileId: string; // ← AGREGADO para procesamiento en memoria
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  metadata: {
    raw: Record<string, unknown>;
    categorized: {
      critical: MetadataField[];
      high: MetadataField[];
      medium: MetadataField[];
      low: MetadataField[];
    };
    total_fields: number;
  };
  analysis: MetadataAnalysis;
  risk_assessment: RiskAssessment;
  recommendations: Recommendation[];
  processing_time_ms: number;
}

// ============================================================================
// REMOVAL
// ============================================================================

export interface RemovalRequest {
  fileId: string;
  fields?: string[];
  categories?: string[];
  preset?: string;
  removeAll?: boolean;
}

export interface RemovalResponse {
  success: boolean;
  file: {
    name: string;
    originalSize: number;
    cleanedSize: number;
    downloadUrl: string;
  };
  removed: {
    fields: string[];
    count: number;
  };
  remaining: {
    fields: string[];
    count: number;
  };
  processing_time_ms: number;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchExtractionRequest {
  files: File[];
  options?: ExtractionOptions;
}

export interface BatchExtractionResponse {
  success: boolean;
  results: ExtractionResponse[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    processing_time_ms: number;
  };
  errors?: Array<{
    file: string;
    error: string;
  }>;
}

export interface BatchRemovalRequest {
  fileIds: string[];
  removalConfig: RemovalRequest;
}

export interface BatchRemovalResponse {
  success: boolean;
  results: RemovalResponse[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    processing_time_ms: number;
  };
  errors?: Array<{
    fileId: string;
    error: string;
  }>;
}

// ============================================================================
// COMPARISON
// ============================================================================

export interface ComparisonRequest {
  originalFileId: string;
  cleanedFileId: string;
}

export interface ComparisonResponse {
  success: boolean;
  original: {
    name: string;
    size: number;
    metadata_count: number;
  };
  cleaned: {
    name: string;
    size: number;
    metadata_count: number;
  };
  diff: {
    removed_fields: string[];
    remaining_fields: string[];
    size_reduction_bytes: number;
    size_reduction_percentage: number;
  };
  side_by_side: {
    removed: MetadataField[];
    kept: MetadataField[];
  };
}

// ============================================================================
// UPLOAD PROGRESS
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  estimatedTimeRemaining?: number; // seconds
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

export function isExtractionResponse(response: unknown): response is ExtractionResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "metadata" in response &&
    "analysis" in response
  );
}

export function isRemovalResponse(response: unknown): response is RemovalResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "removed" in response &&
    "remaining" in response
  );
}