import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { resumenRouter } from './routes/resumen'
import { transaccionesRouter } from './routes/transacciones'
import { presupuestosRouter } from './routes/presupuestos'
import { categoriasRouter } from './routes/categorias'

const app = new Hono()
const PORT = Number(process.env.PORT) || 3001

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
)

app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
)

app.route('/api/transacciones', transaccionesRouter)
app.route('/api/resumen', resumenRouter)
app.route('/api/presupuestos', presupuestosRouter)
app.route('/api/categorias', categoriasRouter)

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`✅ API FinHub escuchando en http://localhost:${info.port}`)
})
