import { Hono } from 'hono'
import { prisma } from '../db'
import { CURRENT_USER_ID } from '../lib/contexto'

export const resumenRouter = new Hono()

type FilaFlujo = { mes: string; ingresos: string | number; gastos: string | number }

interface PuntoFlujo {
  mes: string
  ingresos: number
  gastos: number
}

async function flujoMensual(): Promise<PuntoFlujo[]> {
  const filas = await prisma.$queryRaw<FilaFlujo[]>`
    SELECT strftime('%Y-%m', "fecha") AS "mes",
      SUM(CASE WHEN "tipo" = 'INGRESO' THEN "monto" ELSE 0 END) AS "ingresos",
      SUM(CASE WHEN "tipo" = 'GASTO' THEN "monto" ELSE 0 END) AS "gastos"
    FROM "Transaccion"
    WHERE "usuarioId" = ${CURRENT_USER_ID}
    GROUP BY "mes"
    ORDER BY "mes" DESC
    LIMIT 6
  `
  return filas
    .map((f) => ({ mes: f.mes, ingresos: Number(f.ingresos), gastos: Number(f.gastos) }))
    .reverse()
}

async function totalesPorCategoria(mes: number, anio: number) {
  const filas = await prisma.$queryRaw<
    Array<{ categoriaId: string; nombre: string; color: string; total: string | number }>
  >`
    SELECT c.id AS "categoriaId", c.nombre AS "nombre", c.color AS "color",
      SUM(t."monto") AS "total"
    FROM "Transaccion" t
    JOIN "Categoria" c ON c.id = t."categoriaId"
    WHERE t."usuarioId" = ${CURRENT_USER_ID}
      AND t.tipo = 'GASTO'
      AND CAST(strftime('%m', t."fecha") AS INTEGER) = ${mes}
      AND CAST(strftime('%Y', t."fecha") AS INTEGER) = ${anio}
    GROUP BY c.id, c.nombre, c.color
    ORDER BY total DESC
  `
  return filas.map((f) => ({
    categoriaId: f.categoriaId,
    nombre: f.nombre,
    color: f.color,
    total: Number(f.total),
  }))
}

resumenRouter.get('/', async (c) => {
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59)

  const [saldoCuentas, ingresosMes, gastosMes, recientes, flujo, categorias] =
    await Promise.all([
      prisma.cuenta.aggregate({
        _sum: { saldo: true },
        where: { usuarioId: CURRENT_USER_ID },
      }),
      prisma.transaccion.aggregate({
        _sum: { monto: true },
        where: {
          usuarioId: CURRENT_USER_ID,
          tipo: 'INGRESO',
          fecha: { gte: inicioMes, lte: finMes },
        },
      }),
      prisma.transaccion.aggregate({
        _sum: { monto: true },
        where: {
          usuarioId: CURRENT_USER_ID,
          tipo: 'GASTO',
          fecha: { gte: inicioMes, lte: finMes },
        },
      }),
      prisma.transaccion.findMany({
        where: { usuarioId: CURRENT_USER_ID },
        orderBy: { fecha: 'desc' },
        take: 5,
        include: { categoria: true, cuenta: true },
      }),
      flujoMensual(),
      totalesPorCategoria(ahora.getMonth() + 1, ahora.getFullYear()),
    ])

  const ingresos = Number(ingresosMes._sum.monto ?? 0)
  const gastos = Number(gastosMes._sum.monto ?? 0)

  return c.json({
    kpis: {
      saldoTotal: Number(saldoCuentas._sum.saldo ?? 0),
      ingresosMes: ingresos,
      gastosMes: gastos,
      ahorroMes: ingresos - gastos,
    },
    flujoMensual: flujo,
    gastosPorCategoria: categorias,
    transaccionesRecientes: recientes,
  })
})
