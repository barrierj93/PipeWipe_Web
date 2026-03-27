/**
 * Metadata Types - Metadata structures and analysis
 */

import type { RiskLevel, MetadataCategory } from "@/lib/constants";

// ============================================================================
// METADATA FIELD
// ============================================================================

export interface MetadataField {
  field: string;
  value: unknown;
  category: MetadataCategory;
  risk_level: RiskLevel;
  description?: string;
  path?: string; // JSON path for nested fields
}

// ============================================================================
// CATEGORIZED METADATA
// ============================================================================

export interface CategorizedMetadata {
  critical: MetadataField[];
  high: MetadataField[];
  medium: MetadataField[];
  low: MetadataField[];
}

// ============================================================================
// LOCATION ANALYSIS
// ============================================================================

export interface LocationAnalysis {
  has_gps: boolean;
  coordinates?: GPSCoordinates;
  place_names?: string[];
  network_data?: NetworkData;
  risk_score: number;
  findings: LocationFinding[];
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  precision?: number;
  timestamp?: string;
}

export interface NetworkData {
  ssid?: string[];
  bssid?: string[];
  network_names?: string[];
}

export interface LocationFinding {
  type: "gps" | "place_name" | "network" | "timezone";
  value: string;
  risk: RiskLevel;
  description: string;
}

// ============================================================================
// IDENTITY ANALYSIS
// ============================================================================

export interface IdentityAnalysis {
  has_identity_info: boolean;
  personal_names?: string[];
  email_addresses?: string[];
  phone_numbers?: string[];
  organizations?: string[];
  usernames?: string[];
  copyright_info?: string[];
  risk_score: number;
  findings: IdentityFinding[];
}

export interface IdentityFinding {
  type: "name" | "email" | "phone" | "organization" | "username" | "copyright";
  value: string;
  risk: RiskLevel;
  description: string;
}

// ============================================================================
// DEVICE ANALYSIS
// ============================================================================

export interface DeviceAnalysis {
  has_device_info: boolean;
  device_identifiers?: DeviceIdentifiers;
  software_info?: SoftwareInfo;
  hardware_info?: HardwareInfo;
  risk_score: number;
  findings: DeviceFinding[];
}

export interface DeviceIdentifiers {
  serial_numbers?: string[];
  imei?: string[];
  mac_addresses?: string[];
  device_ids?: string[];
}

export interface SoftwareInfo {
  operating_system?: string;
  os_version?: string;
  software_versions?: Record<string, string>;
  creation_software?: string;
  creation_tool?: string;
}

export interface HardwareInfo {
  make?: string;
  model?: string;
  manufacturer?: string;
  camera_info?: CameraInfo;
}

export interface CameraInfo {
  make?: string;
  model?: string;
  lens?: string;
  serial_number?: string;
}

export interface DeviceFinding {
  type: "serial" | "software" | "hardware" | "identifier";
  value: string;
  risk: RiskLevel;
  description: string;
}

// ============================================================================
// COMPLETE METADATA ANALYSIS
// ============================================================================

export interface MetadataAnalysis {
  location: LocationAnalysis;
  identity: IdentityAnalysis;
  device: DeviceAnalysis;
}

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

export interface RiskAssessment {
  overall_score: number; // 0.0 - 1.0
  level: RiskLevel;
  breakdown: RiskBreakdown;
  total_issues: number;
  critical_issues: number;
}

export interface RiskBreakdown {
  location_risk: number;
  identity_risk: number;
  device_risk: number;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: MetadataCategory;
  title: string;
  description: string;
  action: string;
  fields_affected?: string[];
  estimated_risk_reduction?: number;
}

// ============================================================================
// METADATA FILTER
// ============================================================================

export interface MetadataFilter {
  search?: string;
  categories?: MetadataCategory[];
  riskLevels?: RiskLevel[];
  hasValue?: boolean;
}

// ============================================================================
// METADATA SORT
// ============================================================================

export interface MetadataSort {
  field: "name" | "value" | "category" | "risk";
  order: "asc" | "desc";
}

// ============================================================================
// METADATA SELECTION
// ============================================================================

export interface MetadataSelection {
  selectedFields: Set<string>;
  selectedCategories: Set<MetadataCategory>;
  selectAll: boolean;
}

// ============================================================================
// METADATA TREE NODE (for tree view)
// ============================================================================

