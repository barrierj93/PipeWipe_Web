/**
 * RawView - Display raw JSON metadata
 */

"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/classnames";

// ============================================================================
// TYPES
// ============================================================================

interface RawViewProps {
  data: any;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RawView({ data, className }: RawViewProps) {
  const [copied, setCopied] = useState(false);

  // Format JSON
  const formattedJson = JSON.stringify(data, null, 2);

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as JSON file
  const downloadJson = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metadata-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {formattedJson.split("\n").length} lines • {(formattedJson.length / 1024).toFixed(1)} KB
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadJson}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* JSON Display */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto bg-gray-950 text-sm font-mono leading-relaxed max-h-[600px] overflow-y-auto">
          <code className="text-gray-300">{formattedJson}</code>
        </pre>
      </div>

      {/* Syntax Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/40"></div>
          <span>Keys</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40"></div>
          <span>Strings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/40"></div>
          <span>Numbers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40"></div>
          <span>Booleans</span>
        </div>
      </div>
    </div>
  );
}
