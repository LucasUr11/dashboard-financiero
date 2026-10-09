import type {
  Account,
  Category,
  CategoryTotal,
  MonthlyFlowPoint,
  PresupuestoConUso,
  ResumenKpis,
  Transaction,
} from '../types'
import { monthKey } from '../lib/format'

// ──────────────────────────────────────────────────────────
// Datos de demostración (MVP).
// El backend real ya está implementado en server/ — cuando
// conectes la API, reemplazá estas constantes por llamadas
// a src/lib/api.ts (ver roadmap en README.md).
// ──────────────────────────────────────────────────────────

export const CUENTAS: Account[] = [
  { id: 'acc-corriente', nombre: 'Cuenta Corriente', tipo: 'CORRIENTE', saldo: 24500, moneda: 'USD' },
  { id: 'acc-ahorro', nombre: 'Caja de Ahorro', tipo: 'AHORRO', saldo: 82000, moneda: 'USD' },
  { id: 'acc-tarjeta', nombre: 'Tarjeta de Crédito', tipo: 'TARJETA', saldo: -12500, moneda: 'USD' },
]

export const CATEGORIAS: Category[] = [
  { id: 'cat-sueldo', nombre: 'Sueldo', color: '#10b981', tipo: 'INGRESO' },
  { id: 'cat-freelance', nombre: 'Freelance', color: '#34d399', tipo: 'INGRESO' },
  { id: 'cat-inversiones', nombre: 'Inversiones', color: '#6366f1', tipo: 'INGRESO' },
  { id: 'cat-alimentacion', nombre: 'Alimentación', color: '#f59e0b', tipo: 'GASTO' },
  { id: 'cat-transporte', nombre: 'Transporte', color: '#3b82f6', tipo: 'GASTO' },
  { id: 'cat-vivienda', nombre: 'Vivienda', color: '#8b5cf6', tipo: 'GASTO' },
  { id: 'cat-ocio', nombre: 'Ocio', color: '#ec4899', tipo: 'GASTO' },
  { id: 'cat-salud', nombre: 'Salud', color: '#ef4444', tipo: 'GASTO' },
  { id: 'cat-educacion', nombre: 'Educación', color: '#06b6d4', tipo: 'GASTO' },
]

const categoriaPorId = new Map(CATEGORIAS.map((c) => [c.id, c]))
const cuentaPorId = new Map(CUENTAS.map((c) => [c.id, c]))

interface PlantillaTransaccion {
  descripcion: string
  monto: number
  tipo: 'INGRESO' | 'GASTO'
  categoriaId: string
  cuentaId: string
  dia: number
}

function construirTransacciones(): Transaction[] {
  const ahora = new Date()
  const resultado: Transaction[] = []
  let contador = 0

  for (let m = 5; m >= 0; m--) {
    const base = new Date(ahora.getFullYear(), ahora.getMonth() - m, 1)
    const anio = base.getFullYear()
    const mes = base.getMonth()
    const ultimoDia = new Date(anio, mes + 1, 0).getDate()

    const plantillas: PlantillaTransaccion[] = [
      { descripcion: 'Sueldo mensual', monto: 1850, tipo: 'INGRESO', categoriaId: 'cat-sueldo', cuentaId: 'acc-corriente', dia: 5 },
      { descripcion: 'Proyecto freelance', monto: m % 2 === 0 ? 640 : 380, tipo: 'INGRESO', categoriaId: 'cat-freelance', cuentaId: 'acc-corriente', dia: 12 },
      { descripcion: 'Rendimiento inversiones', monto: 95, tipo: 'INGRESO', categoriaId: 'cat-inversiones', cuentaId: 'acc-ahorro', dia: 18 },
      { descripcion: 'Alquiler', monto: 850, tipo: 'GASTO', categoriaId: 'cat-vivienda', cuentaId: 'acc-corriente', dia: 3 },
      { descripcion: 'Supermercado semanal', monto: 210, tipo: 'GASTO', categoriaId: 'cat-alimentacion', cuentaId: 'acc-tarjeta', dia: 8 },
      { descripcion: 'Supermercado quincenal', monto: 185, tipo: 'GASTO', categoriaId: 'cat-alimentacion', cuentaId: 'acc-tarjeta', dia: 22 },
      { descripcion: 'Subte y colectivos', monto: 68, tipo: 'GASTO', categoriaId: 'cat-transporte', cuentaId: 'acc-corriente', dia: 10 },
      { descripcion: 'Streaming y música', monto: 24.99, tipo: 'GASTO', categoriaId: 'cat-ocio', cuentaId: 'acc-tarjeta', dia: 11 },
      { descripcion: 'Cena con amigos', monto: 72.5, tipo: 'GASTO', categoriaId: 'cat-ocio', cuentaId: 'acc-tarjeta', dia: 16 },
      { descripcion: 'Farmacia', monto: 45, tipo: 'GASTO', categoriaId: 'cat-salud', cuentaId: 'acc-corriente', dia: 14 },
      { descripcion: 'Curso online', monto: 59, tipo: 'GASTO', categoriaId: 'cat-educacion', cuentaId: 'acc-corriente', dia: 20 },
    ]

    for (const t of plantillas) {
      contador += 1
      const fecha = new Date(anio, mes, Math.min(t.dia, ultimoDia))
      resultado.push({
        id: `txn-${contador.toString().padStart(3, '0')}`,
        descripcion: t.descripcion,
        monto: t.monto,
        tipo: t.tipo,
        fecha: fecha.toISOString(),
        categoriaId: t.categoriaId,
        categoria: categoriaPorId.get(t.categoriaId) ?? null,
        cuentaId: t.cuentaId,
        cuenta: cuentaPorId.get(t.cuentaId) ?? null,
      })
    }
  }

  return resultado.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  )
}

