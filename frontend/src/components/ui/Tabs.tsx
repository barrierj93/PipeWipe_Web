/**
 * Tabs Component - Tabbed navigation and content switching
 */

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/utils/classnames";

// ============================================================================
// CONTEXT
// ============================================================================

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
}

// ============================================================================
// TABS ROOT
// ============================================================================

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const value = controlledValue ?? uncontrolledValue;

  const handleValueChange = (newValue: string): void => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div
        className={cn(
          "w-full",
          orientation === "vertical" && "flex gap-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = "Tabs";

// ============================================================================
// TABS LIST
// ============================================================================

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "pills" | "underline";
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default:
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      pills: "inline-flex gap-2",
      underline: "inline-flex border-b border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        role="tablist"
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";

// ============================================================================
// TABS TRIGGER
// ============================================================================

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, icon, children, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isActive = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

// ============================================================================
// TABS CONTENT
// ============================================================================

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isActive = selectedValue === value;

    if (!isActive && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        className={cn(
          "mt-2 ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !isActive && forceMount && "hidden",
          isActive && "animate-fade-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

// ============================================================================
// EXPORT
// ============================================================================

export default Tabs;
