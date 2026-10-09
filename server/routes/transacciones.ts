import { Hono } from 'hono'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../db'
import { CURRENT_USER_ID } from '../lib/contexto'

export const transaccionesRouter = new Hono()

const crearTransaccionSchema = z.object({
  descripcion: z.string().min(1).max(120),
  monto: z.number().positive(),
  tipo: z.enum(['INGRESO', 'GASTO']),
  fecha: z.string().datetime(),
  categoriaId: z.string().nullable().optional(),
  cuentaId: z.string().min(1),
})

type CrearTransaccionInput = z.infer<typeof crearTransaccionSchema>
type PrismaWhere = Prisma.TransaccionWhereInput

transaccionesRouter.get('/', async (c) => {
  const tipo = c.req.query('tipo')
  const categoriaId = c.req.query('categoria')
  const q = c.req.query('q')
  const page = Math.max(1, Number(c.req.query('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, Number(c.req.query('limit') ?? '10')))

  const where: PrismaWhere = {
    usuarioId: CURRENT_USER_ID,
    ...(tipo === 'INGRESO' || tipo === 'GASTO' ? { tipo } : {}),
    ...(categoriaId && categoriaId !== 'todas' ? { categoriaId } : {}),
    ...(q ? { descripcion: { contains: q } } : {}),
  }

  const [total, items] = await Promise.all([
    prisma.transaccion.count({ where }),
    prisma.transaccion.findMany({
      where,
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { categoria: true, cuenta: true },
    }),
  ])

  return c.json({
    data: items,
    pagination: { page, limit, total, totalPaginas: Math.ceil(total / limit) },
  })
})

transaccionesRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parseResult = crearTransaccionSchema.safeParse(body)

  if (!parseResult.success) {
    const mensajes = parseResult.error.issues.map((i) => i.message).join(', ')
    return c.json({ error: `Datos inválidos: ${mensajes}` }, 400)
  }

  const input: CrearTransaccionInput = parseResult.data

  const transaccion = await prisma.transaccion.create({
    data: {
      descripcion: input.descripcion,
      monto: input.monto.toString(),
      tipo: input.tipo,
      fecha: new Date(input.fecha),
      categoriaId: input.categoriaId ?? null,
      cuentaId: input.cuentaId,
      usuarioId: CURRENT_USER_ID,
    },
    include: { categoria: true, cuenta: true },
  })

  return c.json(transaccion, 201)
})
