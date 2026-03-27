/**
 * FileList Component - Display list of uploaded files
 */

import React from "react";
import { cn } from "@/utils/classnames";
import { FilePreview } from "./FilePreview";
import { EmptyState } from "../common/EmptyState";
import { FileUp } from "lucide-react";
import type { ProcessedFile } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface FileListProps {
  files: ProcessedFile[];
  onFileClick?: (file: ProcessedFile) => void;
  onFileRemove?: (fileId: string) => void;
  onFileRetry?: (fileId: string) => void;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileClick,
  onFileRemove,
  onFileRetry,
  showProgress = true,
  compact = false,
  className,
}) => {
  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileUp}
        title="No files uploaded"
        description="Upload files to start analyzing their metadata"
        size="sm"
      />
    );
  }

  return (
    <div
      className={cn(
        "space-y-2",
        compact ? "max-h-[400px] overflow-y-auto" : "",
        className
      )}
    >
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onClick={onFileClick ? () => onFileClick(file) : undefined}
          onRemove={onFileRemove ? () => onFileRemove(file.id) : undefined}
          onRetry={onFileRetry ? () => onFileRetry(file.id) : undefined}
          showProgress={showProgress}
          compact={compact}
        />
      ))}
    </div>
  );
};

FileList.displayName = "FileList";

// ============================================================================
// FILE LIST WITH SECTIONS (Grouped by status)
// ============================================================================

export interface FileListWithSectionsProps extends Omit<FileListProps, "files"> {
  files: ProcessedFile[];
}

export const FileListWithSections: React.FC<FileListWithSectionsProps> = ({
  files,
  ...props
}) => {
  // Group files by status
  const groupedFiles = files.reduce(
    (acc, file) => {
      if (!acc[file.status]) {
        acc[file.status] = [];
      }
      acc[file.status].push(file);
      return acc;
    },
    {} as Record<string, ProcessedFile[]>
  );

  const sections = [
    { status: "UPLOADING", label: "Uploading", files: groupedFiles.UPLOADING || [] },
    { status: "PROCESSING", label: "Processing", files: groupedFiles.PROCESSING || [] },
    { status: "COMPLETED", label: "Completed", files: groupedFiles.COMPLETED || [] },
    { status: "ERROR", label: "Failed", files: groupedFiles.ERROR || [] },
  ].filter((section) => section.files.length > 0);

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileUp}
        title="No files uploaded"
        description="Upload files to start analyzing their metadata"
        size="sm"
      />
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.status} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {section.label} ({section.files.length})
          </h3>
          <FileList files={section.files} {...props} />
        </div>
      ))}
    </div>
  );
};

FileListWithSections.displayName = "FileListWithSections";

export default FileList;
