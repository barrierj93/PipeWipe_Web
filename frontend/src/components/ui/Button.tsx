/**
 * Button Component - Reusable button with variants
 */

import React from "react";
import { cn } from "@/utils/classnames";
import type { LucideIcon } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  
  variant: {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost:
      "hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  },
  
  size: {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants.base,
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className={cn(
              "animate-spin -ml-1 mr-2 h-4 w-4",
              size === "sm" && "h-3 w-3",
              size === "lg" && "h-5 w-5"
            )}
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
        )}
        
        {!loading && Icon && iconPosition === "left" && (
          <Icon
            className={cn(
              "h-4 w-4",
              children && "mr-2",
              size === "sm" && "h-3 w-3",
              size === "lg" && "h-5 w-5"
            )}
          />
        )}
        
        {children}
        
        {!loading && Icon && iconPosition === "right" && (
          <Icon
            className={cn(
              "h-4 w-4",
              children && "ml-2",
              size === "sm" && "h-3 w-3",
              size === "lg" && "h-5 w-5"
            )}
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
