/**
 * Badge Component - Status indicators and labels
 */

import React from "react";
import { cn } from "@/utils/classnames";
import type { RiskLevel } from "@/lib/constants";

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  size?: "sm" | "md" | "lg";
  risk?: RiskLevel;
  dot?: boolean;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const badgeVariants = {
  base: "inline-flex items-center rounded-full font-medium transition-colors",
  
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    success: "bg-green-500 text-white hover:bg-green-600",
  },
  
  size: {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  },

  risk: {
    CRITICAL: "bg-red-500 text-white border border-red-500",
    HIGH: "bg-orange-500 text-white border border-orange-500",
    MEDIUM: "bg-yellow-500 text-black border border-yellow-500",
    LOW: "bg-blue-500 text-white border border-blue-500",
    MINIMAL: "bg-green-500 text-white border border-green-500",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      risk,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants.base,
          risk ? badgeVariants.risk[risk] : badgeVariants.variant[variant],
          badgeVariants.size[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1.5 h-1.5 w-1.5 rounded-full",
              risk
                ? cn(
                    risk === "CRITICAL" && "bg-red-500",
                    risk === "HIGH" && "bg-orange-500",
                    risk === "MEDIUM" && "bg-yellow-500",
                    risk === "LOW" && "bg-blue-500",
                    risk === "MINIMAL" && "bg-green-500"
                  )
                : "bg-current"
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

// ============================================================================
// STATUS BADGE VARIANT
// ============================================================================

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "pending" | "uploading" | "processing" | "completed" | "error";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusConfig = {
    pending: {
      variant: "secondary" as const,
      label: "Pending",
    },
    uploading: {
      variant: "default" as const,
      label: "Uploading",
    },
    processing: {
      variant: "default" as const,
      label: "Processing",
    },
    completed: {
      variant: "success" as const,
      label: "Completed",
    },
    error: {
      variant: "destructive" as const,
      label: "Error",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot {...props}>
      {config.label}
    </Badge>
  );
};

StatusBadge.displayName = "StatusBadge";

// ============================================================================
// RISK BADGE VARIANT
// ============================================================================

export interface RiskBadgeProps extends Omit<BadgeProps, "variant"> {
  level: RiskLevel;
  showLabel?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true, ...props }) => {
  const labels: Record<RiskLevel, string> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    MINIMAL: "Minimal",
  };

  return (
    <Badge risk={level} dot {...props}>
      {showLabel && labels[level]}
    </Badge>
  );
};

RiskBadge.displayName = "RiskBadge";

// ============================================================================
// COUNT BADGE VARIANT
// ============================================================================

export interface CountBadgeProps extends Omit<BadgeProps, "children"> {
  count: number;
  max?: number;
}

export const CountBadge: React.FC<CountBadgeProps> = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge size="sm" variant="default" {...props}>
      {displayCount}
    </Badge>
  );
};

CountBadge.displayName = "CountBadge";

export default Badge;
