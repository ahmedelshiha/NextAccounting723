'use client'

import { AlertCircle, LogIn, RefreshCw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { AuthError } from '@/hooks/useUnifiedData'

interface AuthErrorFallbackProps {
  error: AuthError
  onRetry?: () => void
  title?: string
  description?: string
}

export function AuthErrorFallback({
  error,
  onRetry,
  title,
  description,
}: AuthErrorFallbackProps) {
  const { data: session } = useSession()
  const isUnauthorized = error.statusCode === 401
  const isForbidden = error.statusCode === 403

  const defaultTitle = isUnauthorized ? 'Session Expired' : 'Access Denied'
  const defaultDescription = isUnauthorized
    ? 'Your session has expired. Please sign in again to continue.'
    : 'You do not have permission to view this data. Contact your administrator for access.'

  const handleSignIn = () => {
    window.location.href = '/login'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title || defaultTitle}
      </h3>

      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description || defaultDescription}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {isUnauthorized && (
          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        )}

        {isForbidden && session && (
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>

      {isForbidden && !session && (
        <button
          onClick={handleSignIn}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </button>
      )}
    </div>
  )
}
