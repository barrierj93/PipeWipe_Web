/**
 * RemovalDialog - Modal for metadata removal configuration (FIXED)
 */

"use client";

import { useState } from "react";
import { X, Shield, Trash2, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/utils/classnames";
import type { ExtractionResponse } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface RemovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  originalFilename: string; // ← NUEVO: nombre del archivo original
  data: ExtractionResponse;
  onRemove: (fileId: string, originalFilename: string, options: RemovalOptions) => void; // ← ACTUALIZADO
  isRemoving?: boolean;
}

export interface RemovalOptions {
  mode: "preset" | "categories" | "all";
  preset?: string;
  categories?: string[];
  secureMode?: boolean;
}

interface RemovalPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  categories?: string[];
  removeAll?: boolean;
}

// ============================================================================
// PRESETS
// ============================================================================

const REMOVAL_PRESETS: RemovalPreset[] = [
  {
    id: "social-media",
    name: "Social Media",
    description: "Remove GPS and personal identity, keep dates and technical info",
    icon: <Shield className="w-5 h-5" />,
    categories: ["LOCATION", "IDENTITY"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Remove GPS, identity, and ALL technical info (software, devices, profiles)",
    icon: <Trash2 className="w-5 h-5" />,
    categories: ["LOCATION", "IDENTITY", "DEVICE"],
  },
  {
    id: "maximum-privacy",
    name: "Maximum Privacy",
    description: "Remove ALL metadata except color profiles needed for display",
    icon: <AlertTriangle className="w-5 h-5" />,
    removeAll: true,
  },
];

const CATEGORIES = [
  {
    id: "LOCATION",
    name: "Location Data",
    description: "GPS coordinates and location information",
    color: "text-red-500",
    count: 0,
  },
  {
    id: "IDENTITY",
    name: "Identity Data",
    description: "Names, copyright, and personal information",
    color: "text-orange-500",
    count: 0,
  },
  {
    id: "DEVICE",
    name: "Device Information",
    description: "Camera model, software, serial numbers",
    color: "text-blue-500",
    count: 0,
  },
  {
    id: "TEMPORAL",
    name: "Temporal Data",
    description: "Dates and timestamps",
    color: "text-yellow-500",
    count: 0,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function RemovalDialog({
  isOpen,
  onClose,
  fileId,
  originalFilename, // ← NUEVO
  data,
  onRemove,
  isRemoving = false,
}: RemovalDialogProps) {
  const [mode, setMode] = useState<"preset" | "categories" | "all">("preset");
  const [selectedPreset, setSelectedPreset] = useState<string>("social-media");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["LOCATION", "IDENTITY"]);
  const [secureMode, setSecureMode] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate category counts
  const categoryCounts = {
    LOCATION: data.metadata.categorized.critical?.length || 0,
    IDENTITY: data.metadata.categorized.high?.length || 0,
    DEVICE: data.metadata.categorized.medium?.length || 0,
    TEMPORAL: data.metadata.categorized.low?.length || 0,
  };

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Calculate removal preview
  const getRemovalPreview = () => {
    let fieldsToRemove = 0;

    if (mode === "all") {
      fieldsToRemove = data.metadata.total_fields;
    } else if (mode === "preset") {
      const preset = REMOVAL_PRESETS.find((p) => p.id === selectedPreset);
      if (preset?.removeAll) {
        fieldsToRemove = data.metadata.total_fields;
      } else if (preset?.categories) {
        preset.categories.forEach((cat) => {
          fieldsToRemove += categoryCounts[cat as keyof typeof categoryCounts] || 0;
        });
      }
    } else if (mode === "categories") {
      selectedCategories.forEach((cat) => {
        fieldsToRemove += categoryCounts[cat as keyof typeof categoryCounts] || 0;
      });
    }

    return {
      total: data.metadata.total_fields,
      removing: fieldsToRemove,
      remaining: data.metadata.total_fields - fieldsToRemove,
    };
  };

  const preview = getRemovalPreview();

  // Handle removal
  const handleRemove = () => {
    const options: RemovalOptions = {
      mode,
      secureMode,
    };

    if (mode === "preset") {
      options.preset = selectedPreset;
      const preset = REMOVAL_PRESETS.find((p) => p.id === selectedPreset);
      if (preset?.removeAll) {
        options.mode = "all";
      } else if (preset?.categories) {
        options.mode = "categories";
        options.categories = preset.categories;
      }
    } else if (mode === "categories") {
      options.categories = selectedCategories;
    }

    console.log("RemovalDialog: calling onRemove with fileId:", fileId, "filename:", originalFilename, "options:", options);
    onRemove(fileId, originalFilename, options); // ← ACTUALIZADO: ahora incluye originalFilename
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Clean Metadata</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isRemoving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Removal Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMode("preset")}
                className={cn(
                  "px-4 py-3 rounded-lg border transition-colors font-medium",
                  mode === "preset"
                    ? "border-white bg-gray-900 text-white"
                    : "border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
                )}
                disabled={isRemoving}
              >
                Presets
              </button>
              <button
                onClick={() => setMode("categories")}
                className={cn(
                  "px-4 py-3 rounded-lg border transition-colors font-medium",
                  mode === "categories"
                    ? "border-white bg-gray-900 text-white"
                    : "border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
                )}
                disabled={isRemoving}
              >
                Categories
              </button>
              <button
                onClick={() => setMode("all")}
                className={cn(
                  "px-4 py-3 rounded-lg border transition-colors font-medium",
                  mode === "all"
                    ? "border-white bg-gray-900 text-white"
                    : "border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-600"
                )}
                disabled={isRemoving}
              >
                Remove All
              </button>
            </div>
          </div>

          {/* Preset Selection */}
          {mode === "preset" && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Choose Preset</h3>
              <div className="space-y-2">
                {REMOVAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border transition-colors text-left",
                      selectedPreset === preset.id
                        ? "border-white bg-gray-900"
                        : "border-gray-700 bg-transparent hover:border-gray-600"
                    )}
                    disabled={isRemoving}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-white">{preset.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{preset.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection */}
          {mode === "categories" && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Select Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => {
                  const count = categoryCounts[category.id as keyof typeof categoryCounts];
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border transition-colors text-left",
                        selectedCategories.includes(category.id)
                          ? "border-white bg-gray-900"
                          : "border-gray-700 bg-transparent hover:border-gray-600"
                      )}
                      disabled={isRemoving || count === 0}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={cn("font-semibold", category.color)}>{category.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">{count} fields</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remove All Warning */}
          {mode === "all" && (
            <div className="p-4 border border-red-500 rounded-lg bg-red-950 bg-opacity-20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-500">Warning: Complete Removal</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    This will remove ALL metadata from your file. Only file type and basic
                    dimensions will be preserved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Secure Mode Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Secure Mode</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Multi-pass overwriting for forensic-level deletion (slower)
                </p>
              </div>
              <button
                onClick={() => setSecureMode(!secureMode)}
                className={cn(
                  "w-14 h-8 rounded-full transition-colors relative",
                  secureMode ? "bg-white" : "bg-gray-700"
                )}
                disabled={isRemoving}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full bg-black absolute top-1 transition-transform",
                    secureMode ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Preview</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{preview.total}</div>
                <div className="text-xs text-gray-400 mt-1">Total Fields</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{preview.removing}</div>
                <div className="text-xs text-gray-400 mt-1">Will Remove</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{preview.remaining}</div>
                <div className="text-xs text-gray-400 mt-1">Will Keep</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors font-medium"
            disabled={isRemoving}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2",
              isRemoving
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            )}
            disabled={isRemoving || preview.removing === 0}
          >
            {isRemoving ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Clean & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}