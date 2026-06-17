import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-card-border backdrop-blur-sm p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
