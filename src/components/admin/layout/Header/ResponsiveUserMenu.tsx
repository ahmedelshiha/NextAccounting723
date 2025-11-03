"use client"

import { memo, type Ref } from "react"
import UserProfileDropdownWrapper, { type UserProfileDropdownProps } from "./UserProfileDropdownWrapper"
import MobileUserMenu from "./MobileUserMenu"
import { useMediaQuery } from "@/hooks/useMediaQuery"

function ResponsiveUserMenuComponent(props: UserProfileDropdownProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")

  if (isMobile) {
    return (
      <MobileUserMenu
        className={props.className}
        customLinks={props.customLinks}
        onOpenProfilePanel={props.onOpenProfilePanel}
        onSignOut={props.onSignOut}
        showStatus={props.showStatus}
        triggerRef={props.triggerRef as Ref<HTMLButtonElement>}
      />
    )
  }

  return <UserProfileDropdownWrapper {...props} />
}

export default memo(ResponsiveUserMenuComponent)
