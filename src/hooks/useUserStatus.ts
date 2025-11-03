"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { announce } from "@/lib/a11y"

export type UserStatus = "online" | "away" | "busy"

const STORAGE_KEY = "user-status"

export function useUserStatus(options?: { autoAwayMs?: number }) {
  const { autoAwayMs = 5 * 60 * 1000 } = options || {}
  const [status, setStatusState] = useState<UserStatus>(() => {
    if (typeof window === "undefined") return "online"
    try {
      const s = window.localStorage.getItem(STORAGE_KEY) as UserStatus | null
      return (s === "online" || s === "away" || s === "busy") ? s : "online"
    } catch {
      return "online"
    }
  })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track if user explicitly set "away" to avoid auto-toggling back to online on activity
  const manualAwayRef = useRef<boolean>(false)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, status) } catch {}
  }, [status])

  const markActive = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    // Only auto-mark online if not manually set to away and not busy
    if (status !== "busy" && !manualAwayRef.current) setStatusState("online")
    timer.current = setTimeout(() => {
      // Auto set away after inactivity when not manually away and not busy
      if (status !== "busy" && !manualAwayRef.current) setStatusState("away")
    }, autoAwayMs)
  }, [autoAwayMs, status])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onVis = () => markActive()
    const onMove = () => markActive()
    const onKey = () => markActive()
    const onOnline = () => markActive()
    const onOffline = () => { if (status !== "busy" && !manualAwayRef.current) setStatusState("away") }
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("keydown", onKey)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    markActive()
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [markActive, status])

  const set = useCallback((s: UserStatus) => {
    // Mark manual only when explicitly setting away
    manualAwayRef.current = s === "away"
    setStatusState(s)
    try {
      const lbl = s === 'away' ? 'Away' : s === 'busy' ? 'Busy' : 'Online'
      announce(`Status set to ${lbl}`)
      toast.success(`Status: ${lbl}`)
    } catch {}
  }, [])

  return { status, setStatus: set }
}
