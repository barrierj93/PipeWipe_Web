"use client";

/**
 * About Us Page
 */

import React from "react";
import { Shield, Trash2, Lock, Github, Zap, Eye } from "lucide-react";

export function AboutUsPage(): JSX.Element {
  return (
    <div className="w-full pt-[30px]">
      <div className="grid grid-cols-2 gap-32 px-16">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Main Introduction */}
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">About PipeWipe</h2>
            
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p className="text-xl text-white font-semibold">
                Your privacy is not negotiable. That's why we built PipeWipe.
              </p>

              <p>
                PipeWipe is a <span className="text-white font-semibold">professional-grade metadata removal tool</span> designed 
                to give you complete control over the information hidden in your files. Whether you're a journalist 
                protecting sources, a professional sharing sensitive documents, or someone who simply values their 
                privacy, PipeWipe ensures your files reveal only what you want them to.
              </p>

              <p>
                Born from the realization that most people have no idea how much they're exposing when they share 
                a simple photo or document, PipeWipe makes metadata removal fast, transparent, and accessible to everyone.
              </p>
            </div>
          </section>

          {/* What We Do */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white">What We Do</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Display Metadata</h3>
                <p className="text-gray-300">
                  See exactly what information is hidden in your files before you share them. We organize 
                  metadata into easy-to-understand categories so you know what you're exposing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Remove Metadata</h3>
                <p className="text-gray-300">
                  Strip unwanted metadata from your files with a single click. Fast, clean, and simple. 
                  Your file stays intact while all sensitive information disappears.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Secure Overwrite</h3>
                <p className="text-gray-300">
                  For maximum security, we don't just delete metadata—we overwrite it multiple times, 
                  making recovery virtually impossible. Perfect for sensitive or confidential files.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Batch Processing</h3>
                <p className="text-gray-300">
                  Need to clean multiple files? Upload up to 50 files at once and process them all 
                  simultaneously. Save time without compromising security.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Privacy Commitment */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-500" />
              Our Privacy Commitment
            </h2>

            <div className="bg-green-950 border border-green-800 rounded-xl p-8 space-y-6">
              <div className="space-y-4 text-gray-200 leading-relaxed">
                <p className="text-xl font-bold text-white">
                  We don't store, save, or keep any of your files. Ever.
                </p>

                <p>
                  When you upload a file to PipeWipe, it exists in our server's memory only for the few 
                  seconds it takes to analyze or clean it. The moment we send the cleaned file back to you, 
                  <span className="text-white font-semibold"> the original is permanently deleted from our system</span>.
                </p>

                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-white">Here's exactly what happens:</p>
                  <ul className="space-y-2 ml-4 text-sm">
                    <li>• Your file is uploaded via secure HTTPS connection</li>
                    <li>• It's processed in temporary memory (RAM), never written to disk</li>
                    <li>• Metadata is analyzed or removed based on your selection</li>
                    <li>• The cleaned file is sent directly back to your browser</li>
                    <li>• Both the original and cleaned versions are immediately deleted from memory</li>
                  </ul>
                </div>

                <p>
                  <span className="text-white font-semibold">No databases. No logs. No backups.</span> Your files 
                  never touch permanent storage on our servers. We can't access what we don't save, and we 
                  can't leak what we don't have.
                </p>

                <p className="text-sm text-gray-400 italic">
                  We believe privacy isn't just about removing metadata from your files—it's about ensuring 
                  your files never leave a trace on our infrastructure either.
                </p>
              </div>
            </div>
          </section>

          {/* Open Source */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Github className="w-8 h-8" />
                Open Source
              </h2>
              
              <a 
                href="https://github.com/barrierj93/PipeWipe/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="font-semibold">View on GitHub</span>
              </a>
            </div>

            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                PipeWipe started as an <span className="text-white font-semibold">open-source command-line tool</span>, 
                and transparency remains at our core. Our metadata extraction and removal logic is open for 
                anyone to inspect, audit, and improve.
              </p>

              <p>
                We built PipeWipe because privacy shouldn't be complicated. Everyone deserves to share 
                files without accidentally exposing their location, identity, or personal information.
              </p>

              <p className="text-gray-400 text-base">
                Check out the code, contribute improvements, or run your own instance. Privacy tools 
                should be verifiable, not black boxes.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}