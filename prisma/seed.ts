import { PrismaClient, TipoCuenta, TipoTransaccion, PeriodoPresupuesto } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const databaseUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL. Configurá tu .env antes de correr el seed.')
}

const prisma = new PrismaClient({
  adapter: new PrismaLibSQL({ url: databaseUrl, authToken }),
})

const USER_ID = 'user-demo'

interface PlantillaTransaccion {
  descripcion: string
  monto: string
  tipo: TipoTransaccion
  categoriaId: string
  cuentaId: string
  dia: number
}

async function main() {
  console.log('🌱 Sembrando datos de demostración en Turso…')

  await prisma.transaccion.deleteMany()
  await prisma.presupuesto.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.cuenta.deleteMany()
  await prisma.usuario.deleteMany()

  const usuario = await prisma.usuario.create({
    data: { id: USER_ID, email: 'demo@fhub.local', nombre: 'Alex Demo' },
  })

  const cuentas = await Promise.all([
    prisma.cuenta.create({
      data: { nombre: 'Cuenta Corriente', tipo: TipoCuenta.CORRIENTE, saldo: '24500.00', moneda: 'ARS', usuarioId: usuario.id },
    }),
    prisma.cuenta.create({
      data: { nombre: 'Caja de Ahorro', tipo: TipoCuenta.AHORRO, saldo: '82000.00', moneda: 'ARS', usuarioId: usuario.id },
    }),
    prisma.cuenta.create({
      data: { nombre: 'Tarjeta de Crédito', tipo: TipoCuenta.TARJETA, saldo: '-12500.00', moneda: 'ARS', usuarioId: usuario.id },
    }),
  ])

  const categorias = await Promise.all([
    prisma.categoria.create({ data: { nombre: 'Sueldo', color: '#10b981', tipo: TipoTransaccion.INGRESO } }),
    prisma.categoria.create({ data: { nombre: 'Freelance', color: '#34d399', tipo: TipoTransaccion.INGRESO } }),
    prisma.categoria.create({ data: { nombre: 'Inversiones', color: '#6366f1', tipo: TipoTransaccion.INGRESO } }),
    prisma.categoria.create({ data: { nombre: 'Alimentación', color: '#f59e0b', tipo: TipoTransaccion.GASTO } }),
    prisma.categoria.create({ data: { nombre: 'Transporte', color: '#3b82f6', tipo: TipoTransaccion.GASTO } }),
    prisma.categoria.create({ data: { nombre: 'Vivienda', color: '#8b5cf6', tipo: TipoTransaccion.GASTO } }),
    prisma.categoria.create({ data: { nombre: 'Ocio', color: '#ec4899', tipo: TipoTransaccion.GASTO } }),
    prisma.categoria.create({ data: { nombre: 'Salud', color: '#ef4444', tipo: TipoTransaccion.GASTO } }),
    prisma.categoria.create({ data: { nombre: 'Educación', color: '#06b6d4', tipo: TipoTransaccion.GASTO } }),
  ])

  const [sueldo, freelance, inversiones, alimentacion, transporte, vivienda, ocio, salud, educacion] =
    categorias
  const [corriente, ahorro, tarjeta] = cuentas

  const ahora = new Date()

  const construirPlantillas = (m: number): PlantillaTransaccion[] => [
    { descripcion: 'Sueldo mensual', monto: '1850.00', tipo: TipoTransaccion.INGRESO, categoriaId: sueldo.id, cuentaId: corriente.id, dia: 5 },
    { descripcion: 'Proyecto freelance', monto: m % 2 === 0 ? '640.00' : '380.00', tipo: TipoTransaccion.INGRESO, categoriaId: freelance.id, cuentaId: corriente.id, dia: 12 },
    { descripcion: 'Rendimiento inversiones', monto: '95.00', tipo: TipoTransaccion.INGRESO, categoriaId: inversiones.id, cuentaId: ahorro.id, dia: 18 },
    { descripcion: 'Alquiler', monto: '850.00', tipo: TipoTransaccion.GASTO, categoriaId: vivienda.id, cuentaId: corriente.id, dia: 3 },
    { descripcion: 'Supermercado semanal', monto: '210.00', tipo: TipoTransaccion.GASTO, categoriaId: alimentacion.id, cuentaId: tarjeta.id, dia: 8 },
    { descripcion: 'Supermercado quincenal', monto: '185.00', tipo: TipoTransaccion.GASTO, categoriaId: alimentacion.id, cuentaId: tarjeta.id, dia: 22 },
    { descripcion: 'Subte y colectivos', monto: '68.00', tipo: TipoTransaccion.GASTO, categoriaId: transporte.id, cuentaId: corriente.id, dia: 10 },
    { descripcion: 'Streaming y música', monto: '24.99', tipo: TipoTransaccion.GASTO, categoriaId: ocio.id, cuentaId: tarjeta.id, dia: 11 },
    { descripcion: 'Cena con amigos', monto: '72.50', tipo: TipoTransaccion.GASTO, categoriaId: ocio.id, cuentaId: tarjeta.id, dia: 16 },
    { descripcion: 'Farmacia', monto: '45.00', tipo: TipoTransaccion.GASTO, categoriaId: salud.id, cuentaId: corriente.id, dia: 14 },
    { descripcion: 'Curso online', monto: '59.00', tipo: TipoTransaccion.GASTO, categoriaId: educacion.id, cuentaId: corriente.id, dia: 20 },
  ]

  // 6 meses de historia (incluye el mes en curso)
  for (let m = 5; m >= 0; m--) {
    const base = new Date(ahora.getFullYear(), ahora.getMonth() - m, 1)
    const anio = base.getFullYear()
    const mes = base.getMonth()
    const ultimoDia = new Date(anio, mes + 1, 0).getDate()
    const plantillas = construirPlantillas(m)

    for (const t of plantillas) {
      await prisma.transaccion.create({
        data: {
          descripcion: t.descripcion,
          monto: t.monto,
          tipo: t.tipo,
          fecha: new Date(anio, mes, Math.min(t.dia, ultimoDia)),
          categoriaId: t.categoriaId,
          cuentaId: t.cuentaId,
          usuarioId: usuario.id,
        },
      })
    }
  }

  // Presupuestos del mes en curso
  await Promise.all([
    prisma.presupuesto.create({
      data: { limite: '600.00', periodo: PeriodoPresupuesto.MENSUAL, mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), categoriaId: alimentacion.id, usuarioId: usuario.id },
    }),
    prisma.presupuesto.create({
      data: { limite: '200.00', periodo: PeriodoPresupuesto.MENSUAL, mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), categoriaId: transporte.id, usuarioId: usuario.id },
    }),
    prisma.presupuesto.create({
      data: { limite: '250.00', periodo: PeriodoPresupuesto.MENSUAL, mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), categoriaId: ocio.id, usuarioId: usuario.id },
    }),
    prisma.presupuesto.create({
      data: { limite: '150.00', periodo: PeriodoPresupuesto.MENSUAL, mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), categoriaId: salud.id, usuarioId: usuario.id },
    }),
    prisma.presupuesto.create({
      data: { limite: '200.00', periodo: PeriodoPresupuesto.MENSUAL, mes: ahora.getMonth() + 1, anio: ahora.getFullYear(), categoriaId: educacion.id, usuarioId: usuario.id },
    }),
  ])

  console.log('✅ Seed completado: usuario demo, 3 cuentas, 9 categorías, 6 meses de transacciones y presupuestos.')
}

main()
  .catch((error: unknown) => {
    console.error('Error en el seed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
