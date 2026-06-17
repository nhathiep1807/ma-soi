import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30",
      secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
      danger: "bg-danger hover:bg-red-600 text-white",
      ghost: "bg-transparent hover:bg-white/10 text-white/80",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm rounded-xl",
      md: "px-5 py-3 text-base rounded-2xl",
      lg: "px-6 py-4 text-lg rounded-2xl font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
