import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../lib/utils'

const SIDEBAR_STORAGE_KEY = 'fhub:sidebar'

/**
 * Shell de la aplicación.
 *
 * Estructura resistente al colapso del sidebar:
 *   flex container → Sidebar (ancho animado) + columna principal
 *   con `min-w-0 flex-1`, que garantiza que el contenido nunca
 *   desborde al abrir/cerrar el sidebar.
 */
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const guardado = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (guardado !== null) return guardado === 'open'
    return window.innerWidth >= 1024
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? 'open' : 'closed')
  }, [sidebarOpen])

  const toggleSidebar = () => setSidebarOpen((previo) => !previo)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Backdrop para móvil */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
