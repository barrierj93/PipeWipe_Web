/**
 * useRemoval - Hook for managing metadata removal
 * TYPESCRIPT COMPATIBLE VERSION
 */

import { useState } from "react";
import { removeMetadata, downloadBlob } from "@/lib/api";
import type { RemovalOptions } from "@/components/removal/RemovalDialog";

// ============================================================================
// TYPES
// ============================================================================

interface UseRemovalOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
  autoDownload?: boolean;
}

interface UseRemovalReturn {
  isRemoving: boolean;
  error: Error | null;
  removeMetadata: (fileId: string, originalFilename: string, options: RemovalOptions) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useRemoval({
  onSuccess,
  onError,
  autoDownload = true,
}: UseRemovalOptions = {}): UseRemovalReturn {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRemoveMetadata = async (
    fileId: string,
    originalFilename: string,
    options: RemovalOptions // ← Sin default, options es requerido
  ): Promise<void> => {
    try {
      // Validate fileId
      if (!fileId || fileId.trim() === "") {
        throw new Error("File ID is required");
      }

      setIsRemoving(true);
      setError(null);

      console.log("Removing metadata with fileId:", fileId, "options:", options);

      // Build removal request matching backend expectations
      const requestOptions: {
        fields?: string[];
        categories?: string[];
        preset?: string;
        removeAll?: boolean;
        secureMode?: boolean;
      } = {
        secureMode: options.secureMode || false,
      };

      // Map RemovalDialog options to backend format
      if (options.mode === "all") {
        requestOptions.removeAll = true;
      } else if (options.mode === "preset" && options.preset) {
        requestOptions.preset = options.preset;
      } else if (options.mode === "categories" && options.categories) {
        requestOptions.categories = options.categories;
      }

      console.log("Sending removal request:", requestOptions);

      // Call API to remove metadata (returns Blob)
      const cleanedFileBlob = await removeMetadata(fileId, requestOptions);

      console.log("Received cleaned file blob:", cleanedFileBlob.size, "bytes");

      // Generate cleaned filename
      const ext = originalFilename.includes('.') 
        ? originalFilename.substring(originalFilename.lastIndexOf('.'))
        : '';
      const nameWithoutExt = originalFilename.includes('.')
        ? originalFilename.substring(0, originalFilename.lastIndexOf('.'))
        : originalFilename;
      const cleanedFilename = `${nameWithoutExt}_cleaned${ext}`;

      // Auto-download if enabled
      if (autoDownload) {
        downloadBlob(cleanedFileBlob, cleanedFilename);
        console.log("File downloaded:", cleanedFilename);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(cleanedFilename);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Metadata removal failed");
      console.error("Removal error:", error);
      setError(error);

      // Call error callback
      if (onError) {
        onError(error);
      }
      
      // Re-throw to let caller handle if needed
      throw error;
    } finally {
      setIsRemoving(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isRemoving,
    error,
    removeMetadata: handleRemoveMetadata,
    clearError,
  };
}