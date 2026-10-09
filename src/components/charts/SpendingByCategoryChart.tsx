import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { CategoryTotal } from '../../types'
import { formatCurrency } from '../../lib/format'
import { ChartTooltip } from './ChartTooltip'

interface SpendingByCategoryChartProps {
  data: CategoryTotal[]
  className?: string
}

/**
 * Donut de gastos por categoría con leyenda lateral
 * (porcentaje sobre el total).
 */
export function SpendingByCategoryChart({
  data,
  className,
}: SpendingByCategoryChartProps) {
  const total = data.reduce((acc, d) => acc + d.total, 0)

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                strokeWidth={0}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell key={entry.categoriaId} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip formatter={(v) => formatCurrency(v)} />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {data.slice(0, 6).map((entry) => {
            const porcentaje = total > 0 ? (entry.total / total) * 100 : 0
            return (
              <li key={entry.categoriaId} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
                  {entry.nombre}
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                  {porcentaje.toFixed(0)}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
