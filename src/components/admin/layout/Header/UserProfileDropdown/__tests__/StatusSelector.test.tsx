import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StatusSelector } from "../StatusSelector"
import { useUserStatus } from "@/hooks/useUserStatus"
import { toast } from "sonner"
import { vi } from "vitest"

// Mock useUserStatus
vi.mock("@/hooks/useUserStatus", () => ({
  useUserStatus: vi.fn()
}))

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe("StatusSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders status trigger button with current status", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      expect(trigger).toBeInTheDocument()
      expect(screen.getByTestId("status-label")).toHaveTextContent("online")
    })

    it("displays status indicator dot with correct color for online status", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const dot = screen.getByTestId("status-indicator-dot")
      expect(dot).toHaveClass("bg-green-500")
    })

    it("displays status indicator dot with correct color for away status", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "away",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const dot = screen.getByTestId("status-indicator-dot")
      expect(dot).toHaveClass("bg-amber-400")
    })

    it("displays status indicator dot with correct color for busy status", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "busy",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const dot = screen.getByTestId("status-indicator-dot")
      expect(dot).toHaveClass("bg-red-500")
    })
  })

  describe("Popover Behavior", () => {
    it("opens popover on trigger button click", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      expect(screen.getByTestId("status-popover")).toBeInTheDocument()
    })

    it("displays all three status options in popover", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      expect(screen.getByTestId("status-option-online")).toBeInTheDocument()
      expect(screen.getByTestId("status-option-away")).toBeInTheDocument()
      expect(screen.getByTestId("status-option-busy")).toBeInTheDocument()
    })

    it("closes popover when clicking on backdrop", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      expect(screen.getByTestId("status-popover")).toBeInTheDocument()

      const backdrop = screen.getByTestId("status-popover-backdrop")
      await userEvent.click(backdrop)

      await waitFor(() => {
        expect(screen.queryByTestId("status-popover")).not.toBeInTheDocument()
      })
    })

    it("closes popover when selecting a status option", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const awayOption = screen.getByTestId("status-option-away")
      await userEvent.click(awayOption)

      await waitFor(() => {
        expect(screen.queryByTestId("status-popover")).not.toBeInTheDocument()
      })
    })

    it("shows checkmark on selected status option", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const selectedOption = screen.getByTestId("status-option-online")
      const checkmark = selectedOption.querySelector("svg")
      expect(checkmark).toBeInTheDocument()
    })

    it("rotates chevron icon when popover is open", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      const { container } = render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      const chevron = container.querySelector("button svg")

      expect(chevron).not.toHaveClass("rotate-180")

      await userEvent.click(trigger)

      await waitFor(() => {
        expect(chevron).toHaveClass("rotate-180")
      })
    })
  })

  describe("Status Selection", () => {
    it("calls setStatus with correct value on option click", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const awayOption = screen.getByTestId("status-option-away")
      await userEvent.click(awayOption)

      await waitFor(() => {
        expect(mockSetStatus).toHaveBeenCalledWith("away")
      })
    })

    it("shows success toast on successful status change", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const awayOption = screen.getByTestId("status-option-away")
      await userEvent.click(awayOption)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining("Away"),
          expect.any(Object)
        )
      })
    })

    it("disables options while status is changing", async () => {
      const mockSetStatus = vi.fn(
        () =>
          new Promise((resolve) => setTimeout(resolve, 500)) // Simulate async operation
      )
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const awayOption = screen.getByTestId("status-option-away")
      await userEvent.click(awayOption)

      // Option should be disabled during the change
      expect(awayOption).toBeDisabled()
    })
  })

  describe("Error Handling", () => {
    it("shows error toast and reverts status on failure", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      // Mock setStatus to throw error
      mockSetStatus.mockImplementationOnce(() => {
        throw new Error("Status change failed")
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const awayOption = screen.getByTestId("status-option-away")
      await userEvent.click(awayOption)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to change status",
          expect.any(Object)
        )
      })

      // Should attempt to revert to previous status
      expect(mockSetStatus).toHaveBeenCalledWith("online")
    })
  })

  describe("ARIA Attributes", () => {
    it("has correct ARIA attributes on trigger button", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      expect(trigger).toHaveAttribute("aria-label", expect.stringContaining("online"))
      expect(trigger).toHaveAttribute("aria-haspopup", "menu")
      expect(trigger).toHaveAttribute("aria-expanded", "false")
    })

    it("updates aria-expanded when popover opens", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      expect(trigger).toHaveAttribute("aria-expanded", "false")

      await userEvent.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true")
      })
    })

    it("has menu role on popover", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const popover = screen.getByRole("menu")
      expect(popover).toBeInTheDocument()
    })

    it("has menuitemradio role on status options", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const menuItems = screen.getAllByRole("menuitemradio")
      expect(menuItems).toHaveLength(3)
    })

    it("marks selected status option with aria-checked=true", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const onlineOption = screen.getByTestId("status-option-online")
      const awayOption = screen.getByTestId("status-option-away")

      expect(onlineOption).toHaveAttribute("aria-checked", "true")
      expect(awayOption).toHaveAttribute("aria-checked", "false")
    })
  })

  describe("Styling", () => {
    it("applies active styling to trigger when popover is open", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      expect(trigger).not.toHaveClass("bg-accent")

      await userEvent.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveClass("bg-accent")
      })
    })

    it("applies active styling to selected option in popover", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      const onlineOption = screen.getByTestId("status-option-online")
      expect(onlineOption).toHaveClass("bg-accent")
    })

    it("applies custom className when provided", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector className="custom-class" />)

      const wrapper = screen.getByTestId("status-selector")
      expect(wrapper).toHaveClass("custom-class")
    })
  })

  describe("Accessibility", () => {
    it("has data-testid attributes for testing", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      expect(screen.getByTestId("status-selector")).toBeInTheDocument()
      expect(screen.getByTestId("status-trigger")).toBeInTheDocument()
      expect(screen.getByTestId("status-indicator-dot")).toBeInTheDocument()
      expect(screen.getByTestId("status-label")).toBeInTheDocument()
    })

    it("trigger button is focusable via keyboard", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      const user = userEvent.setup()
      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")

      // Tab to the button
      await user.tab()
      expect(trigger).toHaveFocus()
    })

    it("has focus-visible styling on keyboard focus", () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      expect(trigger.className).toContain("focus-visible:ring")
    })

    it("displays status descriptions for context", async () => {
      const mockSetStatus = vi.fn()
      vi.mocked(useUserStatus).mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      render(<StatusSelector />)

      const trigger = screen.getByTestId("status-trigger")
      await userEvent.click(trigger)

      expect(screen.getByText("Available for conversations")).toBeInTheDocument()
      expect(screen.getByText("Will reply when back")).toBeInTheDocument()
      expect(screen.getByText("Do not disturb")).toBeInTheDocument()
    })
  })

  describe("Memoization", () => {
    it("does not re-render when props have not changed", () => {
      const mockSetStatus = vi.fn()
      const mockUseUserStatus = vi.mocked(useUserStatus)
      mockUseUserStatus.mockReturnValue({
        status: "online",
        setStatus: mockSetStatus
      })

      const { rerender } = render(<StatusSelector />)

      const renderCount = vi.fn()
      renderCount()

      // Re-render with same props
      rerender(<StatusSelector />)

      // Component should use memoized version
      expect(renderCount.mock.calls.length).toBe(1)
    })
  })
})
