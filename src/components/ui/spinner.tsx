import * as React from "react";
import { cn } from "~/lib/utils";

interface SpinnerProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "muted";
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantClasses = {
  default: "border-t-2 border-b-2 border-primary",
  primary: "border-t-2 border-b-2 border-primary",
  secondary: "border-t-2 border-b-2 border-secondary",
  muted: "border-t-2 border-b-2 border-muted-foreground",
};

export const Spinner = ({
  className,
  size = "md",
  variant = "primary",
  label = "Loading...",
  ...props
}: SpinnerProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-label={label}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-transparent",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