export const TRANSACCIONES: Transaction[] = construirTransacciones()

export const FLUJO_MENSUAL: MonthlyFlowPoint[] = (() => {
  const ahora = new Date()
  const puntos: MonthlyFlowPoint[] = []

  for (let m = 5; m >= 0; m--) {
    const base = new Date(ahora.getFullYear(), ahora.getMonth() - m, 1)
    const clave = monthKey(base)
    const delMes = TRANSACCIONES.filter((t) => t.fecha.startsWith(clave))
    const ingresos = delMes
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((acc, t) => acc + t.monto, 0)
    const gastos = delMes
      .filter((t) => t.tipo === 'GASTO')
      .reduce((acc, t) => acc + t.monto, 0)
    puntos.push({ mes: clave, ingresos, gastos })
  }

  return puntos
})()

export function resumenKPIs(): ResumenKpis {
  const ahora = new Date()
  const claveActual = monthKey(ahora)
  const delMes = TRANSACCIONES.filter((t) => t.fecha.startsWith(claveActual))
  const ingresosMes = delMes
    .filter((t) => t.tipo === 'INGRESO')
    .reduce((acc, t) => acc + t.monto, 0)
  const gastosMes = delMes
    .filter((t) => t.tipo === 'GASTO')
    .reduce((acc, t) => acc + t.monto, 0)

  return {
    saldoTotal: CUENTAS.reduce((acc, c) => acc + c.saldo, 0),
    ingresosMes,
    gastosMes,
    ahorroMes: ingresosMes - gastosMes,
  }
}

export function gastosPorCategoriaMes(): CategoryTotal[] {
  const ahora = new Date()
  const claveActual = monthKey(ahora)
  const delMes = TRANSACCIONES.filter(
    (t) => t.fecha.startsWith(claveActual) && t.tipo === 'GASTO',
  )

  const totales = new Map<string, number>()
  for (const t of delMes) {
    if (t.categoriaId === null) continue
    totales.set(t.categoriaId, (totales.get(t.categoriaId) ?? 0) + t.monto)
  }

  return Array.from(totales.entries())
    .map(([categoriaId, total]) => {
      const categoria = categoriaPorId.get(categoriaId)
      return {
        categoriaId,
        nombre: categoria?.nombre ?? 'Sin categoría',
        color: categoria?.color ?? '#64748b',
        total,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function presupuestosConUso(): PresupuestoConUso[] {
  const ahora = new Date()
  const gastos = gastosPorCategoriaMes()
  const gastoPorCategoria = new Map(gastos.map((g) => [g.categoriaId, g.total]))

  const limites: Array<{ categoriaId: string; limite: number }> = [
    { categoriaId: 'cat-alimentacion', limite: 600 },
    { categoriaId: 'cat-transporte', limite: 200 },
    { categoriaId: 'cat-ocio', limite: 250 },
    { categoriaId: 'cat-salud', limite: 150 },
    { categoriaId: 'cat-educacion', limite: 200 },
  ]

  return limites.map((l, i) => {
    const categoria = categoriaPorId.get(l.categoriaId)
    return {
      id: `bud-${i + 1}`,
      categoriaId: l.categoriaId,
      categoria,
      limite: l.limite,
      periodo: 'MENSUAL' as const,
      mes: ahora.getMonth() + 1,
      anio: ahora.getFullYear(),
      gastado: gastoPorCategoria.get(l.categoriaId) ?? 0,
    }
  })
}
