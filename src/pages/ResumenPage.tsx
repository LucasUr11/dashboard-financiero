import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowDownLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { CashFlowChart } from '../components/charts/CashFlowChart'
import { SpendingByCategoryChart } from '../components/charts/SpendingByCategoryChart'
import { Badge } from '../components/ui/Badge'
import { CUENTAS, TRANSACCIONES, resumenKPIs, gastosPorCategoriaMes, FLUJO_MENSUAL } from '../data/mockData'
import { formatCurrency, formatDate } from '../lib/format'

const DELTAS_MOCK = {
  ingresos: 12.4,
  gastos: -8.1,
  ahorro: 34.2,
}

export function ResumenPage() {
  const kpis = useMemo(() => resumenKPIs(), [])
  const gastosCategoria = useMemo(() => gastosPorCategoriaMes(), [])
  const recientes = TRANSACCIONES.slice(0, 6)
  const saldoTotalCuentas = CUENTAS.reduce((acc, c) => acc + c.saldo, 0)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo total"
          value={saldoTotalCuentas}
          icon={Wallet}
          delta={DELTAS_MOCK.ahorro}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <StatCard
          label="Ingresos del mes"
          value={kpis.ingresosMes}
          icon={ArrowDownLeft}
          delta={DELTAS_MOCK.ingresos}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          label="Gastos del mes"
          value={kpis.gastosMes}
          icon={TrendingDown}
          delta={DELTAS_MOCK.gastos}
          iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
        <StatCard
          label="Ahorro del mes"
          value={kpis.ahorroMes}
          icon={PiggyBank}
          delta={DELTAS_MOCK.ahorro}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </section>

      {/* Gráficos principales */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Flujo de caja</CardTitle>
            <CardDescription>
              Ingresos vs gastos de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={FLUJO_MENSUAL} />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Gastos por categoría</CardTitle>
            <CardDescription>Distribución del mes en curso</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingByCategoryChart data={gastosCategoria} />
          </CardContent>
        </Card>
      </section>

      {/* Transacciones recientes */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Transacciones recientes</CardTitle>
          <CardDescription>Últimos movimientos registrados</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-3 font-medium">Descripción</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Cuenta</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recientes.map((txn) => (
                  <tr
                    key={txn.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                      {txn.descripcion}
                    </td>
                    <td className="px-6 py-3.5">
                      {txn.categoria ? (
                        <Badge dot variant={txn.tipo === 'INGRESO' ? 'success' : 'neutral'}>
                          {txn.categoria.nombre}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Sin categoría</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">
                      {txn.cuenta?.nombre ?? '—'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">
                      {formatDate(txn.fecha)}
                    </td>
                    <td
                      className={`px-6 py-3.5 text-right font-semibold tabular-nums ${
                        txn.tipo === 'INGRESO'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {txn.tipo === 'INGRESO' ? '+' : '−'}
                      {formatCurrency(txn.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder de métrica adicional */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Tendencia</CardTitle>
          <CardDescription>
            Índice de salud financiera del período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <p>
              Tu tasa de ahorro del mes es del{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {kpis.ingresosMes > 0
                  ? ((kpis.ahorroMes / kpis.ingresosMes) * 100).toFixed(0)
                  : 0}
                %
              </strong>
              . Seguí así para alcanzar tus objetivos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
