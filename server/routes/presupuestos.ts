import { Hono } from 'hono'
import { prisma } from '../db'
import { CURRENT_USER_ID } from '../lib/contexto'

export const presupuestosRouter = new Hono()

presupuestosRouter.get('/', async (c) => {
  const anio = Number(c.req.query('anio') ?? String(new Date().getFullYear()))
  const mes = Number(c.req.query('mes') ?? String(new Date().getMonth() + 1))

  const gastos = await prisma.transaccion.groupBy({
    by: ['categoriaId'],
    _sum: { monto: true },
    where: {
      usuarioId: CURRENT_USER_ID,
      tipo: 'GASTO',
      fecha: {
        gte: new Date(anio, mes - 1, 1),
        lt: new Date(anio, mes, 1),
      },
    },
  })

  const gastoPorCategoria = new Map(
    gastos.map((g) => [g.categoriaId, Number(g._sum.monto ?? 0)]),
  )

  const presupuestos = await prisma.presupuesto.findMany({
    where: { usuarioId: CURRENT_USER_ID, anio, mes },
    include: { categoria: true },
    orderBy: { limite: 'desc' },
  })

  return c.json({
    periodo: { anio, mes },
    data: presupuestos.map((p) => ({
      id: p.id,
      categoriaId: p.categoriaId,
      categoria: p.categoria,
      limite: Number(p.limite),
      periodo: p.periodo,
      mes: p.mes,
      anio: p.anio,
      gastado: gastoPorCategoria.get(p.categoriaId) ?? 0,
    })),
  })
})
