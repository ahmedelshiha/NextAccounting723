import { renderHook, act } from '@testing-library/react'
// @vitest-environment jsdom
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdminLayoutStore } from '../layout.store'

describe('AdminLayoutStore', () => {
  beforeEach(() => {
    // reset store state to default
    useAdminLayoutStore.setState({
      sidebar: {
        collapsed: false,
        width: 256,
        mobileOpen: false,
        expandedGroups: [],
      },
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAdminLayoutStore())
    expect(result.current.sidebar.collapsed).toBe(false)
    expect(result.current.sidebar.width).toBe(256)
    expect(result.current.sidebar.mobileOpen).toBe(false)
  })

  it('toggles sidebar collapsed', () => {
    const { result } = renderHook(() => useAdminLayoutStore())
    act(() => {
      result.current.toggleSidebar()
    })
    expect(result.current.sidebar.collapsed).toBe(true)
    act(() => {
      result.current.toggleSidebar()
    })
    expect(result.current.sidebar.collapsed).toBe(false)
  })

  it('sets width and constrains bounds', () => {
    const { result } = renderHook(() => useAdminLayoutStore())
    act(() => {
      result.current.setWidth(100)
    })
    expect(result.current.sidebar.width).toBe(160)
    act(() => {
      result.current.setWidth(500)
    })
    expect(result.current.sidebar.width).toBe(420)
  })

  it('persists collapsed and width state', () => {
    const { result } = renderHook(() => useAdminLayoutStore())
    act(() => {
      result.current.setCollapsed(true)
      result.current.setWidth(300)
    })
    // Verify state changes are persisted in store
    expect(result.current.sidebar.collapsed).toBe(true)
    expect(result.current.sidebar.width).toBe(300)
  })
})
