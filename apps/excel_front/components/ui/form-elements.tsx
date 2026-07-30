"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <input
        className={cn(
          "w-full px-4 py-3 rounded-lg bg-[#2A2A2A] text-white",
          "border border-transparent transition-all duration-200",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  Bloading?: boolean;
  variant?: "primary" | "secondary";
}
//loading
export function ButtonB({
  children,
  className,
  Bloading,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "relative w-full px-4 py-3 rounded-lg font-medium",
        "transition-all duration-200 disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-primary to-accent text-white",
        variant === "secondary" && "bg-[#2A2A2A] text-white",
        "hover:opacity-90 active:scale-[0.98]",
        Bloading && "cursor-wait",
        className
      )}
      disabled={disabled || Bloading}
      {...props}
    >
      {Bloading && (
        <Loader2 className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-spin" />
      )}
      <span className={cn(Bloading && "invisible")}>{children}</span>
    </button>
  );
}