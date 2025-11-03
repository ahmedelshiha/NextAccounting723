"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string) {
  const getMatches = (q: string) => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false
    return window.matchMedia(q).matches
  }

  const [matches, setMatches] = useState<boolean>(() => getMatches(query))

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return
    const mediaQueryList = window.matchMedia(query)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value in case it changed between renders
    setMatches(mediaQueryList.matches)

    try {
      mediaQueryList.addEventListener("change", listener)
      return () => mediaQueryList.removeEventListener("change", listener)
    } catch {
      // Safari <14 support - fallback to legacy API
      const addListener = (mediaQueryList as any).addListener?.bind(mediaQueryList)
      const removeListener = (mediaQueryList as any).removeListener?.bind(mediaQueryList)
      if (addListener && removeListener) {
        addListener(listener)
        return () => removeListener(listener)
      }
    }
  }, [query])

  return matches
}
