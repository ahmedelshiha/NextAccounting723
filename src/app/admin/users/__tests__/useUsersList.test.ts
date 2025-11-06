import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, vi, expect } from 'vitest'
import { useUsersList } from '../hooks/useUsersList'

// Mock apiFetch
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn()
}))

import { apiFetch } from '@/lib/api'

describe('useUsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch users on mount', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'ADMIN', createdAt: '2025-01-01' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'TEAM_MEMBER', createdAt: '2025-01-02' }
    ]

    ;(apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    const { result } = renderHook(() => useUsersList())

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  it('should handle fetch errors gracefully', async () => {
    ;(apiFetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const onError = vi.fn()
    const { result } = renderHook(() => useUsersList({ onError }))

    await waitFor(() => {
      expect(result.current.users).toEqual([])
      expect(result.current.error).toBeTruthy()
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should provide refetch function', async () => {
    const mockUsers = [{ id: '1', name: 'John', email: 'john@example.com', role: 'ADMIN', createdAt: '2025-01-01' }]

    ;(apiFetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockUsers })
    })

    const { result } = renderHook(() => useUsersList())

    await waitFor(() => {
      expect(result.current.users.length).toBeGreaterThan(0)
    })

    // Call refetch
    await result.current.refetch()

    expect(apiFetch).toHaveBeenCalledTimes(2)
  })

  it('should handle empty user list', async () => {
    ;(apiFetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] })
    })

    const { result } = renderHook(() => useUsersList())

    await waitFor(() => {
      expect(result.current.users).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })
})
