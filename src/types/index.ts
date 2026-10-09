// Tipos compartidos del dominio financiero.
// Reflejan el esquema Prisma, pero viven en el frontend
// para no acoplar la UI al cliente de Prisma.

export type TransactionType = 'INGRESO' | 'GASTO'
export type AccountType = 'AHORRO' | 'CORRIENTE' | 'TARJETA' | 'EFECTIVO'
export type BudgetPeriod = 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL'

export interface Account {
  id: string
  nombre: string
  tipo: AccountType
  saldo: number
  moneda: string
}

export interface Category {
  id: string
  nombre: string
  color: string
  tipo: TransactionType
}

export interface Transaction {
  id: string
  descripcion: string
  monto: number
  tipo: TransactionType
  fecha: string // ISO 8601
  categoriaId: string | null
  categoria?: Category | null
  cuentaId: string
  cuenta?: Account | null
}

export interface Budget {
  id: string
  categoriaId: string
  categoria?: Category
  limite: number
  periodo: BudgetPeriod
  mes: number
  anio: number
}

export interface PresupuestoConUso extends Budget {
  gastado: number
}

export interface MonthlyFlowPoint {
  mes: string // ej. "2026-04"
  ingresos: number
  gastos: number
}

export interface CategoryTotal {
  categoriaId: string
  nombre: string
  color: string
  total: number
}

export interface ResumenKpis {
  saldoTotal: number
  ingresosMes: number
  gastosMes: number
  ahorroMes: number
}

export interface ResumenData {
  kpis: ResumenKpis
  flujoMensual: MonthlyFlowPoint[]
  gastosPorCategoria: CategoryTotal[]
  transaccionesRecientes: Transaction[]
}
