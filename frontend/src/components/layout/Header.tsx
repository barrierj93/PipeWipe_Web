/**
 * Header Component - Main application header
 */

import React from "react";
import { cn } from "@/utils/classnames";
import { Shield, Github, Moon, Sun } from "lucide-react";
import { Button } from "../ui/Button";
import { SimpleTooltip } from "../ui/Tooltip";

// ============================================================================
// TYPES
// ============================================================================

export interface HeaderProps {
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Header: React.FC<HeaderProps> = ({
  theme = "dark",
  onThemeToggle,
  className,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">PipeWipe Professional</h1>
            <p className="text-xs text-muted-foreground">Metadata Analysis & Privacy Tool</p>
          </div>
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {onThemeToggle && (
            <SimpleTooltip text={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onThemeToggle}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </SimpleTooltip>
          )}

          {/* GitHub Link */}
          <SimpleTooltip text="View on GitHub">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open("https://github.com", "_blank")}
              aria-label="GitHub repository"
            >
              <Github className="h-5 w-5" />
            </Button>
          </SimpleTooltip>
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";

// ============================================================================
// COMPACT HEADER VARIANT
// ============================================================================

export interface CompactHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  title = "PipeWipe Professional",
  subtitle,
  actions,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between py-4 border-b", className)}>
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

CompactHeader.displayName = "CompactHeader";

export default Header;
