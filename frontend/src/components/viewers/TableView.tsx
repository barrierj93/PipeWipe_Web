/**
 * TableView - Display metadata in table format
 */

"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/classnames";
import type { CategorizedMetadata } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface TableViewProps {
  metadata: CategorizedMetadata;
  className?: string;
}

interface MetadataRow {
  field: string;
  value: any;
  category: "critical" | "high" | "medium" | "low";
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TableView({ metadata, className }: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Flatten metadata into rows
  const rows = useMemo(() => {
    const allRows: MetadataRow[] = [];

    // Add critical (LOCATION)
    metadata.critical.forEach((field) => {
      allRows.push({
        field: field.field,
        value: field.value,
        category: "critical",
      });
    });

    // Add high (IDENTITY)
    metadata.high.forEach((field) => {
      allRows.push({
        field: field.field,
        value: field.value,
        category: "high",
      });
    });

    // Add medium (DEVICE)
    metadata.medium.forEach((field) => {
      allRows.push({
        field: field.field,
        value: field.value,
        category: "medium",
      });
    });

    // Add low (TEMPORAL)
    metadata.low.forEach((field) => {
      allRows.push({
        field: field.field,
        value: field.value,
        category: "low",
      });
    });

    return allRows;
  }, [metadata]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (row) =>
        row.field.toLowerCase().includes(term) ||
        String(row.value).toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  // Toggle row expansion
  const toggleRow = (field: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedRows(newExpanded);
  };

  // Copy field value
  const copyToClipboard = async (field: string, value: any) => {
    const textToCopy = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    await navigator.clipboard.writeText(textToCopy);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Get badge color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "critical":
        return "bg-red-500 text-white border-red-500";
      case "high":
        return "bg-orange-500 text-white border-orange-500";
      case "medium":
        return "bg-yellow-500 text-black border-yellow-500";
      case "low":
        return "bg-blue-500 text-white border-blue-500";
      default:
        return "bg-gray-500 text-white border-gray-500";
    }
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    
    // Handle ExifDateTime objects
    if (typeof value === "object" && value._ctor === "ExifDateTime") {
      const date = new Date(value.year, value.month - 1, value.day, value.hour, value.minute, value.second);
      return date.toLocaleString();
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      if (value.length === 1) return String(value[0]);
      return `[${value.length} items]`;
    }
    
    // Handle objects
    if (typeof value === "object") {
      // Count keys
      const keys = Object.keys(value);
      if (keys.length === 0) return "{}";
      return `{${keys.length} properties}`;
    }
    
    // Handle long strings (file paths, etc)
    const stringValue = String(value);
    
    // Shorten file paths
    if (stringValue.includes("\\") || stringValue.includes("/")) {
      const parts = stringValue.split(/[\\/]/);
      if (parts.length > 3) {
        return `.../${parts.slice(-2).join("/")}`;
      }
    }
    
    // Truncate very long strings
    if (stringValue.length > 60) {
      return stringValue.substring(0, 57) + "...";
    }
    
    return stringValue;
  };

  // Check if value is complex (object/array)
  const isComplex = (value: any): boolean => {
    return typeof value === "object" && value !== null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search metadata fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>
          Showing {filteredRows.length} of {rows.length} fields
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-400 w-8"></th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-400">Field</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-400">Value</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-400 w-32">Category</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No metadata fields found
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const isExpanded = expandedRows.has(row.field);
                  const complex = isComplex(row.value);

                  return (
                    <tr
                      key={`${row.field}-${index}`}
                      className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Expand Icon */}
                      <td className="py-3 px-4">
                        {complex && (
                          <button
                            onClick={() => toggleRow(row.field)}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>

                      {/* Field Name */}
                      <td className="py-3 px-4">
                        <code className="text-sm font-mono text-blue-400">{row.field}</code>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4">
                        {complex && isExpanded ? (
                          <div className="space-y-1">
                            {/* Show object properties in a readable way */}
                            {typeof row.value === "object" && !Array.isArray(row.value) ? (
                              <div className="text-sm space-y-1">
                                {Object.entries(row.value).map(([key, val]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="text-blue-400 font-mono">{key}:</span>
                                    <span className="text-gray-300">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className="text-sm font-mono text-gray-300 bg-gray-900 p-2 rounded overflow-x-auto max-w-md">
                                {JSON.stringify(row.value, null, 2)}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-300 break-all">
                            {formatValue(row.value)}
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${getCategoryColor(row.category)}`}>
                          {row.category.toLowerCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(row.field, row.value)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedField === row.field ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
