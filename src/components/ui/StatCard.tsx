import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatCurrency } from '../../lib/format'
import { useCountUp } from '../../hooks/useCountUp'

interface StatCardProps {
  label: string
  value: number
  format?: (value: number) => string
  /** Variación porcentual (ej. 12.4 = +12.4%). */
  delta?: number
  icon: LucideIcon
  /** Clases del contenedor del ícono (colores de acento). */
  iconClassName?: string
  className?: string
}

export function StatCard({
  label,
  value,
  format = formatCurrency,
  delta,
  icon: Icono,
  iconClassName = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  className,
}: StatCardProps) {
  const valorAnimado = useCountUp(value)
  const deltaPositivo = delta !== undefined && delta >= 0

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {format(valorAnimado)}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconClassName,
          )}
        >
          <Icono className="h-5 w-5" />
        </div>
      </div>

      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
              deltaPositivo
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
            )}
          >
            {deltaPositivo ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {deltaPositivo ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs. mes anterior</span>
        </div>
      )}
    </div>
  )
}
