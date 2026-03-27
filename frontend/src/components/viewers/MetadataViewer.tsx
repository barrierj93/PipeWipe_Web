/**
 * MetadataViewer - Main component with horizontal tabs and tree view
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/utils/classnames";
import type { ExtractionResponse } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface MetadataViewerProps {
  data: ExtractionResponse;
  activeView: string;
  onActiveViewChange: (view: string) => void;
  onClear: () => void;
  className?: string;
}

type FilterTab = "all" | "location" | "identity" | "technical" | "temporal" | "raw";

interface CategoryData {
  name: string;
  color: string;
  icon: string;
  fields: Array<{ field: string; value: any }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MetadataViewer({ data, activeView, onActiveViewChange, onClear, className }: MetadataViewerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["IDENTITY", "TEMPORAL"]));

  // Build categories data
  const categories: CategoryData[] = [
    {
      name: "IDENTITY",
      color: "text-orange-500",
      icon: "🟠",
      fields: data.metadata.categorized.high,
    },
    {
      name: "TEMPORAL",
      color: "text-yellow-500",
      icon: "🟡",
      fields: data.metadata.categorized.low,
    },
    {
      name: "LOCATION",
      color: "text-red-500",
      icon: "🔴",
      fields: data.metadata.categorized.critical,
    },
    {
      name: "TECHNICAL",
      color: "text-blue-500",
      icon: "🔵",
      fields: data.metadata.categorized.medium,
    },
  ];

  // Filter categories based on active tab
  const filteredCategories = categories.filter((cat) => {
    if (activeView === "all") return cat.fields.length > 0;
    if (activeView === "location") return cat.name === "LOCATION";
    if (activeView === "identity") return cat.name === "IDENTITY";
    if (activeView === "technical") return cat.name === "TECHNICAL";
    if (activeView === "temporal") return cat.name === "TEMPORAL";
    return false;
  });

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Expand/Collapse all
  const expandAll = () => {
    setExpandedCategories(new Set(categories.map((c) => c.name)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";

    // Handle ExifDateTime objects
    if (typeof value === "object" && value._ctor === "ExifDateTime") {
      const date = new Date(
        value.year,
        value.month - 1,
        value.day,
        value.hour || 0,
        value.minute || 0,
        value.second || 0
      );
      return date.toLocaleString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "";
      if (value.length === 1) return String(value[0]);
      return value.join(", ");
    }

    // Handle objects
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Show raw JSON view
  if (activeView === "raw") {
    return (
      <div className={cn("", className)}>
        {/* Raw JSON with border - Buttons INSIDE */}
        <div className="border border-gray-800 rounded-2xl bg-black p-6">
          {/* Tabs + Clean Button - INSIDE the border */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => onActiveViewChange("all")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "all"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                All
              </button>
              <button
                onClick={() => onActiveViewChange("location")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "location"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                Location
              </button>
              <button
                onClick={() => onActiveViewChange("identity")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "identity"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                Identity
              </button>
              <button
                onClick={() => onActiveViewChange("technical")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "technical"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                Technical
              </button>
              <button
                onClick={() => onActiveViewChange("temporal")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "temporal"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                Temporal
              </button>
              <button
                onClick={() => onActiveViewChange("raw")}
                className={cn(
                  "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                  activeView === "raw"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-white"
                )}
              >
                Raw JSON
              </button>
            </div>

            <button
              onClick={onClear}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-base"
            >
              Clean
            </button>
          </div>

          {/* Raw JSON Content */}
          <pre className="overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px] overflow-y-auto text-gray-300">
            {JSON.stringify(data.metadata.raw, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Tree View with border - Buttons INSIDE */}
      <div className="border border-gray-800 rounded-2xl bg-black p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Tabs + Clean Button - INSIDE the border */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => onActiveViewChange("all")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "all"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              All
            </button>
            <button
              onClick={() => onActiveViewChange("location")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "location"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              Location
            </button>
            <button
              onClick={() => onActiveViewChange("identity")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "identity"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              Identity
            </button>
            <button
              onClick={() => onActiveViewChange("technical")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "technical"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              Technical
            </button>
            <button
              onClick={() => onActiveViewChange("temporal")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "temporal"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              Temporal
            </button>
            <button
              onClick={() => onActiveViewChange("raw")}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors font-medium text-base",
                activeView === "raw"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:text-white"
              )}
            >
              Raw JSON
            </button>
          </div>

          <button
            onClick={onClear}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-base"
          >
            Clean
          </button>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex gap-4 text-sm mb-4">
          <button
            onClick={expandAll}
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            Collapse All
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No metadata found in this category</p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center gap-3 w-full text-left group"
              >
                {expandedCategories.has(category.name) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className={cn("font-mono font-bold", category.color)}>
                  {category.icon} {category.name}
                </span>
              </button>

              {/* Category Fields */}
              {expandedCategories.has(category.name) && (
                <div className="ml-7 space-y-1 font-mono text-sm">
                  {category.fields.map((item, index) => (
                    <div key={index} className="text-gray-300">
                      <span className="text-gray-500">{item.field}:</span>{" "}
                      <span className="text-white">{formatValue(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
