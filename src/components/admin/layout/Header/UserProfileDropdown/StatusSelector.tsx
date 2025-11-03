"use client"

import { memo, useState, useCallback } from "react"
import { ChevronDown } from "lucide-react"
import { useUserStatus } from "@/hooks/useUserStatus"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Popover, PopoverTrigger, PopoverContent, usePopover } from "@/components/ui/popover"

interface StatusSelectorProps {
  className?: string
}

type UserStatusType = "online" | "away" | "busy"

interface StatusOption {
  value: UserStatusType
  label: string
  color: string
  bgColor: string
  description: string
}

const statusOptions: StatusOption[] = [
  {
    value: "online",
    label: "Online",
    color: "bg-green-500",
    bgColor: "hover:bg-green-500/10",
    description: "Available for conversations"
  },
  {
    value: "away",
    label: "Away",
    color: "bg-amber-400",
    bgColor: "hover:bg-amber-400/10",
    description: "Will reply when back"
  },
  {
    value: "busy",
    label: "Busy",
    color: "bg-red-500",
    bgColor: "hover:bg-red-500/10",
    description: "Do not disturb"
  }
]

export const StatusSelector = memo(function StatusSelector({
  className
}: StatusSelectorProps) {
  const { status, setStatus } = useUserStatus()
  const [open, setOpen] = useState(false)

  const currentStatus = statusOptions.find((s) => s.value === status)

  const handleStatusChange = useCallback(
    (newStatus: UserStatusType) => {
      try {
        // Update status (synchronous function)
        // The useUserStatus hook handles showing the toast internally
        setStatus(newStatus)

        // Close popover after status change
        setOpen(false)
      } catch (error) {
        console.error("Status change error:", error)
        toast.error("Failed to change status", {
          description: "Please try again or contact support if the issue persists."
        })
      }
    },
    [setStatus]
  )

  return (
    <div
      className={cn("flex items-center justify-between px-2 py-2", className)}
      data-testid="status-selector"
    >
      <span className="text-sm font-medium text-muted-foreground">Status</span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-testid="status-trigger"
            aria-label={`Current status: ${status}. Click to change.`}
            aria-haspopup="menu"
            aria-expanded={open}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
              "hover:bg-accent transition-colors",
              open && "bg-accent",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background"
            )}
          >
            <span
              className={cn("h-2 w-2 rounded-full", currentStatus?.color)}
              data-testid="status-indicator-dot"
            />
            <span className="capitalize" data-testid="status-label">
              {status}
            </span>
            <ChevronDown className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )} />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-40 p-1">
          <div role="menu" aria-label="Status options" data-testid="status-popover">
            {statusOptions.map((option) => {
              const isSelected = status === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleStatusChange(option.value)}
                  data-testid={`status-option-${option.value}`}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md",
                    "hover:bg-accent transition-colors text-left",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring",
                    isSelected && "bg-accent"
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", option.color)}
                    data-testid={`status-dot-${option.value}`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      data-testid="status-checkmark"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

StatusSelector.displayName = "StatusSelector"
