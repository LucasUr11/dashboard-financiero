import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Transaction, TransactionType } from '../types'
import {
  TRANSACCIONES,
  CUENTAS,
  CATEGORIAS,
} from '../data/mockData'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'
import { formatCurrency, formatDate } from '../lib/format'

const PAGE_SIZE = 8

type FiltroTipo = 'TODAS' | TransactionType

interface NuevaTransaccionForm {
  descripcion: string
  monto: string
  tipo: TransactionType
  categoriaId: string
  cuentaId: string
  fecha: string
}

const formInicial: NuevaTransaccionForm = {
  descripcion: '',
  monto: '',
  tipo: 'GASTO',
  categoriaId: '',
  cuentaId: CUENTAS[0]?.id ?? '',
  fecha: new Date().toISOString().slice(0, 10),
}

export function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<Transaction[]>(TRANSACCIONES)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('TODAS')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [pagina, setPagina] = useState(1)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<NuevaTransaccionForm>(formInicial)

  const categoriasGasto = useMemo(
    () => CATEGORIAS.filter((c) => c.tipo === 'GASTO'),
    [],
  )

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return transacciones.filter((txn) => {
      if (filtroTipo !== 'TODAS' && txn.tipo !== filtroTipo) return false
      if (filtroCategoria !== 'todas' && txn.categoriaId !== filtroCategoria)
        return false
      if (texto && !txn.descripcion.toLowerCase().includes(texto)) return false
      return true
    })
  }, [transacciones, busqueda, filtroTipo, filtroCategoria])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const paginaActual = Math.min(pagina, totalPaginas)
  const paginadas = filtradas.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE,
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const monto = Number.parseFloat(form.monto)
    if (!form.descripcion.trim() || !Number.isFinite(monto) || monto <= 0) {
      return
    }
    const nueva: Transaction = {
      id: crypto.randomUUID(),
      descripcion: form.descripcion.trim(),
      monto,
      tipo: form.tipo,
      fecha: new Date(`${form.fecha}T12:00:00`).toISOString(),
      categoriaId: form.categoriaId || null,
      categoria:
        CATEGORIAS.find((c) => c.id === form.categoriaId) ?? null,
      cuentaId: form.cuentaId,
      cuenta: CUENTAS.find((c) => c.id === form.cuentaId) ?? null,
    }
    setTransacciones((prev) => [nueva, ...prev])
    setModalAbierto(false)
    setForm(formInicial)
    setPagina(1)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="min-w-0 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
              placeholder="Buscar por descripción…"
              aria-label="Buscar transacciones"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 p-1 dark:border-slate-700">
              {(
                [
                  { valor: 'TODAS', etiqueta: 'Todas' },
                  { valor: 'INGRESO', etiqueta: 'Ingresos' },
                  { valor: 'GASTO', etiqueta: 'Gastos' },
                ] as const
              ).map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => {
                    setFiltroTipo(opcion.valor)
                    setPagina(1)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    filtroTipo === opcion.valor
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value)
                setPagina(1)
              }}
              aria-label="Filtrar por categoría"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="todas">Todas las categorías</option>
              {categoriasGasto.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Nueva transacción
            </button>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Descripción</th>
                <th className="px-6 py-3 font-medium">Categoría</th>
                <th className="px-6 py-3 font-medium">Cuenta</th>
                <th className="px-6 py-3 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginadas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No se encontraron transacciones con esos filtros.
                  </td>
                </tr>
              )}
              {paginadas.map((txn) => (
                <tr
                  key={txn.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="whitespace-nowrap px-6 py-3.5 text-slate-500 dark:text-slate-400">
                    {formatDate(txn.fecha)}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                    {txn.descripcion}
                  </td>
                  <td className="px-6 py-3.5">
                    {txn.categoria ? (
                      <Badge
                        dot
                        variant={txn.tipo === 'INGRESO' ? 'success' : 'neutral'}
                      >
                        {txn.categoria.nombre}
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Sin categoría</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">
                    {txn.cuenta?.nombre ?? '—'}
                  </td>
                  <td
                    className={cn(
                      'px-6 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap',
                      txn.tipo === 'INGRESO'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white',
                    )}
                  >
                    {txn.tipo === 'INGRESO' ? '+' : '−'}
                    {formatCurrency(txn.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mostrando{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {paginadas.length}
            </strong>{' '}
            de{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {filtradas.length}
            </strong>{' '}
            transacciones
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaActual <= 1}
              aria-label="Página anterior"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {paginaActual} / {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual >= totalPaginas}
              aria-label="Página siguiente"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Modal nueva transacción */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setModalAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Nueva transacción"
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Nueva transacción
              </h2>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label
                  htmlFor="txn-descripcion"
                  className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Descripción
                </label>
                <input
                  id="txn-descripcion"
                  type="text"
                  required
                  maxLength={120}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Ej. Supermercado semanal"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="txn-monto"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Monto (USD)
                  </label>
                  <input
                    id="txn-monto"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={form.monto}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, monto: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="txn-fecha"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Fecha
                  </label>
                  <input
                    id="txn-fecha"
                    type="date"
                    required
                    value={form.fecha}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fecha: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="txn-tipo"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Tipo
                  </label>
                  <select
                    id="txn-tipo"
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        tipo: e.target.value as TransactionType,
                        categoriaId: '',
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="GASTO">Gasto</option>
                    <option value="INGRESO">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="txn-cuenta"
                    className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cuenta
                  </label>
                  <select
                    id="txn-cuenta"
                    value={form.cuentaId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuentaId: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {CUENTAS.map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="txn-categoria"
                  className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Categoría
                </label>
                <select
                  id="txn-categoria"
                  value={form.categoriaId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoriaId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">Sin categoría</option>
                  {(form.tipo === 'GASTO'
                    ? categoriasGasto
                    : CATEGORIAS.filter((c) => c.tipo === 'INGRESO')
                  ).map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
