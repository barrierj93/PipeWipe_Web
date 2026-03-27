/**
 * useFileUpload Hook - File upload and extraction management
 */

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { extractMetadata } from "@/lib/api";
import { validateFile } from "@/lib/validators";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type {
  ProcessedFile,
  ExtractionResponse,
  UploadProgress,
} from "@/types";
import { generateFileId, FileUploadStatus } from "@/types";

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseFileUploadOptions {
  onSuccess?: (file: ProcessedFile) => void;
  onError?: (error: string, file: File) => void;
  onProgress?: (progress: UploadProgress, file: File) => void;
  autoExtract?: boolean;
}

interface UseFileUploadReturn {
  files: ProcessedFile[];
  isUploading: boolean;
  uploadFile: (file: File) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  retryFile: (fileId: string) => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSuccess, onError, onProgress, autoExtract = true } = options;

  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload and extract single file
   */
  const uploadFile = useCallback(
    async (file: File): Promise<void> => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        const errorMessage = validation.errors[0]?.message || ERROR_MESSAGES.INVALID_FILE_TYPE;
        toast.error(errorMessage);
        onError?.(errorMessage, file);
        return;
      }

      // Create processed file object
      const processedFile: ProcessedFile = {
        id: generateFileId(),
        file,
        status: FileUploadStatus.UPLOADING,
        uploadProgress: 0,
        createdAt: new Date(),
      };

      // Add to files list
      setFiles((prev) => [...prev, processedFile]);
      setIsUploading(true);

      try {
        // Extract metadata if autoExtract is enabled
        if (autoExtract) {
          // Update status to processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === processedFile.id
                ? { ...f, status: FileUploadStatus.PROCESSING }
                : f
            )
          );

          // Call extraction API
          const result: ExtractionResponse = await extractMetadata(
            file,
            (progress) => {
              // Update upload progress
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === processedFile.id
                    ? { ...f, uploadProgress: progress.percentage }
                    : f
                )
              );
              onProgress?.(progress, file);
            }
          );

          // Update with extraction result
          setFiles((prev) =>
            prev.map((f) =>
              f.id === processedFile.id
                ? {
                    ...f,
                    status: FileUploadStatus.COMPLETED,
                    extractionResult: result,
                    uploadProgress: 100,
                    completedAt: new Date(),
                  }
                : f
            )
          );

          const updatedFile = {
            ...processedFile,
            status: FileUploadStatus.COMPLETED,
            extractionResult: result,
            uploadProgress: 100,
            completedAt: new Date(),
          };

          toast.success(SUCCESS_MESSAGES.METADATA_EXTRACTED);
          onSuccess?.(updatedFile);
        } else {
          // Just mark as completed without extraction
          setFiles((prev) =>
            prev.map((f) =>
              f.id === processedFile.id
                ? {
                    ...f,
                    status: FileUploadStatus.COMPLETED,
                    uploadProgress: 100,
                    completedAt: new Date(),
                  }
                : f
            )
          );

          toast.success(SUCCESS_MESSAGES.FILE_UPLOADED);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : ERROR_MESSAGES.EXTRACTION_FAILED;

        // Update with error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === processedFile.id
              ? {
                  ...f,
                  status: FileUploadStatus.ERROR,
                  error: errorMessage,
                  completedAt: new Date(),
                }
              : f
          )
        );

        toast.error(errorMessage);
        onError?.(errorMessage, file);
      } finally {
        setIsUploading(false);
      }
    },
    [autoExtract, onSuccess, onError, onProgress]
  );

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(
    async (fileList: File[]): Promise<void> => {
      setIsUploading(true);

      // Process files sequentially to avoid overwhelming the server
      for (const file of fileList) {
        await uploadFile(file);
      }

      setIsUploading(false);
    },
    [uploadFile]
  );

  /**
   * Remove file from list
   */
  const removeFile = useCallback((fileId: string): void => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback((): void => {
    setFiles([]);
  }, []);

  /**
   * Retry failed file
   */
  const retryFile = useCallback(
    async (fileId: string): Promise<void> => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      // Remove old entry
      removeFile(fileId);

      // Re-upload
      await uploadFile(file.file);
    },
    [files, uploadFile, removeFile]
  );

  return {
    files,
    isUploading,
    uploadFile,
    uploadFiles,
    removeFile,
    clearFiles,
    retryFile,
  };
}

export default useFileUpload;
