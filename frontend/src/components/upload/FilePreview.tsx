/**
 * FilePreview Component - Individual file preview card
 */

import React from "react";
import { cn } from "@/utils/classnames";
import { X, RotateCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/utils/formatters";
import { getFileCategory, FILE_ICONS } from "@/types";
import { StatusBadge } from "../ui/Badge";
import { ProgressBar } from "../ui/Spinner";
import { Button } from "../ui/Button";
import type { ProcessedFile, FileUploadStatus } from "@/types";
import * as LucideIcons from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface FilePreviewProps {
  file: ProcessedFile;
  onClick?: () => void;
  onRemove?: () => void;
  onRetry?: () => void;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClick,
  onRemove,
  onRetry,
  showProgress = true,
  compact = false,
  className,
}) => {
  const category = getFileCategory(file.file.type);
  const iconName = FILE_ICONS[category];
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;

  const isCompleted = file.status === "COMPLETED" as FileUploadStatus;
  const hasError = file.status === "ERROR" as FileUploadStatus;
  const isProcessing =
    file.status === "UPLOADING" as FileUploadStatus ||
    file.status === "PROCESSING" as FileUploadStatus;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-200",
        onClick && "cursor-pointer hover:bg-accent/5 hover:border-primary/50",
        hasError && "border-destructive/50 bg-destructive/5",
        isCompleted && "border-green-500/20 bg-green-500/5",
        compact ? "p-2" : "p-3",
        className
      )}
      onClick={onClick}
    >
      {/* File Icon */}
      <div
        className={cn(
          "flex-shrink-0 rounded-md flex items-center justify-center",
          compact ? "h-10 w-10" : "h-12 w-12",
          hasError ? "bg-destructive/10" : "bg-muted"
        )}
      >
        {Icon && <Icon className={cn("text-muted-foreground", compact ? "h-5 w-5" : "h-6 w-6")} />}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium truncate",
                compact ? "text-sm" : "text-base",
                hasError && "text-destructive"
              )}
              title={file.file.name}
            >
              {file.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file.size)}
              </p>
              {file.completedAt && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(file.completedAt)}
                  </p>
                </>
              )}
            </div>

            {/* Error Message */}
            {hasError && file.error && !compact && (
              <p className="text-xs text-destructive mt-1">{file.error}</p>
            )}

            {/* Metadata Count */}
            {isCompleted && file.extractionResult && (
              <p className="text-xs text-muted-foreground mt-1">
                {file.extractionResult.metadata.total_fields} metadata fields found
              </p>
            )}
          </div>

          {/* Status Badge */}
          {!compact && (
            <StatusBadge
              status={
                file.status.toLowerCase() as
                  | "pending"
                  | "uploading"
                  | "processing"
                  | "completed"
                  | "error"
              }
              size="sm"
            />
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && isProcessing && (
          <div className="mt-2">
            <ProgressBar value={file.uploadProgress} size="sm" animated />
          </div>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {isProcessing && (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        )}
        {isCompleted && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
        {hasError && (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {hasError && onRetry && (
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            title="Retry"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
        {onRemove && (
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

FilePreview.displayName = "FilePreview";

export default FilePreview;