export interface MetadataTreeNode {
  key: string;
  label: string;
  value?: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  children?: MetadataTreeNode[];
  path: string;
  depth: number;
  isExpanded?: boolean;
  metadata?: {
    category?: MetadataCategory;
    risk?: RiskLevel;
  };
}

// ============================================================================
// METADATA TABLE ROW (for table view)
// ============================================================================

export interface MetadataTableRow {
  id: string;
  field: string;
  value: string;
  type: string;
  category: MetadataCategory;
  risk: RiskLevel;
  path: string;
  selected: boolean;
}

// ============================================================================
// METADATA STATISTICS
// ============================================================================

export interface MetadataStatistics {
  total_fields: number;
  by_category: Record<MetadataCategory, number>;
  by_risk: Record<RiskLevel, number>;
  has_gps: boolean;
  has_identity: boolean;
  has_device_info: boolean;
  estimated_privacy_score: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert raw metadata object to tree structure
 */
export function metadataToTree(
  data: Record<string, unknown>,
  parentPath: string = "",
  depth: number = 0
): MetadataTreeNode[] {
  return Object.entries(data).map(([key, value]) => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const node: MetadataTreeNode = {
      key,
      label: key,
      value,
      type: getValueType(value),
      path,
      depth,
    };

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      node.children = metadataToTree(value as Record<string, unknown>, path, depth + 1);
    } else if (Array.isArray(value)) {
      node.children = value.map((item, index) => ({
        key: `${index}`,
        label: `[${index}]`,
        value: item,
        type: getValueType(item),
        path: `${path}[${index}]`,
        depth: depth + 1,
      }));
    }

    return node;
  });
}

/**
 * Get value type
 */
function getValueType(value: unknown): MetadataTreeNode["type"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as MetadataTreeNode["type"];
}

/**
 * Flatten metadata tree to list
 */
export function flattenMetadataTree(nodes: MetadataTreeNode[]): MetadataTableRow[] {
  const result: MetadataTableRow[] = [];

  function traverse(node: MetadataTreeNode): void {
    if (node.children) {
      node.children.forEach(traverse);
    } else {
      result.push({
        id: node.path,
        field: node.label,
        value: String(node.value ?? ""),
        type: node.type,
        category: node.metadata?.category ?? MetadataCategory.OTHER,
        risk: node.metadata?.risk ?? RiskLevel.LOW,
        path: node.path,
        selected: false,
      });
    }
  }

  nodes.forEach(traverse);
  return result;
}

/**
 * Calculate metadata statistics
 */
export function calculateMetadataStats(fields: MetadataField[]): MetadataStatistics {
  const stats: MetadataStatistics = {
    total_fields: fields.length,
    by_category: {
      [MetadataCategory.LOCATION]: 0,
      [MetadataCategory.IDENTITY]: 0,
      [MetadataCategory.DEVICE]: 0,
      [MetadataCategory.TEMPORAL]: 0,
      [MetadataCategory.TECHNICAL]: 0,
      [MetadataCategory.OTHER]: 0,
    },
    by_risk: {
      [RiskLevel.CRITICAL]: 0,
      [RiskLevel.HIGH]: 0,
      [RiskLevel.MEDIUM]: 0,
      [RiskLevel.LOW]: 0,
      [RiskLevel.MINIMAL]: 0,
    },
    has_gps: false,
    has_identity: false,
    has_device_info: false,
    estimated_privacy_score: 0,
  };

  fields.forEach((field) => {
    stats.by_category[field.category]++;
    stats.by_risk[field.risk_level]++;

    if (field.category === MetadataCategory.LOCATION) {
      stats.has_gps = true;
    }
    if (field.category === MetadataCategory.IDENTITY) {
      stats.has_identity = true;
    }
    if (field.category === MetadataCategory.DEVICE) {
      stats.has_device_info = true;
    }
  });

  // Calculate privacy score (higher = more risk)
  const riskWeights = {
    [RiskLevel.CRITICAL]: 1.0,
    [RiskLevel.HIGH]: 0.75,
    [RiskLevel.MEDIUM]: 0.5,
    [RiskLevel.LOW]: 0.25,
    [RiskLevel.MINIMAL]: 0.1,
  };

  let totalRisk = 0;
  Object.entries(stats.by_risk).forEach(([level, count]) => {
    totalRisk += riskWeights[level as RiskLevel] * count;
  });

  stats.estimated_privacy_score = Math.min(totalRisk / Math.max(fields.length, 1), 1.0);

  return stats;
}
