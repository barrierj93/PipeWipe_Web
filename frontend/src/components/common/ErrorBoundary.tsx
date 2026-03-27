/**
 * ErrorBoundary Component - Catch and display React errors
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card";

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // In production, you might want to send to error reporting service
    // Example: Sentry.captureException(error);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription>
                    An unexpected error occurred in the application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="font-mono text-sm text-destructive">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {this.props.showDetails && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View error details
                  </summary>
                  <div className="mt-3 p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-auto max-h-64">
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}

              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">
                  This error has been logged. If the problem persists, please try refreshing
                  the page or contact support.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button onClick={this.handleReset} icon={RefreshCw} variant="primary">
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} icon={Home} variant="outline">
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// SIMPLE ERROR FALLBACK
// ============================================================================

interface SimpleErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const SimpleErrorFallback: React.FC<SimpleErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-4 p-4 rounded-full bg-destructive/10">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error?.message || "An unexpected error occurred"}
      </p>
      {resetError && (
        <Button onClick={resetError} icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
};

SimpleErrorFallback.displayName = "SimpleErrorFallback";

// ============================================================================
// HOOK FOR FUNCTIONAL ERROR BOUNDARIES
// ============================================================================

export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error>();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;
