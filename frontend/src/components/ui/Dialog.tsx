/**
 * Dialog Component - Modal dialogs and confirmations
 */

import React, { useEffect, useRef } from "react";
import { cn } from "@/utils/classnames";
import { X } from "lucide-react";
import { Button } from "./Button";

// ============================================================================
// DIALOG TYPES
// ============================================================================

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

// ============================================================================
// DIALOG ROOT
// ============================================================================

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return <>{children}</>;
};

Dialog.displayName = "Dialog";

// ============================================================================
// DIALOG OVERLAY
// ============================================================================

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        "data-[state=open]:animate-fade-in",
        className
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

// ============================================================================
// DIALOG CONTENT
// ============================================================================

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      className,
      size = "md",
      showCloseButton = true,
      closeOnOutsideClick = true,
      children,
      ...props
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-full mx-4",
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
      if (closeOnOutsideClick && contentRef.current && !contentRef.current.contains(e.target as Node)) {
        const dialog = contentRef.current.closest('[role="dialog"]');
        if (dialog) {
          const event = new CustomEvent("close");
          dialog.dispatchEvent(event);
        }
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <DialogOverlay />
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full rounded-lg border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-slide-in-bottom",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && <DialogClose />}
        </div>
      </div>
    );
  }
);

DialogContent.displayName = "DialogContent";

// ============================================================================
// DIALOG CLOSE BUTTON
// ============================================================================

export const DialogClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity",
        "hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

DialogClose.displayName = "DialogClose";

// ============================================================================
// DIALOG HEADER
// ============================================================================

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
};

DialogHeader.displayName = "DialogHeader";

// ============================================================================
// DIALOG TITLE
// ============================================================================

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

DialogTitle.displayName = "DialogTitle";

// ============================================================================
// DIALOG DESCRIPTION
// ============================================================================

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

DialogDescription.displayName = "DialogDescription";

// ============================================================================
// DIALOG FOOTER
// ============================================================================

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

DialogFooter.displayName = "DialogFooter";

// ============================================================================
// CONFIRMATION DIALOG (Pre-built variant)
// ============================================================================

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) => {
  const handleConfirm = (): void => {
    onConfirm();
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ConfirmDialog.displayName = "ConfirmDialog";

export default Dialog;
