/**
 * useTheme Hook - Dark/Light mode theme management
 */

import { useEffect, useState, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

// ============================================================================
// TYPES
// ============================================================================

type Theme = "light" | "dark" | "system";

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to dark
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "dark"; // Default to dark mode
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // Get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Resolve the actual theme to apply
  const resolveTheme = useCallback(
    (themeValue: Theme): "light" | "dark" => {
      if (themeValue === "system") {
        return getSystemTheme();
      }
      return themeValue;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((themeValue: "light" | "dark"): void => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(themeValue);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        themeValue === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }
  }, []);

  // Set theme
  const setTheme = useCallback(
    (newTheme: Theme): void => {
      setThemeState(newTheme);
      
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      }

      // Resolve and apply
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [resolveTheme, applyTheme]
  );

  // Toggle between light and dark (ignoring system)
  const toggleTheme = useCallback((): void => {
    const current = theme === "system" ? resolvedTheme : theme;
    setTheme(current === "dark" ? "light" : "dark");
  }, [theme, resolvedTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme, resolveTheme, applyTheme]);

  // Listen for system theme changes when using "system" theme
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (): void => {
      const systemTheme = getSystemTheme();
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, getSystemTheme, applyTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

export default useTheme;
