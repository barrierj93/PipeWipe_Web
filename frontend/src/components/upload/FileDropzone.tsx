/**
 * FileDropzone - Drag and drop file upload component
 */

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/utils/classnames";

// ============================================================================
// TYPES
// ============================================================================

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FileDropzone({ onFilesSelected, disabled = false, className }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 50,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center cursor-pointer transition-colors",
        isDragActive && "bg-gray-900",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Upload Icon */}
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-6">
        <Upload className="w-8 h-8 text-white" />
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-white">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-gray-400">or click to browse</p>
      </div>

      {/* File Limits */}
      <div className="mt-6 text-xs text-gray-500 space-y-1 text-center">
        <p>Max file size: 100MB</p>
        <p>Max 50 files at a time</p>
      </div>
    </div>
  );
}
