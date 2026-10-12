import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/useTheme'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/dashboard', label: 'Dashboard General', icon: BarChart3 },
  { to: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/presupuestos', label: 'Presupuestos', icon: Wallet },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

/**
 * Sidebar izquierdo colapsable.
 *
 * - Escritorio (lg+): forma parte del flujo flex y anima su ancho
 *   entre w-64 (completo) y w-20 (solo íconos).
 * - Móvil: overlay fijo que entra/sale con translate-x.
 *
 * El contenido principal usa `min-w-0 flex-1`, por lo que el
 * layout nunca se rompe al abrir/cerrar.
 */
export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col bg-slate-900 text-slate-100',
        'transition-[width,transform] duration-300 ease-in-out',
        'lg:static lg:z-auto lg:h-screen lg:shrink-0',
        isOpen
          ? 'translate-x-0 lg:w-64'
          : '-translate-x-full lg:translate-x-0 lg:w-20',
      )}
      aria-label="Navegación principal"
    >
      {/* Cabecera: marca + botón colapsar */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <img
          src="/logo.png"
          alt="FinHub"
          className={cn('h-9 shrink-0 object-contain', isOpen ? 'w-16' : 'w-9')}
        />
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap text-lg font-bold tracking-tight transition-[width,opacity] duration-200',
            isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
          )}
        >
          FinHub
        </span>
        <button
          type="button"
          onClick={onToggle}
          title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
          aria-label={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
          className={cn(
            'ml-auto shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white',
            !isOpen && 'lg:ml-0',
          )}
        >
          {isOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
                !isOpen && 'justify-center lg:px-0',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-[width,opacity] duration-200',
                isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Botón de cambio de tema (base del sidebar) */}
      <div className="shrink-0 px-3 py-3">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-pressed={isDark}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white',
            !isOpen && 'justify-center lg:px-0',
          )}
        >
          {isDark ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-[width,opacity] duration-200',
              isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
            )}
          >
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </button>
      </div>

      {/* Pie: usuario */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 text-sm font-bold text-white">
            AD
          </div>
          <div
            className={cn(
              'min-w-0 overflow-hidden transition-[width,opacity] duration-200',
              isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0',
            )}
          >
            <p className="truncate text-sm font-semibold">Alex Demo</p>
            <p className="truncate text-xs text-slate-400">Plan Pro</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
