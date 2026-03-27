/**
 * Checkbox & Switch Components - Selection controls
 */

import React from "react";
import { cn } from "@/utils/classnames";
import { Check, Minus } from "lucide-react";

// ============================================================================
// CHECKBOX TYPES
// ============================================================================

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      indeterminate = false,
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${React.useId()}`;
    const hasError = !!error;

    // Handle indeterminate state
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              disabled={disabled}
              checked={checked}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${checkboxId}-error` : undefined}
              {...props}
            />
            <div
              className={cn(
                "h-5 w-5 rounded border-2 transition-all duration-200",
                "flex items-center justify-center",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                checked || indeterminate
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-input bg-background",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer",
                hasError && "border-destructive",
                className
              )}
            >
              {indeterminate ? (
                <Minus className="h-3 w-3" />
              ) : checked ? (
                <Check className="h-3 w-3" />
              ) : null}
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    "text-sm font-medium leading-none",
                    disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  )}
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p id={`${checkboxId}-error`} className="text-sm text-destructive ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

// ============================================================================
// SWITCH TYPES
// ============================================================================

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
      description,
      disabled,
      checked,
      onChange,
      onCheckedChange,
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || `switch-${React.useId()}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex items-start gap-3">
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            disabled={disabled}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              checked ? "bg-primary" : "bg-input",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer",
              className
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                checked && "translate-x-5"
              )}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  "text-sm font-medium leading-none",
                  disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

// ============================================================================
// CHECKBOX GROUP (for multiple selections)
// ============================================================================

export interface CheckboxGroupProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  label?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  onValueChange,
  options,
  label,
  orientation = "vertical",
  className,
}) => {
  const handleChange = (optionValue: string, checked: boolean): void => {
    if (checked) {
      onValueChange([...value, optionValue]);
    } else {
      onValueChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            disabled={option.disabled}
            onChange={(e) => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>
    </div>
  );
};

CheckboxGroup.displayName = "CheckboxGroup";

// ============================================================================
// RADIO GROUP (Alternative to checkboxes for single selection)
// ============================================================================

export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  label?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  options,
  label,
  orientation = "vertical",
  className,
}) => {
  const groupName = React.useId();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
        role="radiogroup"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-2">
            <input
              type="radio"
              id={`${groupName}-${option.value}`}
              name={groupName}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={(e) => onValueChange(e.target.value)}
              className="peer sr-only"
            />
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-all duration-200",
                "flex items-center justify-center",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                value === option.value
                  ? "border-primary"
                  : "border-input",
                option.disabled && "opacity-50 cursor-not-allowed",
                !option.disabled && "cursor-pointer"
              )}
            >
              {value === option.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor={`${groupName}-${option.value}`}
                className={cn(
                  "text-sm font-medium leading-none",
                  option.disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-muted-foreground">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RadioGroup.displayName = "RadioGroup";

export default Checkbox;
