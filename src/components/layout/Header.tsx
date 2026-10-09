import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, PanelLeft, Search } from 'lucide-react'

const TITULOS: Record<string, { titulo: string; subtitulo: string }> = {
  '/': { titulo: 'Resumen', subtitulo: 'Panorama financiero de hoy' },
  '/dashboard': { titulo: 'Dashboard General', subtitulo: 'Tendencias y métricas clave' },
  '/transacciones': { titulo: 'Transacciones', subtitulo: 'Historial de movimientos' },
  '/presupuestos': { titulo: 'Presupuestos', subtitulo: 'Control de límites mensuales' },
}

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { pathname } = useLocation()
  const seccion = TITULOS[pathname] ?? TITULOS['/']
  const [busqueda, setBusqueda] = useState('')

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Mostrar / ocultar sidebar"
        aria-label="Mostrar / ocultar sidebar"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
          {seccion.titulo}
        </h1>
        <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
          {seccion.subtitulo}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar…"
            aria-label="Buscar en el dashboard"
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
          />
        </div>

        <button
          type="button"
          aria-label="Notificaciones"
          title="Notificaciones"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  )
}
