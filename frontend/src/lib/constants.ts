/**
 * PipeWipe Professional - Global Constants
 * Centralized configuration and constant values
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/backend",
  TIMEOUT: 30000, // 30 seconds
  ENDPOINTS: {
    EXTRACT: "/extract",
    REMOVE: "/remove",
    BATCH_EXTRACT: "/batch/extract",
    SUPPORTED_TYPES: "/supported-types",
    HEALTH: "/health",
  },
} as const;

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "100", 10) * 1024 * 1024, // MB to bytes
  MAX_BATCH_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_BATCH_FILES || "50", 10),
  CHUNK_SIZE: 5 * 1024 * 1024, // 5MB chunks for large file uploads
  ALLOWED_EXTENSIONS: [
    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
    ".svg",
    ".heic",
    ".heif",
    // Videos
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".flv",
    ".wmv",
    // Audio
    ".mp3",
    ".wav",
    ".flac",
    ".aac",
    ".ogg",
    ".m4a",
    // Documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    // Other
    ".zip",
    ".rar",
  ],
} as const;

// ============================================================================
// PRIVACY RISK LEVELS
// ============================================================================

export enum RiskLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  MINIMAL = "MINIMAL",
}

export const RISK_CONFIG = {
  THRESHOLDS: {
    CRITICAL: 0.8, // 80-100%
    HIGH: 0.6, // 60-80%
    MEDIUM: 0.4, // 40-60%
    LOW: 0.2, // 20-40%
    MINIMAL: 0.0, // 0-20%
  },
  COLORS: {
    CRITICAL: "#ef4444", // red-500
    HIGH: "#f97316", // orange-500
    MEDIUM: "#f59e0b", // yellow-500
    LOW: "#3b82f6", // blue-500
    MINIMAL: "#10b981", // green-500
  },
  LABELS: {
    CRITICAL: "Crítico",
    HIGH: "Alto",
    MEDIUM: "Medio",
    LOW: "Bajo",
    MINIMAL: "Mínimo",
  },
} as const;

// ============================================================================
// METADATA CATEGORIES
// ============================================================================

export enum MetadataCategory {
  LOCATION = "LOCATION",
  IDENTITY = "IDENTITY",
  DEVICE = "DEVICE",
  TEMPORAL = "TEMPORAL",
  TECHNICAL = "TECHNICAL",
  OTHER = "OTHER",
}

export const CATEGORY_CONFIG = {
  ICONS: {
    LOCATION: "MapPin",
    IDENTITY: "User",
    DEVICE: "Smartphone",
    TEMPORAL: "Clock",
    TECHNICAL: "Settings",
    OTHER: "FileText",
  },
  LABELS: {
    LOCATION: "Privacidad de Ubicación",
    IDENTITY: "Privacidad de Identidad",
    DEVICE: "Privacidad de Dispositivo",
    TEMPORAL: "Datos Temporales",
    TECHNICAL: "Metadata Técnica",
    OTHER: "Otros Datos",
  },
  DESCRIPTIONS: {
    LOCATION: "Coordenadas GPS, nombres de lugares, datos de red",
    IDENTITY: "Nombres personales, emails, números de teléfono",
    DEVICE: "Información del dispositivo, software, hardware",
    TEMPORAL: "Fechas de creación, modificación, timestamps",
    TECHNICAL: "Formato, compresión, perfiles de color",
    OTHER: "Otros metadatos no categorizados",
  },
} as const;

// ============================================================================
// REMOVAL PRESETS
// ============================================================================

export const REMOVAL_PRESETS = {
  SOCIAL_MEDIA: {
    id: "social_media",
    name: "Redes Sociales",
    description: "Elimina GPS y datos personales sensibles",
    categories: [MetadataCategory.LOCATION, MetadataCategory.IDENTITY],
    fields: [
      "GPSLatitude",
      "GPSLongitude",
      "GPSAltitude",
      "Creator",
      "Author",
      "Owner",
      "Copyright",
    ],
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Uso Profesional",
    description: "Mantiene metadata técnica, elimina datos personales",
    categories: [MetadataCategory.LOCATION, MetadataCategory.IDENTITY, MetadataCategory.DEVICE],
    excludeCategories: [MetadataCategory.TECHNICAL],
  },
  MAXIMUM_PRIVACY: {
    id: "maximum_privacy",
    name: "Privacidad Máxima",
    description: "Elimina toda la metadata posible",
    removeAll: true,
    excludeFields: ["FileType", "ImageWidth", "ImageHeight", "MIMEType"],
  },
  MINIMAL: {
    id: "minimal",
    name: "Mínimo Necesario",
    description: "Elimina solo GPS coordinates",
    fields: ["GPSLatitude", "GPSLongitude", "GPSAltitude", "GPSPosition"],
  },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONFIG = {
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  DEBOUNCE_DELAY: 300, // ms for search inputs
  TOAST_DURATION: 3000, // ms
  SKELETON_COUNT: 5, // Number of skeleton items to show
  PAGINATION_SIZE: 50, // Items per page in table view
  MAX_TREE_DEPTH: 10, // Max depth for JSON tree view
} as const;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  UPLOAD: { key: "u", ctrlOrCmd: true, description: "Abrir selector de archivos" },
  SEARCH: { key: "k", ctrlOrCmd: true, description: "Búsqueda rápida en metadata" },
  DOWNLOAD: { key: "d", ctrlOrCmd: true, description: "Descargar archivo limpio" },
  TOGGLE_VIEW: { key: "Tab", description: "Cambiar entre vistas" },
  CLOSE_MODAL: { key: "Escape", description: "Cerrar modal/diálogo" },
  SELECT_ALL: { key: "a", ctrlOrCmd: true, description: "Seleccionar todos los campos" },
  DESELECT_ALL: { key: "d", ctrlOrCmd: true, shift: true, description: "Deseleccionar todos" },
} as const;

// ============================================================================
// VIEW MODES
// ============================================================================

export enum ViewMode {
  TREE = "TREE",
  TABLE = "TABLE",
  CATEGORIES = "CATEGORIES",
  MAP = "MAP",
}

export const VIEW_CONFIG = {
  DEFAULT: ViewMode.TABLE,
  LABELS: {
    TREE: "Vista de Árbol",
    TABLE: "Vista de Tabla",
    CATEGORIES: "Vista por Categorías",
    MAP: "Vista de Mapa",
  },
  ICONS: {
    TREE: "TreeDeciduous",
    TABLE: "Table",
    CATEGORIES: "LayoutGrid",
    MAP: "Map",
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "El archivo excede el tamaño máximo permitido",
  INVALID_FILE_TYPE: "Tipo de archivo no soportado",
  UPLOAD_FAILED: "Error al cargar el archivo",
  EXTRACTION_FAILED: "Error al extraer metadata",
  REMOVAL_FAILED: "Error al eliminar metadata",
  NETWORK_ERROR: "Error de conexión. Verifica que el backend esté corriendo",
  UNKNOWN_ERROR: "Ha ocurrido un error inesperado",
  BATCH_LIMIT_EXCEEDED: "Has excedido el límite de archivos por lote",
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: "Archivo cargado exitosamente",
  METADATA_EXTRACTED: "Metadata extraída exitosamente",
  METADATA_REMOVED: "Metadata eliminada exitosamente",
  FILE_DOWNLOADED: "Archivo descargado exitosamente",
  BATCH_COMPLETED: "Procesamiento por lotes completado",
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  ENABLE_MAP_VIEW: process.env.NEXT_PUBLIC_ENABLE_MAP_VIEW === "true",
  ENABLE_FILE_COMPARISON: process.env.NEXT_PUBLIC_ENABLE_FILE_COMPARISON === "true",
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-().]+$/,
  GPS_COORDINATE: /^-?\d+\.?\d*$/,
  URL: /^https?:\/\/.+/,
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  THEME: "pipewipe_theme",
  LAST_PRESET: "pipewipe_last_preset",
  VIEW_MODE: "pipewipe_view_mode",
  PROCESSING_HISTORY: "pipewipe_history",
  USER_PREFERENCES: "pipewipe_preferences",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get risk level based on score (0.0 - 1.0)
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_CONFIG.THRESHOLDS.CRITICAL) return RiskLevel.CRITICAL;
  if (score >= RISK_CONFIG.THRESHOLDS.HIGH) return RiskLevel.HIGH;
  if (score >= RISK_CONFIG.THRESHOLDS.MEDIUM) return RiskLevel.MEDIUM;
  if (score >= RISK_CONFIG.THRESHOLDS.LOW) return RiskLevel.LOW;
  return RiskLevel.MINIMAL;
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
  return RISK_CONFIG.COLORS[level];
}

/**
 * Get label for risk level
 */
export function getRiskLabel(level: RiskLevel): string {
  return RISK_CONFIG.LABELS[level];
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension);
}
