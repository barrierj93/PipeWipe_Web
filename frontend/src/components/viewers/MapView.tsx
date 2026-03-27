/**
 * MapView - Display GPS coordinates and location data
 */

"use client";

import { MapPin, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/classnames";
import type { LocationAnalysis } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface MapViewProps {
  locationData: LocationAnalysis;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MapView({ locationData, className }: MapViewProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Extract coordinates
  const hasGPS = locationData.has_gps;
  const coordinates = locationData.coordinates;

  // Copy coordinates to clipboard
  const copyCoordinates = async () => {
    if (coordinates) {
      const coordsText = `${coordinates.latitude}, ${coordinates.longitude}`;
      await navigator.clipboard.writeText(coordsText);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    }
    return null;
  };

  // Generate OpenStreetMap URL
  const getOSMUrl = () => {
    if (coordinates) {
      return `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}&zoom=15`;
    }
    return null;
  };

  if (!hasGPS) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No GPS Data Found</h3>
          <p className="text-sm text-gray-500">
            This file does not contain GPS coordinates or location information.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Coordinates Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium text-white">GPS Coordinates Found</h3>
              <p className="text-sm text-gray-400">Location data is embedded in this file</p>
            </div>
          </div>
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">CRITICAL</Badge>
        </div>

        {/* Coordinates Display */}
        {coordinates && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Latitude</div>
                <div className="text-lg font-mono text-white">{coordinates.latitude}°</div>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Longitude</div>
                <div className="text-lg font-mono text-white">{coordinates.longitude}°</div>
              </div>
            </div>

            {coordinates.altitude && (
              <div className="p-3 bg-gray-900 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Altitude</div>
                <div className="text-lg font-mono text-white">{coordinates.altitude}m</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={copyCoordinates} className="flex-1">
                {copiedCoords ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Coordinates
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Map Links */}
      <Card className="p-6">
        <h3 className="font-medium text-white mb-4">View on Map</h3>
        <div className="space-y-2">
          <a
            href={getGoogleMapsUrl() || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Google Maps</div>
                <div className="text-xs text-gray-500">View in Google Maps</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>

          <a
            href={getOSMUrl() || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">OpenStreetMap</div>
                <div className="text-xs text-gray-500">View in OpenStreetMap</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </Card>

      {/* Additional Location Fields */}
      {locationData.location_fields.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium text-white mb-4">Location-Related Fields</h3>
          <div className="space-y-2">
            {locationData.location_fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-900 rounded text-sm"
              >
                <code className="text-blue-400">{field}</code>
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                  LOCATION
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Privacy Warning */}
      <Card className="p-6 bg-red-500/5 border-red-500/20">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-500 mb-1">Privacy Risk</h4>
            <p className="text-sm text-gray-400">
              GPS coordinates reveal your exact location. Consider removing this data before sharing
              the file publicly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
