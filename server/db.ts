import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const databaseUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!databaseUrl) {
  throw new Error(
    'Falta la variable DATABASE_URL (o TURSO_DATABASE_URL). Revisa tu archivo .env',
  )
}

// PrismaLibSQL crea internamente el cliente libSQL (Turso)
// a partir de la configuración { url, authToken }.
const adapter = new PrismaLibSQL({ url: databaseUrl, authToken })

export const prisma = new PrismaClient({ adapter })
