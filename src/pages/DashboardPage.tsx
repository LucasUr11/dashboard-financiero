import { useMemo } from 'react'
import { Scale, Calculator, CalendarRange, Wallet } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MonthlyBarsChart } from '../components/charts/MonthlyBarsChart'
import { BalanceLineChart } from '../components/charts/BalanceLineChart'
import {
  FLUJO_MENSUAL,
  gastosPorCategoriaMes,
  presupuestosConUso,
} from '../data/mockData'
import { formatCurrency, formatPercent } from '../lib/format'

export function DashboardPage() {
  const flujo = FLUJO_MENSUAL
  const gastosCategoria = useMemo(() => gastosPorCategoriaMes(), [])
  const presupuestos = useMemo(() => presupuestosConUso(), [])

  const totales = useMemo(() => {
    const ingresos = flujo.reduce((acc, p) => acc + p.ingresos, 0)
    const gastos = flujo.reduce((acc, p) => acc + p.gastos, 0)
    const mejorMes = flujo.reduce(
      (mejor, p) => (p.ingresos - p.gastos > mejor.neto ? { mes: p.mes, neto: p.ingresos - p.gastos } : mejor),
      { mes: '', neto: -Infinity },
    )
    return {
      ingresos,
      gastos,
      neto: ingresos - gastos,
      promedioAhorro: (ingresos - gastos) / flujo.length,
      mejorMes,
    }
  }, [flujo])

  const presupuestadoTotal = presupuestos.reduce((acc, p) => acc + p.limite, 0)
  const gastadoTotal = gastosCategoria.reduce((acc, g) => acc + g.total, 0)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos (6 meses)"
          value={totales.ingresos}
          icon={Scale}
          delta={8.3}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          label="Gastos (6 meses)"
          value={totales.gastos}
          icon={Calculator}
          delta={-5.2}
          iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
        <StatCard
          label="Balance neto"
          value={totales.neto}
          icon={Wallet}
          delta={11.7}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <StatCard
          label="Ahorro mensual prom."
          value={totales.promedioAhorro}
          icon={CalendarRange}
          delta={4.9}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Ingresos vs gastos</CardTitle>
            <CardDescription>Comparación mensual de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyBarsChart data={flujo} />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Evolución del saldo</CardTitle>
            <CardDescription>
              Saldo acumulado con base inicial de $100.000
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceLineChart data={flujo} saldoInicial={100000} />
          </CardContent>
        </Card>
      </section>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Resumen por categoría</CardTitle>
          <CardDescription>
            Gasto del mes actual frente al presupuesto asignado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 text-right font-medium">Gastado</th>
                  <th className="px-6 py-3 text-right font-medium">Presupuesto</th>
                  <th className="px-6 py-3 font-medium">Uso del presupuesto</th>
                  <th className="px-6 py-3 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {presupuestos.map((presupuesto) => {
                  const porcentaje =
                    presupuesto.limite > 0
                      ? (presupuesto.gastado / presupuesto.limite) * 100
                      : 0
                  return (
                    <tr
                      key={presupuesto.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{
                              backgroundColor:
                                presupuesto.categoria?.color ?? '#64748b',
                            }}
                          />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {presupuesto.categoria?.nombre ?? 'Sin categoría'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(presupuesto.gastado)}
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums text-slate-500 dark:text-slate-400">
                        {formatCurrency(presupuesto.limite)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <ProgressBar
                            value={porcentaje}
                            className="w-full max-w-40"
                          />
                          <span className="w-14 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                            {formatPercent(porcentaje, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            porcentaje >= 90
                              ? 'text-rose-600 dark:text-rose-400'
                              : porcentaje >= 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {porcentaje >= 90
                            ? 'Crítico'
                            : porcentaje >= 60
                              ? 'En límite'
                              : 'Saludable'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                  <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(gastadoTotal)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(presupuestadoTotal)}
                  </td>
                  <td className="px-6 py-3.5">
                    <ProgressBar
                      value={presupuestadoTotal > 0 ? (gastadoTotal / presupuestadoTotal) * 100 : 0}
                      className="w-full max-w-40"
                    />
                  </td>
                  <td className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatPercent(
                      presupuestadoTotal > 0 ? (gastadoTotal / presupuestadoTotal) * 100 : 0,
                      0,
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
