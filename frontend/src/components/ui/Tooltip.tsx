/**
 * Tooltip Component - Hover information and hints
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/classnames";

// ============================================================================
// TYPES
// ============================================================================

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delay?: number;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  delay = 200,
  disabled = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      // Calculate based on side
      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 8;
          break;
        case "bottom":
          top = triggerRect.bottom + 8;
          break;
        case "left":
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case "right":
          left = triggerRect.right + 8;
          break;
      }

      // Calculate based on alignment
      if (side === "top" || side === "bottom") {
        switch (align) {
          case "start":
            left = triggerRect.left;
            break;
          case "center":
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case "end":
            left = triggerRect.right - tooltipRect.width;
            break;
        }
      } else {
        switch (align) {
          case "start":
            top = triggerRect.top;
            break;
          case "center":
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            break;
          case "end":
            top = triggerRect.bottom - tooltipRect.height;
            break;
        }
      }

      setPosition({ top, left });
    }
  }, [isVisible, side, align]);

  const showTooltip = (): void => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Clone children to add event handlers
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
  });

  return (
    <>
      {trigger}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "fixed z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-md",
            "dark:bg-gray-700 dark:text-gray-100",
            "animate-fade-in",
            "pointer-events-none",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </>
  );
};

Tooltip.displayName = "Tooltip";

// ============================================================================
// SIMPLE TOOLTIP (No positioning logic, simpler version)
// ============================================================================

export interface SimpleTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  children: React.ReactNode;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  text,
  children,
  className,
  ...props
}) => {
  return (
    <div className="relative group inline-block" {...props}>
      {children}
      <div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-md",
          "dark:bg-gray-700 dark:text-gray-100",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
          "pointer-events-none whitespace-nowrap z-50",
          className
        )}
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 -mt-1" />
      </div>
    </div>
  );
};

SimpleTooltip.displayName = "SimpleTooltip";

// ============================================================================
// INFO TOOLTIP (With icon)
// ============================================================================

export interface InfoTooltipProps {
  content: string;
  iconClassName?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, iconClassName }) => {
  return (
    <Tooltip content={content}>
      <span className={cn("inline-flex items-center justify-center", iconClassName)}>
        <svg
          className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
    </Tooltip>
  );
};

InfoTooltip.displayName = "InfoTooltip";

export default Tooltip;
