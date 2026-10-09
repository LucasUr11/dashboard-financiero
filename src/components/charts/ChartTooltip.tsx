import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { formatCurrency } from '../../lib/format'

export interface ChartTooltipPayloadItem {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string | number
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string | number
  /** Formatea el valor mostrado (recibe el valor numérico y el nombre de la serie). */
  formatter?: (value: number, name: string) => string
}

/**
 * Tooltip personalizado para Recharts.
 * Totalmente tipado (sin `any`) y con estilo coherente al tema.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps): ReactNode {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'min-w-40 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur',
        'dark:border-slate-700 dark:bg-slate-900/95',
      )}
    >
      {label !== undefined && (
        <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, indice) => {
          const valorNumerico = Number(entry.value ?? 0)
          const nombre = String(entry.name ?? entry.dataKey ?? `Serie ${indice + 1}`)
          return (
            <div key={`${nombre}-${indice}`} className="flex items-center gap-2 text-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? '#64748b' }}
              />
              <span className="text-slate-500 dark:text-slate-400">{nombre}</span>
              <span className="ml-auto pl-4 font-semibold tabular-nums text-slate-900 dark:text-white">
                {formatter ? formatter(valorNumerico, nombre) : formatCurrency(valorNumerico)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
