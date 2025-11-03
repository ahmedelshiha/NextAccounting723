"use client"

import { memo, useState, useCallback } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ThemeSelectorProps {
  className?: string
  showLabels?: boolean
}

type ThemeOption = "light" | "dark" | "system"

const themes: Array<{
  value: ThemeOption
  icon: typeof Sun
  label: string
  srLabel: string
}> = [
  {
    value: "light",
    icon: Sun,
    label: "Light",
    srLabel: "Switch to light theme"
  },
  {
    value: "dark",
    icon: Moon,
    label: "Dark",
    srLabel: "Switch to dark theme"
  },
  {
    value: "system",
    icon: Monitor,
    label: "System",
    srLabel: "Follow system theme preference"
  }
]

export const ThemeSelector = memo(function ThemeSelector({
  className,
  showLabels = false
}: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const [isChanging, setIsChanging] = useState(false)
  const [previousTheme, setPreviousTheme] = useState(theme)

  const handleThemeChange = useCallback(
    async (newTheme: ThemeOption) => {
      try {
        setIsChanging(true)
        setPreviousTheme(theme)

        // Apply theme change
        setTheme(newTheme)

        // Verify theme actually changed (brief delay for state update)
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Show success feedback
        const themeName =
          newTheme === "system" ? "system preference" : newTheme
        toast.success(`Theme changed to ${themeName}`, {
          description: `Your interface is now using ${themeName} theme.`
        })
      } catch (error) {
        console.error("Theme change error:", error)
        toast.error("Failed to change theme", {
          description: "Please try again or contact support if the issue persists."
        })

        // Revert to previous theme on error
        if (previousTheme) {
          setTheme(previousTheme)
        }
      } finally {
        setIsChanging(false)
      }
    },
    [theme, setTheme, previousTheme]
  )

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-2 transition-opacity duration-200",
        isChanging && "animate-theme-change",
        className
      )}
      data-testid="theme-selector"
    >
      <span className="text-sm font-medium text-muted-foreground">Theme</span>
      <div
        className="inline-flex rounded-lg bg-muted p-1 gap-1"
        role="radiogroup"
        aria-label="Select theme"
        data-testid="theme-radiogroup"
      >
        {themes.map(({ value, icon: Icon, label, srLabel }) => {
          const isActive = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={srLabel}
              data-testid={`theme-option-${value}`}
              disabled={isChanging}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-3 py-1.5",
                "text-sm font-medium transition-all duration-150 ease-in-out",
                "hover:bg-background/60 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleThemeChange(value)}
            >
              <Icon className="h-4 w-4" />
              {showLabels && <span className="ml-2 text-xs">{label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
})

ThemeSelector.displayName = "ThemeSelector"
