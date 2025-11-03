import { useCallback, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import { UserItem } from '../contexts/UserDataContext'

interface FetchOptions {
  page?: number
  limit?: number
  signal?: AbortSignal
}

interface ServiceCache {
  data: UserItem[] | null
  timestamp: number
  ttl: number
}

// Global cache for user service
const userServiceCache: ServiceCache = {
  data: null,
  timestamp: 0,
  ttl: 30000 // 30 seconds
}

/**
 * Unified User Service Hook
 *
 * Consolidates data fetching logic with:
 * - Request deduplication (prevents concurrent API calls)
 * - Exponential backoff retry logic
 * - 30s timeout with abort controller
 * - Response caching
 * - Clean error handling
 *
 * Replaces duplicated logic in:
 * - useUsersList hook
 * - UserDataContext.refreshUsers()
 * - SelectUsersStep component
 * - ClientFormModal
 */
export function useUnifiedUserService() {
  const abortControllerRef = useRef<AbortController | null>(null)
  const pendingRequestRef = useRef<Promise<UserItem[]> | null>(null)

  const issCacheValid = useCallback(() => {
    return (
      userServiceCache.data !== null &&
      Date.now() - userServiceCache.timestamp < userServiceCache.ttl
    )
  }, [])

  const getFromCache = useCallback((): UserItem[] | null => {
    if (issCacheValid()) {
      return userServiceCache.data
    }
    userServiceCache.data = null
    return null
  }, [issCacheValid])

  const setCache = useCallback((data: UserItem[]) => {
    userServiceCache.data = data
    userServiceCache.timestamp = Date.now()
  }, [])

  const fetchUsers = useCallback(
    async (options: FetchOptions = {}) => {
      const { page = 1, limit = 50, signal } = options

      // Check cache first
      const cached = getFromCache()
      if (cached) {
        return cached
      }

      // Deduplicate: If request already in-flight, return existing promise
      if (pendingRequestRef.current) {
        return pendingRequestRef.current
      }

      // Cancel previous request if still in-flight
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      const doFetch = async (): Promise<UserItem[]> => {
        const maxRetries = 3
        let lastErr: Error | null = null

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const controller = abortControllerRef.current || new AbortController()
            const abortSignal = signal || controller.signal

            // 30 second timeout per attempt
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            try {
              const res = await apiFetch(
                `/api/admin/users?page=${page}&limit=${limit}`,
                { signal: abortSignal } as any
              )

              clearTimeout(timeoutId)

              // Handle rate limiting with exponential backoff
              if (res.status === 429) {
                const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000)
                console.warn(
                  `Rate limited, retrying after ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`
                )
                lastErr = new Error('Rate limit exceeded')
                if (attempt < maxRetries - 1) {
                  await new Promise((resolve) => setTimeout(resolve, waitMs))
                  continue
                }
                throw lastErr
              }

              if (!res.ok) {
                throw new Error(`Failed to load users (${res.status})`)
              }

              const data = await res.json()
              const users = Array.isArray(data?.users) ? (data.users as UserItem[]) : []

              // Cache the result
              setCache(users)

              return users
            } catch (fetchErr) {
              clearTimeout(timeoutId)
              throw fetchErr
            }
          } catch (err) {
            // Ignore abort errors (from cancellation)
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.debug('Users fetch cancelled')
              throw err
            }

            lastErr = err instanceof Error ? err : new Error('Unable to load users')

            if (attempt === maxRetries - 1) {
              console.error('Failed to fetch users after retries:', err)
              throw lastErr
            }

            // Wait before retry with exponential backoff
            const waitMs = Math.min(1000 * Math.pow(2, attempt), 5000)
            await new Promise((resolve) => setTimeout(resolve, waitMs))
          }
        }

        throw lastErr || new Error('Failed to fetch users')
      }

      // Store promise for deduplication
      pendingRequestRef.current = doFetch()

      try {
        const result = await pendingRequestRef.current
        return result
      } finally {
        pendingRequestRef.current = null
      }
    },
    [getFromCache, setCache]
  )

  const invalidateCache = useCallback(() => {
    userServiceCache.data = null
    userServiceCache.timestamp = 0
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    fetchUsers,
    invalidateCache,
    abort,
    isCacheValid: issCacheValid,
    getFromCache
  }
}
