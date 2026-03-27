/**
 * Spinner & Loading Components - Loading states and indicators
 */

import React from "react";
import { cn } from "@/utils/classnames";

// ============================================================================
// SPINNER TYPES
// ============================================================================

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary";
}

// ============================================================================
// SPINNER COMPONENT
// ============================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "default",
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
  };

  return (
    <div
      className={cn("inline-block", className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg
        className={cn("animate-spin", sizeClasses[size], variantClasses[variant])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Spinner.displayName = "Spinner";

// ============================================================================
// LOADING STATE COMPONENT
// ============================================================================

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  centered?: boolean;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "md",
  centered = false,
  fullScreen = false,
}) => {
  const Container = fullScreen ? "div" : React.Fragment;
  const containerProps = fullScreen
    ? {
        className:
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      }
    : {};

  return (
    <Container {...containerProps}>
      <div
        className={cn(
          "flex flex-col items-center gap-3",
          centered && "justify-center min-h-[200px]",
          fullScreen && "p-8"
        )}
      >
        <Spinner size={size} variant="primary" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </Container>
  );
};

LoadingState.displayName = "LoadingState";

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  className,
  style,
  ...props
}) => {
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || undefined,
        height: height || (variant === "text" ? "1em" : undefined),
        ...style,
      }}
      {...props}
    />
  );
};

Skeleton.displayName = "Skeleton";

// ============================================================================
// SKELETON GROUP (for lists)
// ============================================================================

export interface SkeletonGroupProps {
  count?: number;
  variant?: SkeletonProps["variant"];
  gap?: number;
  className?: string;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  variant = "text",
  gap = 3,
  className,
}) => {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap: `${gap * 0.25}rem` }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

SkeletonGroup.displayName = "SkeletonGroup";

// ============================================================================
// DOTS LOADER
// ============================================================================

export interface DotsLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({ size = "md", color }) => {
  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-current animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            color: color,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

DotsLoader.displayName = "DotsLoader";

// ============================================================================
// PROGRESS BAR
// ============================================================================

export interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = "md",
  variant = "default",
  animated = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className="w-full">
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", heightClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            variantClasses[variant],
            animated && "animate-pulse"
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {Math.round(clampedValue)}%
        </p>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";

export default Spinner;
