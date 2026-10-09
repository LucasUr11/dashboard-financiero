import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from 'recharts'
import type { MonthlyFlowPoint } from '../../types'
import { formatCompactCurrency, monthLabel } from '../../lib/format'
import { ChartTooltip } from './ChartTooltip'

interface BalanceLineChartProps {
  data: MonthlyFlowPoint[]
  /** Saldo acumulado antes del primer punto. */
  saldoInicial?: number
  className?: string
}

interface PuntoSaldo {
  mes: string
  saldo: number
}

/**
 * Evolución del saldo acumulado (Línea), con punto
 * destacado en el último valor.
 */
export function BalanceLineChart({
  data,
  saldoInicial = 100000,
  className,
}: BalanceLineChartProps) {
  const puntos = useMemo<PuntoSaldo[]>(() => {
    let acumulado = saldoInicial
    return data.map((punto) => {
      acumulado += punto.ingresos - punto.gastos
      return { mes: punto.mes, saldo: Math.round(acumulado) }
    })
  }, [data, saldoInicial])

  const ultimo = puntos[puntos.length - 1]

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={puntos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
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
            domain={['dataMin - 5000', 'dataMax + 5000']}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={12}
          />
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatCompactCurrency(v)} />}
            cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            name="Saldo acumulado"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={false}
            strokeOpacity={1}
            isAnimationActive
            animationDuration={1000}
            animationEasing="ease-out"
          />
          {ultimo && (
            <ReferenceDot
              x={ultimo.mes}
              y={ultimo.saldo}
              r={5}
              fill="#6366f1"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
