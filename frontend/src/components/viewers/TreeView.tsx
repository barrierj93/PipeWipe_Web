/**
 * TreeView - Display metadata in hierarchical tree format
 */

"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/classnames";
import type { CategorizedMetadata } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface TreeViewProps {
  metadata: CategorizedMetadata;
  className?: string;
}

interface TreeNode {
  key: string;
  value: any;
  category: "critical" | "high" | "medium" | "low";
  children?: TreeNode[];
  isLeaf: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TreeView({ metadata, className }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [copiedNode, setCopiedNode] = useState<string | null>(null);

  // Build tree structure
  const tree = useMemo(() => {
    const buildTree = (): TreeNode[] => {
      const categories: TreeNode[] = [];

      // Critical (LOCATION)
      if (metadata.critical.length > 0) {
        categories.push({
          key: "LOCATION",
          value: `${metadata.critical.length} fields`,
          category: "critical",
          isLeaf: false,
          children: metadata.critical.map((field) => ({
            key: field.field,
            value: field.value,
            category: "critical" as const,
            isLeaf: typeof field.value !== "object" || field.value === null,
            children:
              typeof field.value === "object" && field.value !== null
                ? Object.entries(field.value).map(([k, v]) => ({
                    key: k,
                    value: v,
                    category: "critical" as const,
                    isLeaf: true,
                  }))
                : undefined,
          })),
        });
      }

      // High (IDENTITY)
      if (metadata.high.length > 0) {
        categories.push({
          key: "IDENTITY",
          value: `${metadata.high.length} fields`,
          category: "high",
          isLeaf: false,
          children: metadata.high.map((field) => ({
            key: field.field,
            value: field.value,
            category: "high" as const,
            isLeaf: typeof field.value !== "object" || field.value === null,
            children:
              typeof field.value === "object" && field.value !== null
                ? Object.entries(field.value).map(([k, v]) => ({
                    key: k,
                    value: v,
                    category: "high" as const,
                    isLeaf: true,
                  }))
                : undefined,
          })),
        });
      }

      // Medium (DEVICE)
      if (metadata.medium.length > 0) {
        categories.push({
          key: "DEVICE",
          value: `${metadata.medium.length} fields`,
          category: "medium",
          isLeaf: false,
          children: metadata.medium.map((field) => ({
            key: field.field,
            value: field.value,
            category: "medium" as const,
            isLeaf: typeof field.value !== "object" || field.value === null,
            children:
              typeof field.value === "object" && field.value !== null
                ? Object.entries(field.value).map(([k, v]) => ({
                    key: k,
                    value: v,
                    category: "medium" as const,
                    isLeaf: true,
                  }))
                : undefined,
          })),
        });
      }

      // Low (TEMPORAL)
      if (metadata.low.length > 0) {
        categories.push({
          key: "TEMPORAL",
          value: `${metadata.low.length} fields`,
          category: "low",
          isLeaf: false,
          children: metadata.low.map((field) => ({
            key: field.field,
            value: field.value,
            category: "low" as const,
            isLeaf: typeof field.value !== "object" || field.value === null,
            children:
              typeof field.value === "object" && field.value !== null
                ? Object.entries(field.value).map(([k, v]) => ({
                    key: k,
                    value: v,
                    category: "low" as const,
                    isLeaf: true,
                  }))
                : undefined,
          })),
        });
      }

      return categories;
    };

    return buildTree();
  }, [metadata]);

  // Toggle node expansion
  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  // Copy node value
  const copyToClipboard = async (node: TreeNode) => {
    const textToCopy =
      typeof node.value === "object" ? JSON.stringify(node.value, null, 2) : String(node.value);
    await navigator.clipboard.writeText(textToCopy);
    setCopiedNode(node.key);
    setTimeout(() => setCopiedNode(null), 2000);
  };

  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    
    // Handle ExifDateTime objects
    if (typeof value === "object" && value._ctor === "ExifDateTime") {
      const date = new Date(value.year, value.month - 1, value.day, value.hour, value.minute, value.second);
      return `"${date.toLocaleString()}"`;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      if (value.length === 1) return `["${String(value[0])}"]`;
      return `[${value.length} items]`;
    }
    
    // Handle objects
    if (typeof value === "object") return "{...}";
    
    // Handle strings
    if (typeof value === "string") {
      // Shorten file paths
      if (value.includes("\\") || value.includes("/")) {
        const parts = value.split(/[\\/]/);
        if (parts.length > 3) {
          return `".../${parts.slice(-2).join("/")}"`;
        }
      }
      
      // Truncate long strings
      if (value.length > 50) {
        return `"${value.substring(0, 47)}..."`;
      }
      
      return `"${value}"`;
    }
    
    return String(value);
  };

  // Render tree node
  const renderNode = (node: TreeNode, path: string, depth: number = 0) => {
    const isExpanded = expandedNodes.has(path);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={path} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-800/50 transition-colors group",
            depth > 0 && "ml-6"
          )}
        >
          {/* Expand/Collapse Icon */}
          <button
            onClick={() => hasChildren && toggleNode(path)}
            className={cn(
              "flex-shrink-0 w-4 h-4 flex items-center justify-center",
              !hasChildren && "invisible"
            )}
          >
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ))}
          </button>

          {/* Key */}
          <span className={cn("font-mono text-sm", getCategoryColor(node.category))}>
            {node.key}
          </span>

          {/* Separator */}
          <span className="text-gray-600">:</span>

          {/* Value */}
          {node.isLeaf && (
            <span className="text-sm text-gray-300 flex-1 truncate">{formatValue(node.value)}</span>
          )}

          {/* Category Badge (only for top-level) */}
          {depth === 0 && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                node.category === "critical" && "bg-red-500 text-white border border-red-500",
                node.category === "high" && "bg-orange-500 text-white border border-orange-500",
                node.category === "medium" && "bg-yellow-500 text-black border border-yellow-500",
                node.category === "low" && "bg-blue-500 text-white border border-blue-500"
              )}
            >
              {node.category.toLowerCase()}
            </span>
          )}

          {/* Copy Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(node)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copiedNode === node.key ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-800 ml-2">
            {node.children!.map((child, index) =>
              renderNode(child, `${path}.${child.key}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{tree.length} categories</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const allPaths = new Set<string>();
              const collectPaths = (nodes: TreeNode[], parentPath = "") => {
                nodes.forEach((node) => {
                  const path = parentPath ? `${parentPath}.${node.key}` : node.key;
                  allPaths.add(path);
                  if (node.children) {
                    collectPaths(node.children, path);
                  }
                });
              };
              collectPaths(tree);
              setExpandedNodes(allPaths);
            }}
          >
            Expand All
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpandedNodes(new Set())}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="border border-gray-800 rounded-lg p-4 bg-gray-950 overflow-x-auto">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No metadata found</div>
        ) : (
          <div className="font-mono text-sm space-y-1">
            {tree.map((node) => renderNode(node, node.key, 0))}
          </div>
        )}
      </div>
    </div>
  );
}
