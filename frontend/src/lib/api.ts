/**
 * API Client - Axios wrapper for backend communication
 * UPDATED FOR IN-MEMORY PROCESSING
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { API_CONFIG, ERROR_MESSAGES } from "@/lib/constants";
import type {
  ApiResponse,
  ApiError,
  ExtractionResponse,
  BatchExtractionResponse,
  HealthCheckResponse,
  SupportedTypesResponse,
  UploadProgress,
} from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface RemovalOptions {
  fileId?: string;
  fields?: string[];
  categories?: string[];
  preset?: string;
  removeAll?: boolean;
  secureMode?: boolean;
}

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or custom headers here
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      console.log("API Request:", config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
      console.log("API Response:", response.status, response.config.url);
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  }
);

// ============================================================================
// ERROR HANDLER
// ============================================================================

function handleApiError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as { error?: ApiError };
    return {
      code: data.error?.code || `HTTP_${error.response.status}`,
      message: data.error?.message || error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      details: data.error?.details,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      code: "NETWORK_ERROR",
      message: ERROR_MESSAGES.NETWORK_ERROR,
    };
  } else {
    // Error setting up request
    return {
      code: "REQUEST_ERROR",
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Health check
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  return response.data;
}

/**
 * Get supported file types
 */
export async function getSupportedTypes(): Promise<SupportedTypesResponse> {
  const response = await apiClient.get<SupportedTypesResponse>(
    API_CONFIG.ENDPOINTS.SUPPORTED_TYPES
  );
  return response.data;
}

/**
 * Extract metadata from file
 */
export async function extractMetadata(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ExtractionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  };

  const response = await apiClient.post<ExtractionResponse>(
    API_CONFIG.ENDPOINTS.EXTRACT,
    formData,
    config
  );

  return response.data;
}

/**
 * Remove metadata from file
 * Returns cleaned file as Blob (processed in memory)
 */
export async function removeMetadata(
  fileId: string,
  options: RemovalOptions
): Promise<Blob> {
  const response = await apiClient.post(
    '/remove',
    {
      fileId,
      ...options,
    },
    {
      responseType: 'blob', // ← Recibir archivo como blob
    }
  );
  
  return response.data; // Retorna Blob directamente
}

/**
 * Download a blob as a file
 * Utility function to trigger browser download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Batch extract metadata from multiple files
 */
export async function batchExtractMetadata(
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<BatchExtractionResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  };

  const response = await apiClient.post<BatchExtractionResponse>(
    API_CONFIG.ENDPOINTS.BATCH_EXTRACT,
    formData,
    config
  );

  return response.data;
}

/**
 * Generic GET request
 */
export async function get<T = unknown>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.get<ApiResponse<T>>(endpoint, config);
  return response.data;
}

/**
 * Generic POST request
 */
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.post<ApiResponse<T>>(endpoint, data, config);
  return response.data;
}

/**
 * Generic PUT request
 */
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.put<ApiResponse<T>>(endpoint, data, config);
  return response.data;
}

/**
 * Generic DELETE request
 */
export async function del<T = unknown>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.delete<ApiResponse<T>>(endpoint, config);
  return response.data;
}

// ============================================================================
// EXPORT API CLIENT
// ============================================================================

export const api = {
  checkHealth,
  getSupportedTypes,
  extractMetadata,
  removeMetadata,
  batchExtractMetadata,
  downloadBlob,
  get,
  post,
  put,
  delete: del,
};

export default api;