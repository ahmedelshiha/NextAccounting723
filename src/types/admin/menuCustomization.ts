/**
 * Menu Customization Types
 *
 * Defines the complete type structure for user-specific menu customization,
 * including section ordering, visibility toggles, and bookmarks.
 */

/**
 * Practice Item - Represents a dynamic, practice-specific navigation item
 */
export interface PracticeItem {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  href: string; // Full path
  order: number;
  visible: boolean;
}

/**
 * Bookmark Item - Represents a bookmarked page for quick access
 */
export interface Bookmark {
  id: string; // Unique ID for the bookmark item
  name: string;
  href: string; // Full path
  icon: string; // Lucide icon name
  order: number;
}

/**
 * Menu Customization Data - Complete customization state for a user
 * This is the primary data structure persisted to the database and
 * consumed by the menu customization store and sidebar component.
 */
export interface MenuCustomizationData {
  sectionOrder: string[]; // Array of section IDs in custom order
  hiddenItems: string[]; // Array of full path IDs for hidden items
  practiceItems: PracticeItem[]; // Array of practice-specific items
  bookmarks: Bookmark[]; // Array of bookmarked pages
}

/**
 * Default menu item structure for type safety
 */
export interface MenuItem {
  id: string;
  name: string;
  href?: string;
  icon?: string;
  badge?: number | string;
  visible?: boolean;
  order?: number;
  children?: MenuItem[];
}

/**
 * Menu section - groups menu items into logical sections
 */
export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
  order: number;
  visible?: boolean;
}
