import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fhub:theme'

function getInitialTheme(): Theme {
  // 1. Preferencia guardada del usuario
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado === 'light' || guardado === 'dark') return guardado
  // 2. Preferencia del sistema operativo
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * Administra el tema de la aplicación (light / dark).
 *
 * - La clase `dark` se aplica en <html>, activando el variant
 *   `dark:` de Tailwind (ver src/index.css).
 * - La preferencia se persiste en localStorage.
 * - Si el usuario no eligió manualmente, sigue al sistema en
 *   tiempo real.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Aplicar y persistir al cambiar
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Seguir al sistema solo si el usuario no eligió manualmente
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((previo) => (previo === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme }
}
