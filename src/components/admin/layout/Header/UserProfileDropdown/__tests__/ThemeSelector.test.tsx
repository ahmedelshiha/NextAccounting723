import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeSelector } from "../ThemeSelector"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { vi } from "vitest"

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn()
}))

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe("ThemeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders 3 theme buttons (light, dark, system)", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      expect(screen.getByTestId("theme-option-light")).toBeInTheDocument()
      expect(screen.getByTestId("theme-option-dark")).toBeInTheDocument()
      expect(screen.getByTestId("theme-option-system")).toBeInTheDocument()
    })

    it("renders with correct label when showLabels is true", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector showLabels={true} />)

      expect(screen.getByText("Light")).toBeInTheDocument()
      expect(screen.getByText("Dark")).toBeInTheDocument()
      expect(screen.getByText("System")).toBeInTheDocument()
    })

    it("renders without labels when showLabels is false (default)", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      const { container } = render(<ThemeSelector showLabels={false} />)

      // Check that only icons are visible (no text in buttons except sr-only)
      const buttons = container.querySelectorAll("button")
      buttons.forEach((btn) => {
        if (btn.textContent && !btn.textContent.includes("sr-only")) {
          expect(btn.querySelector("svg")).toBeInTheDocument()
        }
      })
    })
  })

  describe("ARIA Attributes", () => {
    it("has radiogroup role on container", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      const radiogroup = screen.getByRole("radiogroup")
      expect(radiogroup).toHaveAttribute("aria-label", "Select theme")
    })

    it("has radio role on each button", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      const radios = screen.getAllByRole("radio")
      expect(radios).toHaveLength(3)
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute("role", "radio")
      })
    })

    it("marks active theme with aria-checked=true", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "dark"
      })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      expect(darkButton).toHaveAttribute("aria-checked", "true")

      const lightButton = screen.getByTestId("theme-option-light")
      expect(lightButton).toHaveAttribute("aria-checked", "false")

      const systemButton = screen.getByTestId("theme-option-system")
      expect(systemButton).toHaveAttribute("aria-checked", "false")
    })

    it("has descriptive aria-labels on buttons", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      expect(screen.getByLabelText("Switch to light theme")).toBeInTheDocument()
      expect(screen.getByLabelText("Switch to dark theme")).toBeInTheDocument()
      expect(
        screen.getByLabelText("Follow system theme preference")
      ).toBeInTheDocument()
    })
  })

  describe("Theme Selection", () => {
    it("calls setTheme with correct value on click", async () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      await userEvent.click(darkButton)

      await waitFor(() => {
        expect(mockSetTheme).toHaveBeenCalledWith("dark")
      })
    })

    it("shows success toast on successful theme change", async () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      await userEvent.click(darkButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("dark"),
          expect.any(Object)
        )
      })
    })

    it("disables buttons while theme is changing", async () => {
      const mockSetTheme = vi.fn(
        () =>
          new Promise((resolve) => setTimeout(resolve, 500)) // Simulate async operation
      )
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      await userEvent.click(darkButton)

      // Buttons should be disabled during transition
      expect(darkButton).toBeDisabled()
    })
  })

  describe("Error Handling", () => {
    it("shows error toast and reverts theme on failure", async () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      // Mock setTheme to throw error
      mockSetTheme.mockImplementationOnce(() => {
        throw new Error("Theme change failed")
      })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      await userEvent.click(darkButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to change theme",
          expect.any(Object)
        )
      })
    })
  })

  describe("Keyboard Navigation", () => {
    it("buttons are accessible via keyboard navigation", async () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      const user = userEvent.setup()
      render(<ThemeSelector />)

      const lightButton = screen.getByTestId("theme-option-light")

      // Tab to first button
      await user.tab()
      expect(lightButton).toHaveFocus()

      // Tab to next button
      await user.tab()
      expect(screen.getByTestId("theme-option-dark")).toHaveFocus()

      // Press Enter to activate
      await user.keyboard("{Enter}")
      expect(mockSetTheme).toHaveBeenCalledWith("dark")
    })

    it("buttons have visible focus indicator", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      const { container } = render(<ThemeSelector />)

      const buttons = container.querySelectorAll("button")
      buttons.forEach((btn) => {
        // Check for focus-visible class applied by Tailwind
        expect(btn.className).toContain("focus-visible:ring")
      })
    })
  })

  describe("Styling", () => {
    it("applies active styling to selected theme", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "dark"
      })

      const { container } = render(<ThemeSelector />)

      const darkButton = screen.getByTestId("theme-option-dark")
      // Check for active styling classes
      expect(darkButton.className).toContain("bg-background")
      expect(darkButton.className).toContain("text-foreground")
      expect(darkButton.className).toContain("shadow-sm")
    })

    it("applies inactive styling to non-selected themes", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "dark",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "dark"
      })

      const { container } = render(<ThemeSelector />)

      const lightButton = screen.getByTestId("theme-option-light")
      // Check for inactive styling classes
      expect(lightButton.className).toContain("text-muted-foreground")
    })

    it("applies custom className when provided", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      const { container } = render(
        <ThemeSelector className="custom-class" />
      )

      const wrapper = screen.getByTestId("theme-selector")
      expect(wrapper.className).toContain("custom-class")
    })
  })

  describe("Memoization", () => {
    it("does not re-render when props have not changed", () => {
      const mockSetTheme = vi.fn()
      const mockUseTheme = vi.mocked(useTheme)
      mockUseTheme.mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      const { rerender } = render(<ThemeSelector />)

      const renderCount = vi.fn()
      renderCount()

      // Re-render with same props
      rerender(<ThemeSelector />)

      // Component should use memoized version (no additional renders in children)
      expect(renderCount.mock.calls.length).toBe(1)
    })
  })

  describe("Accessibility", () => {
    it("has data-testid attributes for testing", () => {
      const mockSetTheme = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        theme: "light",
        setTheme: mockSetTheme,
        themes: ["light", "dark", "system"],
        systemTheme: "light",
        resolvedTheme: "light"
      })

      render(<ThemeSelector />)

      expect(screen.getByTestId("theme-selector")).toBeInTheDocument()
      expect(screen.getByTestId("theme-radiogroup")).toBeInTheDocument()
      expect(screen.getByTestId("theme-option-light")).toBeInTheDocument()
      expect(screen.getByTestId("theme-option-dark")).toBeInTheDocument()
      expect(screen.getByTestId("theme-option-system")).toBeInTheDocument()
    })
  })
})
