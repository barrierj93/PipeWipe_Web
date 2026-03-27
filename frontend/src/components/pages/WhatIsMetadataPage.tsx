"use client";

/**
 * What is Metadata Page
 */

import React from "react";
import { AlertTriangle, Eye, MapPin, Camera } from "lucide-react";

export function WhatIsMetadataPage(): JSX.Element {
  return (
    <div className="w-full pt-[30px]">
      <div className="grid grid-cols-2 gap-32 px-16">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Section 1: What is Metadata? */}
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">What is Metadata?</h2>
            
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                Metadata is <span className="text-white font-semibold">information about information</span>. 
                Think of it as the "invisible ink" on your digital files. Every photo, video, document, or audio 
                file you create carries hidden data that tells a story beyond what you see or hear.
              </p>

              <p>
                When you take a photo with your smartphone, the image itself is just part of what gets saved. 
                The file also stores:
              </p>

              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <span><span className="text-white font-semibold">Camera settings:</span> ISO, aperture, shutter speed, focal length</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <span><span className="text-white font-semibold">GPS coordinates:</span> Exact location where the photo was taken</span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span><span className="text-white font-semibold">Device information:</span> Phone model, operating system, software version</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <span><span className="text-white font-semibold">Timestamps:</span> When the file was created, modified, or accessed</span>
                </li>
              </ul>

              <p>
                The same applies to documents, videos, and audio files. A Word document might reveal the 
                author's name, company, editing history, and even previous versions of deleted text. 
                A PDF could expose the software used to create it and the network printer it was sent to.
              </p>

              <p className="text-white font-semibold">
                This data is useful for organizing and managing files, but it can also expose sensitive 
                information you never intended to share.
              </p>
            </div>
          </section>

          {/* What You Risk Exposing - Red Box */}
          <div className="bg-red-950 border border-red-800 rounded-xl p-6 space-y-3">
            <h3 className="text-xl font-bold text-white">What You Risk Exposing:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
              <div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Your home address</li>
                  <li>• Your workplace</li>
                  <li>• Your daily routes</li>
                  <li>• Your device model</li>
                </ul>
              </div>
              <div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Your full name</li>
                  <li>• Your company name</li>
                  <li>• Edit history & versions</li>
                  <li>• Network information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Section 2: Why Does This Matter? */}
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">Why Does This Matter?</h2>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              {/* Blue Block containing three sections */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
                {/* Location Tracking */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Location Tracking
                  </h3>
                  <p>
                    Every photo you share online might reveal exactly where you live, work, or spend time. 
                    Stalkers and criminals have used photo metadata to track victims' movements and routines. 
                    Something as innocent as posting vacation photos can tell burglars when your home is empty.
                  </p>
                </div>

                {/* Real Case: John McAfee */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Real Case: John McAfee (2012)</h3>
                      <p className="text-gray-300">
                        Tech entrepreneur John McAfee was hiding from authorities in Guatemala when Vice 
                        magazine published an interview with him. The photo included GPS metadata revealing 
                        his exact location. Authorities found him within days, leading to his arrest and deportation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corporate & Government Leaks */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Corporate & Government Leaks
                  </h3>
                  <p>
                    Documents shared publicly have exposed confidential information through metadata. 
                    Company names in document properties, editing timestamps revealing work schedules, 
                    or network printer names exposing internal infrastructure.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    In 2007, a leaked Afghanistan strategy document contained metadata showing it had been 
                    edited by someone with top-secret clearance, compromising the identity of intelligence personnel.
                  </p>
                </div>
              </div>

              {/* Personal Safety Risks */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
                <h3 className="text-xl font-bold text-white">Personal Safety Risks</h3>
                <ul className="space-y-1 ml-4 text-sm">
                  <li>• <span className="text-white">Home address exposure:</span> Photos of your house or car can reveal where you live</li>
                  <li>• <span className="text-white">Identity theft:</span> Author names and email addresses in documents can be used for phishing</li>
                  <li>• <span className="text-white">Pattern analysis:</span> Timestamps reveal your daily routines and when you're most active</li>
                  <li>• <span className="text-white">Device fingerprinting:</span> Unique device IDs can be used to track you across the internet</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}