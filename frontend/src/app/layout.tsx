/**
 * Root Layout - Next.js App Router layout
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "PipeWipe Professional - Metadata Analysis & Privacy Tool",
  description:
    "The most comprehensive and advanced tool for file metadata extraction, analysis, and privacy risk assessment.",
  keywords: [
    "metadata",
    "privacy",
    "EXIF",
    "GPS",
    "file analysis",
    "data security",
    "metadata removal",
  ],
  authors: [{ name: "PipeWipe Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "PipeWipe Professional",
    description: "Advanced metadata analysis and privacy tool",
    siteName: "PipeWipe Professional",
  },
  twitter: {
    card: "summary_large_image",
    title: "PipeWipe Professional",
    description: "Advanced metadata analysis and privacy tool",
  },
};

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {/* Main Content */}
        {children}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
