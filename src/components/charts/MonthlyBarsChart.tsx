import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { MonthlyFlowPoint } from '../../types'
import { formatCompactCurrency, monthLabel } from '../../lib/format'
import { ChartTooltip } from './ChartTooltip'

interface MonthlyBarsChartProps {
  data: MonthlyFlowPoint[]
  className?: string
}

/**
 * Barras agrupadas: ingresos vs gastos por mes.
 */
export function MonthlyBarsChart({ data, className }: MonthlyBarsChartProps) {
  return (
    <div className={`h-64 min-w-0 sm:h-80 ${className ?? ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
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
            cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="ingresos"
            name="Ingresos"
            fill="#10b981"
            radius={[5, 5, 0, 0]}
            maxBarSize={36}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="gastos"
            name="Gastos"
            fill="#f43f5e"
            radius={[5, 5, 0, 0]}
            maxBarSize={36}
            isAnimationActive
            animationDuration={800}
            animationBegin={120}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
