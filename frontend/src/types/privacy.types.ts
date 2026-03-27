/**
 * Privacy Types - Privacy analysis and removal interfaces
 */

import type { MetadataCategory, RiskLevel } from "@/lib/constants";
import type { MetadataField } from "./metadata.types";

// ============================================================================
// REMOVAL PRESET
// ============================================================================

export interface RemovalPreset {
  id: string;
  name: string;
  description: string;
  categories?: MetadataCategory[];
  excludeCategories?: MetadataCategory[];
  fields?: string[];
  excludeFields?: string[];
  removeAll?: boolean;
  icon?: string;
}

// ============================================================================
// REMOVAL CONFIGURATION
// ============================================================================

export interface RemovalConfiguration {
  preset?: RemovalPreset;
  selectedFields: Set<string>;
  selectedCategories: Set<MetadataCategory>;
  removeAll: boolean;
  preserveEssential: boolean; // Keep essential metadata like file type
}

// ============================================================================
// REMOVAL PREVIEW
// ============================================================================

export interface RemovalPreview {
  fieldsToRemove: MetadataField[];
  fieldsToKeep: MetadataField[];
  categories: {
    [key in MetadataCategory]: {
      removing: number;
      keeping: number;
    };
  };
  estimatedSizeReduction: number;
  estimatedRiskReduction: number;
  warnings?: RemovalWarning[];
}

export interface RemovalWarning {
  type: "essential_data" | "quality_loss" | "compatibility";
  severity: "info" | "warning" | "error";
  message: string;
  affectedFields: string[];
}

// ============================================================================
// REMOVAL RESULT
// ============================================================================

export interface RemovalResult {
  success: boolean;
  originalFile: {
    name: string;
    size: number;
    metadataCount: number;
  };
  cleanedFile: {
    name: string;
    size: number;
    metadataCount: number;
    downloadUrl?: string;
  };
  removed: {
    fields: string[];
    count: number;
    categories: Record<MetadataCategory, number>;
  };
  kept: {
    fields: string[];
    count: number;
  };
  impact: RemovalImpact;
  timestamp: Date;
}

export interface RemovalImpact {
  sizeReduction: number;
  sizeReductionPercentage: number;
  riskReduction: number;
  riskReductionPercentage: number;
  privacyScoreBefore: number;
  privacyScoreAfter: number;
}

// ============================================================================
// PRIVACY REPORT
// ============================================================================

export interface PrivacyReport {
  id: string;
  fileName: string;
  generatedAt: Date;
  summary: PrivacyReportSummary;
  riskAssessment: PrivacyRiskAssessment;
  findings: PrivacyFinding[];
  recommendations: PrivacyRecommendation[];
  metadata: {
    total: number;
    byCategory: Record<MetadataCategory, number>;
    byRisk: Record<RiskLevel, number>;
  };
}

export interface PrivacyReportSummary {
  overallRisk: RiskLevel;
  privacyScore: number;
  criticalIssues: number;
  totalIssues: number;
  hasGPS: boolean;
  hasIdentity: boolean;
  hasDeviceInfo: boolean;
}

export interface PrivacyRiskAssessment {
  location: {
    score: number;
    level: RiskLevel;
    issues: number;
  };
  identity: {
    score: number;
    level: RiskLevel;
    issues: number;
  };
  device: {
    score: number;
    level: RiskLevel;
    issues: number;
  };
}

export interface PrivacyFinding {
  id: string;
  category: MetadataCategory;
  risk: RiskLevel;
  title: string;
  description: string;
  affectedFields: string[];
  potentialConsequences: string[];
}

export interface PrivacyRecommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: MetadataCategory;
  title: string;
  description: string;
  action: string;
  estimatedImpact: number;
  quickFix?: {
    preset?: string;
    fields?: string[];
  };
}

// ============================================================================
// PRIVACY HISTORY
// ============================================================================

export interface PrivacyHistoryEntry {
  id: string;
  fileName: string;
  timestamp: Date;
  action: "extraction" | "removal" | "comparison";
  result: {
    privacyScore: number;
    riskLevel: RiskLevel;
    metadataCount: number;
  };
  preview?: {
    thumbnail?: string;
    fileType: string;
    size: number;
  };
}

// ============================================================================
// PRIVACY PREFERENCES
// ============================================================================

export interface PrivacyPreferences {
  defaultPreset?: string;
  alwaysRemoveGPS: boolean;
  alwaysRemoveIdentity: boolean;
  preserveTechnicalMetadata: boolean;
  autoAnalyze: boolean;
  showWarnings: boolean;
  confirmBeforeRemoval: boolean;
}

// ============================================================================
// PRIVACY SCORE BREAKDOWN
// ============================================================================

export interface PrivacyScoreBreakdown {
  overall: number;
  components: {
    location: PrivacyScoreComponent;
    identity: PrivacyScoreComponent;
    device: PrivacyScoreComponent;
    temporal: PrivacyScoreComponent;
  };
}

