import { useMemo } from 'react'
import { Target, TrendingUp, CalendarDays } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { presupuestosConUso, gastosPorCategoriaMes } from '../data/mockData'
import { formatCurrency, formatPercent } from '../lib/format'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function PresupuestosPage() {
  const presupuestos = useMemo(() => presupuestosConUso(), [])
  const gastosCategoria = useMemo(() => gastosPorCategoriaMes(), [])

  const resumen = useMemo(() => {
    const presupuestado = presupuestos.reduce((acc, p) => acc + p.limite, 0)
    const gastado = gastosCategoria.reduce((acc, g) => acc + g.total, 0)
    const restante = presupuestado - gastado
    const porcentajeGlobal =
      presupuestado > 0 ? (gastado / presupuestado) * 100 : 0
    return { presupuestado, gastado, restante, porcentajeGlobal }
  }, [presupuestos, gastosCategoria])

  const ahora = new Date()
  const etiquetaPeriodo = `${MESES[ahora.getMonth()]} ${ahora.getFullYear()}`

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Presupuesto mensual</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {etiquetaPeriodo}
                </span>
              </CardDescription>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              {formatPercent(resumen.porcentajeGlobal, 0)} usado
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Presupuestado
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(resumen.presupuestado)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Gastado
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(resumen.gastado)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Restante
              </p>
              <p
                className={`mt-1 text-xl font-bold tabular-nums ${
                  resumen.restante >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(Math.abs(resumen.restante))}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={resumen.porcentajeGlobal} />
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas por categoría */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {presupuestos.map((presupuesto) => {
          const porcentaje =
            presupuesto.limite > 0
              ? (presupuesto.gastado / presupuesto.limite) * 100
              : 0
          const restante = presupuesto.limite - presupuesto.gastado
          const color = presupuesto.categoria?.color ?? '#64748b'

          return (
            <Card key={presupuesto.id} className="min-w-0">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Target className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="truncate">
                        {presupuesto.categoria?.nombre ?? 'Sin categoría'}
                      </CardTitle>
                      <CardDescription>
                        {presupuesto.periodo.charAt(0) +
                          presupuesto.periodo.slice(1).toLowerCase()}{' '}
                        · {MESES[presupuesto.mes - 1]}
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${
                      porcentaje >= 90
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                        : porcentaje >= 60
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}
                  >
                    {formatPercent(porcentaje, 0)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <ProgressBar value={porcentaje} />
                </div>
                <div className="flex items-end justify-between text-sm">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gastado
                    </p>
                    <p className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(presupuesto.gastado)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      de {formatCurrency(presupuesto.limite)}
                    </p>
                    <p
                      className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                        restante >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <TrendingUp
                        className={`h-3.5 w-3.5 ${
                          restante >= 0 ? '' : 'rotate-180'
                        }`}
                      />
                      {formatCurrency(Math.abs(restante))}
                      {restante >= 0 ? ' libres' : ' excedido'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Categorías sin presupuesto */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Sin presupuesto asignado</CardTitle>
          <CardDescription>
            Categorías con gastos este mes que aún no tienen límite definido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const conPresupuesto = new Set(presupuestos.map((p) => p.categoriaId))
            const sinPresupuesto = gastosCategoria.filter(
              (g) => !conPresupuesto.has(g.categoriaId),
            )
            if (sinPresupuesto.length === 0) {
              return (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Todas las categorías con gastos tienen presupuesto asignado.
                </p>
              )
            }
            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sinPresupuesto.map((gasto) => (
                  <div
                    key={gasto.categoriaId}
                    className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: gasto.color }}
                      />
                      <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {gasto.nombre}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(gasto.total)}
                    </span>
                  </div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
