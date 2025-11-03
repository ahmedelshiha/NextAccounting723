"use client"

import { memo } from "react"
import UserProfileDropdown, { type UserProfileDropdownProps } from "./UserProfileDropdown"
import { isFeatureEnabled } from "@/lib/feature-flags"

export type { UserProfileDropdownProps }

function UserProfileDropdownWrapper(props: UserProfileDropdownProps) {
  const enabled = isFeatureEnabled('enableNewDropdown', true)

  // For now, legacy fallback is the same component until an older variant exists
  if (!enabled) {
    return <UserProfileDropdown {...props} />
  }

  return <UserProfileDropdown {...props} />
}

export default memo(UserProfileDropdownWrapper)