export interface PrivacyScoreComponent {
  score: number;
  weight: number;
  contribution: number;
  findings: number;
  description: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate privacy score from metadata fields
 */
export function calculatePrivacyScore(fields: MetadataField[]): number {
  if (fields.length === 0) return 0;

  const riskWeights: Record<RiskLevel, number> = {
    [RiskLevel.CRITICAL]: 1.0,
    [RiskLevel.HIGH]: 0.75,
    [RiskLevel.MEDIUM]: 0.5,
    [RiskLevel.LOW]: 0.25,
    [RiskLevel.MINIMAL]: 0.1,
  };

  const totalRisk = fields.reduce((sum, field) => {
    return sum + riskWeights[field.risk_level];
  }, 0);

  return Math.min(totalRisk / fields.length, 1.0);
}

/**
 * Generate privacy score breakdown
 */
export function generatePrivacyScoreBreakdown(
  fields: MetadataField[]
): PrivacyScoreBreakdown {
  const categoryFields = {
    location: fields.filter((f) => f.category === MetadataCategory.LOCATION),
    identity: fields.filter((f) => f.category === MetadataCategory.IDENTITY),
    device: fields.filter((f) => f.category === MetadataCategory.DEVICE),
    temporal: fields.filter((f) => f.category === MetadataCategory.TEMPORAL),
  };

  const weights = {
    location: 0.4,
    identity: 0.35,
    device: 0.2,
    temporal: 0.05,
  };

  const components = {
    location: {
      score: calculatePrivacyScore(categoryFields.location),
      weight: weights.location,
      contribution: 0,
      findings: categoryFields.location.length,
      description: "GPS coordinates, place names, network data",
    },
    identity: {
      score: calculatePrivacyScore(categoryFields.identity),
      weight: weights.identity,
      contribution: 0,
      findings: categoryFields.identity.length,
      description: "Names, emails, phone numbers, organizations",
    },
    device: {
      score: calculatePrivacyScore(categoryFields.device),
      weight: weights.device,
      contribution: 0,
      findings: categoryFields.device.length,
      description: "Device IDs, software versions, hardware info",
    },
    temporal: {
      score: calculatePrivacyScore(categoryFields.temporal),
      weight: weights.temporal,
      contribution: 0,
      findings: categoryFields.temporal.length,
      description: "Creation dates, modification times, timestamps",
    },
  };

  // Calculate contributions
  Object.keys(components).forEach((key) => {
    const component = components[key as keyof typeof components];
    component.contribution = component.score * component.weight;
  });

  const overall = Object.values(components).reduce(
    (sum, component) => sum + component.contribution,
    0
  );

  return {
    overall,
    components,
  };
}

/**
 * Generate removal preview
 */
export function generateRemovalPreview(
  allFields: MetadataField[],
  config: RemovalConfiguration
): RemovalPreview {
  const fieldsToRemove: MetadataField[] = [];
  const fieldsToKeep: MetadataField[] = [];

  allFields.forEach((field) => {
    let shouldRemove = false;

    if (config.removeAll) {
      shouldRemove = true;
      // Keep essential fields if preserveEssential is true
      if (config.preserveEssential && isEssentialField(field.field)) {
        shouldRemove = false;
      }
    } else {
      // Check if field is selected
      if (config.selectedFields.has(field.field)) {
        shouldRemove = true;
      }
      // Check if category is selected
      if (config.selectedCategories.has(field.category)) {
        shouldRemove = true;
      }
    }

    if (shouldRemove) {
      fieldsToRemove.push(field);
    } else {
      fieldsToKeep.push(field);
    }
  });

  const categories = {} as RemovalPreview["categories"];
  Object.values(MetadataCategory).forEach((category) => {
    categories[category] = {
      removing: fieldsToRemove.filter((f) => f.category === category).length,
      keeping: fieldsToKeep.filter((f) => f.category === category).length,
    };
  });

  const scoreBefore = calculatePrivacyScore(allFields);
  const scoreAfter = calculatePrivacyScore(fieldsToKeep);

  return {
    fieldsToRemove,
    fieldsToKeep,
    categories,
    estimatedSizeReduction: estimateSizeReduction(fieldsToRemove),
    estimatedRiskReduction: (scoreBefore - scoreAfter) * 100,
    warnings: generateRemovalWarnings(fieldsToRemove, config),
  };
}

/**
 * Check if field is essential
 */
function isEssentialField(fieldName: string): boolean {
  const essentialFields = [
    "FileType",
    "MIMEType",
    "ImageWidth",
    "ImageHeight",
    "VideoWidth",
    "VideoHeight",
    "Duration",
    "FileSize",
  ];
  return essentialFields.includes(fieldName);
}

/**
 * Estimate size reduction in bytes
 */
function estimateSizeReduction(fields: MetadataField[]): number {
  // Rough estimation: average of 50 bytes per metadata field
  return fields.length * 50;
}

/**
 * Generate warnings for removal
 */
function generateRemovalWarnings(
  fieldsToRemove: MetadataField[],
  config: RemovalConfiguration
): RemovalWarning[] {
  const warnings: RemovalWarning[] = [];

  // Check for essential data removal
  const essentialBeingRemoved = fieldsToRemove.filter((f) => isEssentialField(f.field));
  if (essentialBeingRemoved.length > 0 && !config.removeAll) {
    warnings.push({
      type: "essential_data",
      severity: "warning",
      message: "You are removing essential metadata that may affect file compatibility",
      affectedFields: essentialBeingRemoved.map((f) => f.field),
    });
  }

  return warnings;
}
