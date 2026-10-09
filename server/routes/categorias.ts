import { Hono } from 'hono'
import { prisma } from '../db'

export const categoriasRouter = new Hono()

categoriasRouter.get('/', async (c) => {
  const categorias = await prisma.categoria.findMany({
    orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
  })
  return c.json(categorias)
})
