'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

interface ThemeContextValue {
  theme: 'light' | 'dark'
  mode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as ThemeMode) || 'light'
  })

  const resolvedTheme: 'light' | 'dark' = mode === 'system' ? getSystemTheme() : mode

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // system 모드일 때 OS 설정 변경 감지
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setMode(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }, [resolvedTheme])

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme', newMode)
    const resolved = newMode === 'system' ? getSystemTheme() : newMode
    applyTheme(resolved)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, mode, toggleTheme, setThemeMode, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Fallback: Context 외부에서 호출된 경우 (하위 호환)
    return { theme: 'light' as const, mode: 'light' as ThemeMode, toggleTheme: () => {}, setThemeMode: () => {}, mounted: false }
  }
  return ctx
}
