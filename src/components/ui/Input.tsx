import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-base",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
