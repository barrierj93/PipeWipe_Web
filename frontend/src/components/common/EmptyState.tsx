/**
 * EmptyState Component - Display when no data is available
 */

import React from "react";
import { cn } from "@/utils/classnames";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";

// ============================================================================
// TYPES
// ============================================================================

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: "sm" | "md" | "lg";
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  ...props
}) => {
  const sizeConfig = {
    sm: {
      container: "py-8",
      icon: "h-10 w-10",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-base",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-lg",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        config.container,
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className={cn("text-muted-foreground", config.icon)} />
        </div>
      )}

      <h3 className={cn("font-semibold text-foreground mb-2", config.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-muted-foreground max-w-sm mb-6", config.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              icon={action.icon}
              size={size === "sm" ? "sm" : "md"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              size={size === "sm" ? "sm" : "md"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = "EmptyState";

// ============================================================================
// NO FILES STATE (Pre-configured variant)
// ============================================================================

export interface NoFilesStateProps {
  onUpload: () => void;
  message?: string;
}

export const NoFilesState: React.FC<NoFilesStateProps> = ({
  onUpload,
  message = "No files uploaded yet",
}) => {
  return (
    <EmptyState
      icon={require("lucide-react").FileUp}
      title={message}
      description="Upload a file to start analyzing its metadata and privacy risks"
      action={{
        label: "Upload File",
        onClick: onUpload,
        icon: require("lucide-react").Upload,
      }}
    />
  );
};

NoFilesState.displayName = "NoFilesState";

// ============================================================================
// NO RESULTS STATE (Pre-configured variant)
// ============================================================================

export interface NoResultsStateProps {
  searchQuery?: string;
  onClear?: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
  searchQuery,
  onClear,
}) => {
  return (
    <EmptyState
      icon={require("lucide-react").SearchX}
      title="No results found"
      description={
        searchQuery
          ? `No results found for "${searchQuery}". Try adjusting your search.`
          : "No results match your current filters."
      }
      size="sm"
      action={
        onClear
          ? {
              label: "Clear filters",
              onClick: onClear,
            }
          : undefined
      }
    />
  );
};

NoResultsState.displayName = "NoResultsState";

// ============================================================================
// ERROR STATE (Pre-configured variant)
// ============================================================================

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while processing your request. Please try again.",
  onRetry,
}) => {
  return (
    <EmptyState
      icon={require("lucide-react").AlertCircle}
      title={title}
      description={message}
      action={
        onRetry
          ? {
              label: "Try again",
              onClick: onRetry,
              icon: require("lucide-react").RotateCw,
            }
          : undefined
      }
    />
  );
};

ErrorState.displayName = "ErrorState";

export default EmptyState;
