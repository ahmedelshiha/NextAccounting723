'use client'

import React, { memo, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUsersContext } from '../../contexts/UsersContextProvider'
import { OverviewTab } from './OverviewTab'
import { DetailsTab } from './DetailsTab'
import { ActivityTab } from './ActivityTab'
import { SettingsTab } from './SettingsTab'

interface UserProfileDialogProps {
  onTabChange?: (tab: string) => void
}

export const UserProfileDialog = memo(function UserProfileDialog({
  onTabChange
}: UserProfileDialogProps) {
  const {
    selectedUser,
    profileOpen,
    setProfileOpen,
    activeTab,
    setActiveTab,
    editMode,
    setEditMode
  } = useUsersContext()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setProfileOpen(open)
      if (!open) {
        setEditMode(false)
        setActiveTab('overview')
      }
    },
    [setProfileOpen, setEditMode, setActiveTab]
  )

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab as any)
      onTabChange?.(tab)
    },
    [setActiveTab, onTabChange]
  )

  if (!selectedUser) {
    return null
  }

  return (
    <Dialog open={profileOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
            </div>
            {activeTab === 'details' && editMode ? 'Edit User Profile' : 'User Profile'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'details' && editMode
              ? 'Update user information and settings'
              : 'View detailed user information and manage account'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <OverviewTab user={selectedUser} />
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <DetailsTab user={selectedUser} isEditing={editMode} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <ActivityTab userId={selectedUser.id} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <SettingsTab user={selectedUser} />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          {activeTab === 'details' && editMode && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

UserProfileDialog.displayName = 'UserProfileDialog'
