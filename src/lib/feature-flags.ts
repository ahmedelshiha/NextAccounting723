type FlagMap = Record<string, boolean>

function parseJsonFlags(raw?: string | null): FlagMap {
  if (!raw) return {}
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object') {
      return Object.keys(obj as object).reduce<FlagMap>((acc, k) => {
        const v = (obj as Record<string, unknown>)[k]
        acc[k] = typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true'
        return acc
      }, {})
    }
  } catch {
    // ignore invalid JSON
  }
  return {}
}

export function isFeatureEnabled(name: string, defaultValue = true): boolean {
  // 1) DOM data attribute support: <html data-flags='{"enableNewDropdown":true}'>
  try {
    if (typeof document !== 'undefined') {
      const data = document.documentElement.getAttribute('data-flags')
      const domFlags = parseJsonFlags(data)
      if (name in domFlags) return !!domFlags[name]
    }
  } catch {
    // ignore
  }

  // 2) Single JSON env var (client-safe): NEXT_PUBLIC_FLAGS='{"enableNewDropdown":true}'
  const envJson = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_FLAGS as string | undefined) : undefined
  const envFlags = parseJsonFlags(envJson)
  if (name in envFlags) return !!envFlags[name]

  // 3) Dedicated env vars (client-safe)
  if (name === 'enableNewDropdown') {
    const v = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ENABLE_NEW_DROPDOWN : undefined
    if (typeof v === 'string') return v.toLowerCase() === 'true'
  }

  return defaultValue
}
