import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  const isVertical = orientation === "vertical"
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        isVertical ? "w-px h-full" : "h-px w-full",
        "bg-border",
        className
      )}
      {...props}
    />
  )
}
