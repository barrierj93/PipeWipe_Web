/**
 * Classnames Utility - Conditional CSS class handling
 */

import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names conditionally
 * Wrapper around clsx for consistent usage
 * 
 * @example
 * ```tsx
 * <div className={cn(
 *   "base-class",
 *   isActive && "active-class",
 *   { "hover-class": isHovered },
 *   props.className
 * )} />
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Create variant-based className handler
 * Useful for component variants
 * 
 * @example
 * ```tsx
 * const buttonVariants = createVariants({
 *   base: "px-4 py-2 rounded",
 *   variants: {
 *     variant: {
 *       primary: "bg-blue-500 text-white",
 *       secondary: "bg-gray-500 text-white",
 *     },
 *     size: {
 *       sm: "text-sm",
 *       md: "text-base",
 *       lg: "text-lg",
 *     }
 *   }
 * });
 * 
 * buttonVariants({ variant: "primary", size: "md" })
 * ```
 */
export function createVariants<T extends Record<string, Record<string, string>>>(config: {
  base: string;
  variants: T;
}) {
  return function (props: {
    [K in keyof T]?: keyof T[K];
  } & { className?: string }): string {
    const variantClasses = Object.entries(props)
      .filter(([key]) => key !== "className" && key in config.variants)
      .map(([key, value]) => {
        const variant = config.variants[key as keyof T];
        return variant[value as keyof typeof variant];
      });

    return cn(config.base, ...variantClasses, props.className);
  };
}

/**
 * Conditional class helper
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string {
  return condition ? trueClass : falseClass || "";
}

/**
 * Risk level class helper
 */
export function riskClass(level: string): string {
  const riskClasses: Record<string, string> = {
    CRITICAL: "risk-critical",
    HIGH: "risk-high",
    MEDIUM: "risk-medium",
    LOW: "risk-low",
    MINIMAL: "risk-minimal",
  };
  return riskClasses[level] || "";
}

/**
 * Status class helper
 */
export function statusClass(status: string): string {
  const statusClasses: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    UPLOADING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PROCESSING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return statusClasses[status] || "";
}

/**
 * Size variant helper
 */
export function sizeClass(size: "sm" | "md" | "lg" | "xl"): string {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  return sizeClasses[size];
}

/**
 * Responsive class helper
 */
export function responsiveClass(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  return cn(
    mobile,
    tablet && `md:${tablet}`,
    desktop && `lg:${desktop}`
  );
}

export default cn;
