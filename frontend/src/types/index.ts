/**
 * PipeWipe Professional - Type Definitions
 * Barrel export for all type definitions
 */

// API Types
export type {
  ApiResponse,
  ApiError,
  HealthCheckResponse,
  SupportedTypesResponse,
  ExtractionRequest,
  ExtractionOptions,
  ExtractionResponse,
  RemovalRequest,
  RemovalResponse,
  BatchExtractionRequest,
  BatchExtractionResponse,
  BatchRemovalRequest,
  BatchRemovalResponse,
  ComparisonRequest,
  ComparisonResponse,
  UploadProgress,
} from "./api.types";

export { isApiError, isExtractionResponse, isRemovalResponse } from "./api.types";

// File Types
export type {
  ProcessedFile,
  FilePreview,
  FileValidationResult,
  FileValidationError,
  FileCategoryInfo,
  DownloadOptions,
  BatchFileGroup,
  FileComparison,
} from "./file.types";

export {
  FileUploadStatus,
  FileValidationErrorCode,
  FileCategory,
  BatchProcessingStatus,
  MIME_TYPES,
  FILE_ICONS,
  getFileCategory,
  getFileExtension,
  formatFileSize,
  generateFileId,
  isImageFile,
  isVideoFile,
  isDocumentFile,
} from "./file.types";

// Metadata Types
export type {
  MetadataField,
  CategorizedMetadata,
  LocationAnalysis,
  GPSCoordinates,
  NetworkData,
  LocationFinding,
  IdentityAnalysis,
  IdentityFinding,
  DeviceAnalysis,
  DeviceIdentifiers,
  SoftwareInfo,
  HardwareInfo,
  CameraInfo,
  DeviceFinding,
  MetadataAnalysis,
  RiskAssessment,
  RiskBreakdown,
  Recommendation,
  MetadataFilter,
  MetadataSort,
  MetadataSelection,
  MetadataTreeNode,
  MetadataTableRow,
  MetadataStatistics,
} from "./metadata.types";

export {
  metadataToTree,
  flattenMetadataTree,
  calculateMetadataStats,
} from "./metadata.types";

// Privacy Types
export type {
  RemovalPreset,
  RemovalConfiguration,
  RemovalPreview,
  RemovalWarning,
  RemovalResult,
  RemovalImpact,
  PrivacyReport,
  PrivacyReportSummary,
  PrivacyRiskAssessment,
  PrivacyFinding,
  PrivacyRecommendation,
  PrivacyHistoryEntry,
  PrivacyPreferences,
  PrivacyScoreBreakdown,
  PrivacyScoreComponent,
} from "./privacy.types";

export {
  calculatePrivacyScore,
  generatePrivacyScoreBreakdown,
  generateRemovalPreview,
} from "./privacy.types";

// Re-export constants enums for convenience
export { RiskLevel, MetadataCategory, ViewMode } from "@/lib/constants";
