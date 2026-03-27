"use client";

/**
 * Main Page - PipeWipe single-page layout (FINAL CORRECTED)
 */

import React, { useState } from "react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { MetadataViewer } from "@/components/viewers/MetadataViewer";
import { RemovalDialog } from "@/components/removal/RemovalDialog";
import { WhatIsMetadataPage } from "@/components/pages/WhatIsMetadataPage";
import { AboutUsPage } from "@/components/pages/AboutUsPage";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useRemoval } from "@/hooks/useRemoval";
import { Github, FileText, Linkedin } from "lucide-react";
import { cn } from "@/utils/classnames";
import type { ProcessedFile } from "@/types";

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [activeView, setActiveView] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<"home" | "metadata" | "about">("home");
  const [showRemovalDialog, setShowRemovalDialog] = useState<boolean>(false);

  // File upload hook
  const {
    isUploading,
    uploadFile,
    uploadFiles,
  } = useFileUpload({
    autoExtract: true,
    onSuccess: (file) => {
      console.log("File uploaded successfully:", file);
      setSelectedFile(file);
    },
  });

  // Removal hook
  const { isRemoving, removeMetadata } = useRemoval({
    onSuccess: (filename) => {
      console.log("Removal successful, downloaded:", filename);
      setShowRemovalDialog(false);
    },
    onError: (error) => {
      console.error("Removal failed:", error);
      alert(`Failed to remove metadata: ${error.message}`);
    },
    autoDownload: true,
  });

  const handleFilesSelected = async (selectedFiles: File[]): Promise<void> => {
    if (selectedFiles.length === 1) {
      await uploadFile(selectedFiles[0]);
    } else {
      await uploadFiles(selectedFiles);
    }
  };

  const handleCleanClick = () => {
    if (selectedFile && selectedFile.extractionResult) {
      console.log("Opening removal dialog for file:", selectedFile);
      setShowRemovalDialog(true);
    }
  };

  // Get fileId from selectedFile
  const fileId = selectedFile?.extractionResult?.fileId || "";

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 py-6">
        <div className="px-8 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => setCurrentPage("home")} className="text-left">
            <h1 className="text-2xl font-bold">PipeWipe</h1>
            <p className="text-sm text-gray-400">Metadata Handling</p>
          </button>

          {/* Navigation */}
          <nav className="flex gap-8">
            <button
              onClick={() => setCurrentPage("metadata")}
              className={cn(
                "transition-colors",
                currentPage === "metadata" ? "text-white" : "text-gray-300 hover:text-white"
              )}
            >
              What is Metadata?
            </button>
            <button
              onClick={() => setCurrentPage("about")}
              className={cn(
                "transition-colors",
                currentPage === "about" ? "text-white" : "text-gray-300 hover:text-white"
              )}
            >
              About Us
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-64 pt-[94px] pb-16">
        {/* Home Page - Upload Interface */}
        {currentPage === "home" && (
          <>
            {/* Row 1: Title only */}
            <div className="mb-6">
              <h2 className="text-6xl font-bold whitespace-nowrap leading-none">
                Privacy <span className="text-gray-400">is</span> KING.
              </h2>
            </div>

            {/* Row 2: Dropzone (left) + Metadata Viewer (right) */}
            <div className="flex gap-8 items-start">
              {/* Left: Dropzone - Fixed width to match title */}
              <div className="w-[560px]">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 bg-black">
                  <FileDropzone
                    onFilesSelected={handleFilesSelected}
                    disabled={isUploading}
                  />

                  {/* Supported Formats */}
                  <div className="mt-6 text-xs text-gray-500 space-y-1 text-center">
                    <div>
                      <span className="text-gray-400">Images:</span> JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, HEIF
                    </div>
                    <div>
                      <span className="text-gray-400">Videos:</span> MP4, MOV, AVI, MKV, WebM, FLV, WMV
                    </div>
                    <div>
                      <span className="text-gray-400">Audio:</span> MP3, WAV, FLAC, AAC, OGG, M4A
                    </div>
                    <div>
                      <span className="text-gray-400">Documents:</span> PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                    </div>
                    <div>
                      <span className="text-gray-400">Archives:</span> ZIP, RAR
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Metadata Viewer */}
              <div className="flex-1">
                {selectedFile && selectedFile.extractionResult ? (
                  <MetadataViewer
                    data={selectedFile.extractionResult}
                    activeView={activeView}
                    onActiveViewChange={setActiveView}
                    onClear={handleCleanClick}
                  />
                ) : (
                  <div className="border border-gray-800 rounded-2xl p-12 text-center text-gray-500 bg-black">
                    <p>Upload a file to see its metadata</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* What is Metadata Page */}
        {currentPage === "metadata" && <WhatIsMetadataPage />}

        {/* About Us Page */}
        {currentPage === "about" && <AboutUsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="px-64">
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/barrierj93/PipeWipe/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://medium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>

      {/* Removal Dialog */}
      {selectedFile && selectedFile.extractionResult && fileId && (
        <RemovalDialog
          isOpen={showRemovalDialog}
          onClose={() => setShowRemovalDialog(false)}
          fileId={fileId}
          originalFilename={selectedFile.file.name}
          data={selectedFile.extractionResult}
          onRemove={removeMetadata}
          isRemoving={isRemoving}
        />
      )}
    </div>
  );
}