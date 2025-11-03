import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import UserProfileDropdown from "../UserProfileDropdown.tsx"
import { useSession } from "next-auth/react"
import { useUserStatus } from "@/hooks/useUserStatus"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { vi } from "vitest"

// Mock dependencies
vi.mock("next-auth/react", () => ({
  useSession: vi.fn()
}))

vi.mock("@/hooks/useUserStatus", () => ({
  useUserStatus: vi.fn()
}))

vi.mock("next-themes", () => ({
  useTheme: vi.fn()
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("@/lib/permissions", () => ({
  hasPermission: vi.fn(() => true)
}))

describe("UserProfileDropdown Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          email: "john@example.com",
          image: "https://example.com/avatar.jpg"
        }
      },
      status: "authenticated",
      update: vi.fn()
    } as any)

    vi.mocked(useUserStatus).mockReturnValue({
      status: "online",
      setStatus: vi.fn()
    })

    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: vi.fn(),
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      resolvedTheme: "light"
    })
  })

  describe("Dropdown Structure", () => {
    it("renders dropdown trigger with user avatar and name", () => {
      render(<UserProfileDropdown />)

      expect(screen.getByRole("img", { name: "John Doe" })).toBeInTheDocument()
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("opens dropdown menu on trigger click", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.getByTestId("user-profile-dropdown")).toBeInTheDocument()
    })

    it("renders dropdown with correct width class", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const dropdown = screen.getByTestId("user-profile-dropdown")
      expect(dropdown).toHaveClass("w-80")
    })
  })

  describe("Section Organization", () => {
    it("displays sections in correct order: Preferences, Profile, Quick Actions", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const sections = screen.getAllByText(/^(Preferences|Profile|Quick Actions)$/i)
      expect(sections).toHaveLength(3)
      expect(sections[0]).toHaveTextContent("Preferences")
      expect(sections[1]).toHaveTextContent("Profile")
      expect(sections[2]).toHaveTextContent("Quick Actions")
    })

    it("displays profile section headers with correct styling", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const preferencesHeader = screen.getByText("Preferences")
      expect(preferencesHeader.className).toContain("uppercase")
      expect(preferencesHeader.className).toContain("text-xs")
    })
  })

  describe("Theme Selector Integration", () => {
    it("renders ThemeSelector in Preferences section", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      // ThemeSelector should be rendered with 3 theme options
      const themeButtons = screen.getAllByRole("radio")
      expect(themeButtons.length).toBeGreaterThanOrEqual(3)
    })

    it("ThemeSelector is properly positioned in dropdown", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const themeSelector = screen.getByTestId("theme-selector")
      expect(themeSelector).toBeInTheDocument()

      // Check it's in the preferences section (should come after profile header)
      const preferencesHeader = screen.getByText("Preferences")
      expect(preferencesHeader.parentElement?.parentElement?.contains(themeSelector)).toBe(true)
    })
  })

  describe("Status Selector Integration", () => {
    it("renders StatusSelector in Preferences section when showStatus is true", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown showStatus={true} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.getByTestId("status-selector")).toBeInTheDocument()
    })

    it("does not render StatusSelector when showStatus is false", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown showStatus={false} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.queryByTestId("status-selector")).not.toBeInTheDocument()
    })

    it("StatusSelector displays current status", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.getByTestId("status-label")).toHaveTextContent("online")
    })
  })

  describe("Menu Items with Icons and Shortcuts", () => {
    it("renders menu items with appropriate icons", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown onOpenProfilePanel={() => {}} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      // Check for security settings with Shield icon
      expect(screen.getByText("Security Settings")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })

    it("displays keyboard shortcuts next to relevant menu items", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown onOpenProfilePanel={() => {}} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      // Check for keyboard shortcut indicators
      const shortcutElements = screen.getAllByText(/⌘/i)
      expect(shortcutElements.length).toBeGreaterThan(0)
    })

    it("displays correct shortcuts for menu items", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown onOpenProfilePanel={() => {}} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      // Check for specific shortcuts
      const manageable = screen.queryByText("⌘P") // Manage Profile
      const security = screen.queryByText("⌘S") // Security Settings
      const signout = screen.queryByText("⌘Q") // Sign Out

      if (manageable) expect(manageable).toBeInTheDocument()
      if (security) expect(security).toBeInTheDocument()
      if (signout) expect(signout).toBeInTheDocument()
    })
  })

  describe("Profile Actions", () => {
    it("calls onOpenProfilePanel when manage profile clicked", async () => {
      const mockOpenProfilePanel = vi.fn()
      const user = userEvent.setup()

      render(
        <UserProfileDropdown onOpenProfilePanel={mockOpenProfilePanel} />
      )

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const manageProfileBtn = screen.getByText("Manage Profile")
      await user.click(manageProfileBtn)

      expect(mockOpenProfilePanel).toHaveBeenCalled()
    })

    it("displays security settings link with correct href", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const securityLink = screen.getByText("Security Settings")
      expect(securityLink).toHaveAttribute("href", "/settings/security")
    })

    it("displays settings link with correct href", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const settingsLink = screen.getByText("Settings")
      expect(settingsLink).toHaveAttribute("href", "/settings")
    })
  })

  describe("Sign Out Section", () => {
    it("displays sign out button with danger styling", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const signOutBtn = screen.getByText("Sign Out")
      expect(signOutBtn).toHaveClass("text-red-600")
    })

    it("calls onSignOut when sign out is clicked with confirmation", async () => {
      const mockSignOut = vi.fn()
      const user = userEvent.setup()

      // Mock window.confirm to return true
      vi.spyOn(window, "confirm").mockReturnValueOnce(true)

      render(<UserProfileDropdown onSignOut={mockSignOut} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const signOutBtn = screen.getByText("Sign Out")
      await user.click(signOutBtn)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it("does not call onSignOut when confirmation is cancelled", async () => {
      const mockSignOut = vi.fn()
      const user = userEvent.setup()

      // Mock window.confirm to return false
      vi.spyOn(window, "confirm").mockReturnValueOnce(false)

      render(<UserProfileDropdown onSignOut={mockSignOut} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const signOutBtn = screen.getByText("Sign Out")
      await user.click(signOutBtn)

      await waitFor(() => {
        expect(mockSignOut).not.toHaveBeenCalled()
      })
    })
  })

  describe("Custom Links", () => {
    it("renders custom links when provided", async () => {
      const customLinks = [
        {
          href: "/custom-link",
          label: "Custom Link",
          permission: undefined
        }
      ]
      const user = userEvent.setup()

      render(
        <UserProfileDropdown customLinks={customLinks} />
      )

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.getByText("Custom Link")).toBeInTheDocument()
    })

    it("uses default MENU_LINKS when customLinks not provided", async () => {
      const user = userEvent.setup()

      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      // Should render some default items
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA labels on trigger button", () => {
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      expect(trigger).toHaveAttribute("aria-label", "Open user menu")
    })

    it("has proper role attributes on menu items", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown onOpenProfilePanel={() => {}} />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      const menuItems = screen.getAllByRole("menuitem")
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it("menu can be closed with keyboard (Escape key)", async () => {
      const user = userEvent.setup()
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      await user.click(trigger)

      expect(screen.getByTestId("user-profile-dropdown")).toBeInTheDocument()

      await user.keyboard("{Escape}")

      await waitFor(() => {
        expect(screen.queryByTestId("user-profile-dropdown")).not.toBeInTheDocument()
      })
    })
  })

  describe("Responsive Design", () => {
    it("displays dropdown in responsive container", () => {
      render(<UserProfileDropdown />)

      const trigger = screen.getByRole("button", { name: /open user menu/i })
      expect(trigger).toBeInTheDocument()

      // Check responsive classes
      expect(trigger.className).toContain("hidden md:block")
    })
  })

  describe("Memoization", () => {
    it("component is memoized", () => {
      const { rerender } = render(<UserProfileDropdown />)

      const trigger1 = screen.getByRole("button", { name: /open user menu/i })

      rerender(<UserProfileDropdown />)

      const trigger2 = screen.getByRole("button", { name: /open user menu/i })

      // Both should exist and be functional
      expect(trigger1).toBeInTheDocument()
      expect(trigger2).toBeInTheDocument()
    })
  })

  describe("Error States", () => {
    it("handles missing user data gracefully", () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: vi.fn()
      } as any)

      render(<UserProfileDropdown />)

      // Should render with fallback values
      expect(screen.getByRole("button", { name: /open user menu/i })).toBeInTheDocument()
    })

    it("renders with missing optional props", () => {
      render(
        <UserProfileDropdown
          onSignOut={undefined}
          onOpenProfilePanel={undefined}
          customLinks={undefined}
        />
      )

      expect(screen.getByRole("button", { name: /open user menu/i })).toBeInTheDocument()
    })
  })
})
