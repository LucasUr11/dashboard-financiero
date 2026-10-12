import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { MonthlyFlowPoint } from '../../types'
import { formatCompactCurrency, monthLabel } from '../../lib/format'
import { ChartTooltip } from './ChartTooltip'

interface CashFlowChartProps {
  data: MonthlyFlowPoint[]
  className?: string
}

/**
 * Flujo de caja: ingresos vs gastos por mes (Área).
 * Animación ease-out + gradientes suaves.
 */
export function CashFlowChart({ data, className }: CashFlowChartProps) {
  return (
    <div className={`h-64 min-w-0 sm:h-80 ${className ?? ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            className="dark:stroke-slate-800"
          />
          <XAxis
            dataKey="mes"
            tickFormatter={(value: string) => monthLabel(value)}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            tickLine={false}
            axisLine={false}
            width={64}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={12}
          />
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatCompactCurrency(v)} />}
            cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#gradIngresos)"
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="gastos"
            name="Gastos"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fill="url(#gradGastos)"
            isAnimationActive
            animationDuration={900}
            animationBegin={150}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
