/**
 * Draggable Item Component
 *
 * Accessible draggable item for use with @dnd-kit/sortable.
 * Includes keyboard support and ARIA attributes for screen readers.
 */

'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff } from 'lucide-react'

export interface DraggableItemProps {
  id: string
  label: string
  icon?: React.ReactNode
  isVisible?: boolean
  onVisibilityToggle?: () => void
  isDragging?: boolean
  isOverlay?: boolean
}

/**
 * Draggable item component for use with dnd-kit
 *
 * Features:
 * - Full keyboard accessibility (space/enter to activate, arrow keys to move)
 * - ARIA attributes for screen reader support
 * - Visual feedback for drag state and hover
 * - Optional visibility toggle
 * - Customizable appearance
 */
export const DraggableItem = React.forwardRef<HTMLDivElement, DraggableItemProps>(
  function DraggableItem(
    {
      id,
      label,
      icon,
      isVisible = true,
      onVisibilityToggle,
      isDragging: isDraggingProp,
      isOverlay,
    },
    ref
  ) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isDraggingDnd,
    } = useSortable({
      id,
      disabled: isDraggingProp,
    })

    const isDragging = isDraggingProp ?? isDraggingDnd

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging && !isOverlay ? 0.5 : 1,
    }

    return (
      <div
        ref={ref ?? setNodeRef}
        style={style}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
          ${
            isDragging && !isOverlay
              ? 'bg-blue-50 border-blue-300 shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }
          ${isOverlay ? 'shadow-lg ring-2 ring-blue-500' : ''}
        `}

        aria-grabbed={isDragging}
        aria-label={`${label}, draggable item`}
        {...attributes}
        {...listeners}
      >
        {/* Drag Handle */}
        <div
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          aria-label="Drag handle"
          role="presentation"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Icon */}
        {icon && <div className="flex-shrink-0 text-gray-600">{icon}</div>}

        {/* Label */}
        <span className="flex-1 text-sm font-medium text-gray-900">{label}</span>

        {/* Visibility Toggle */}
        {onVisibilityToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onVisibilityToggle()
            }}
            className={`
              flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors
              ${isVisible ? 'text-gray-600' : 'text-gray-400'}
            `}
            aria-label={isVisible ? 'Hide item' : 'Show item'}
            aria-pressed={isVisible}
            type="button"
          >
            {isVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)

DraggableItem.displayName = 'DraggableItem'

/**
 * Overlay version of DraggableItem for showing during drag
 */
export const DraggableItemOverlay = React.forwardRef<HTMLDivElement, DraggableItemProps>(
  function DraggableItemOverlay(
    { id, label, icon, isVisible = true, onVisibilityToggle, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="bg-white rounded-lg border border-blue-300 shadow-xl p-3 flex items-center gap-3 cursor-grabbing"
        role="status"
        aria-label={`${label} is being dragged`}
      >
        <GripVertical className="h-5 w-5 text-blue-600" />
        {icon && <div className="text-gray-600">{icon}</div>}
        <span className="font-medium text-gray-900">{label}</span>
      </div>
    )
  }
)

DraggableItemOverlay.displayName = 'DraggableItemOverlay'
