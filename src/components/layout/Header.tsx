import { useLocation } from 'react-router-dom'
import { LogOut, PanelLeft, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TITULOS: Record<string, { titulo: string; subtitulo: string }> = {
  '/': { titulo: 'Resumen', subtitulo: 'Panorama financiero de hoy' },
  '/dashboard': { titulo: 'Dashboard General', subtitulo: 'Tendencias y métricas clave' },
  '/transacciones': { titulo: 'Transacciones', subtitulo: 'Historial de movimientos' },
  '/presupuestos': { titulo: 'Presupuestos', subtitulo: 'Control de límites mensuales' },
}

interface HeaderProps {
  onToggleSidebar: () => void
  onAbrirAuth: () => void
}

export function Header({ onToggleSidebar, onAbrirAuth }: HeaderProps) {
  const { pathname } = useLocation()
  const { usuario, isAuthenticated, cerrarSesion } = useAuth()
  const seccion = TITULOS[pathname] ?? TITULOS['/']

  const iniciales = usuario
    ? usuario.nombre
        .split(' ')
        .map((parte) => parte[0] ?? '')
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

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
        {isAuthenticated && usuario ? (
          <>
            <div className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                {iniciales || 'U'}
              </div>
              <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                {usuario.nombre}
              </span>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onAbrirAuth}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Iniciar Sesión
            </button>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              title="Sin iniciar sesión"
              aria-label="Sin iniciar sesión"
            >
              <User className="h-4 w-4" />
            </div>
          </>
        )}
      </div>
    </header>
  )
}
