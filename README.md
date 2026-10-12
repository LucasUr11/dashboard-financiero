# FinHub — Dashboard Financiero

Dashboard financiero moderno construido con **React + TypeScript + Vite + Tailwind CSS**, gráficos con **Recharts** y backend **Prisma ORM sobre Turso (libSQL)** con **Hono** como servidor ligero (sin Express).

---

## 📑 Tabla de contenidos

- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Configuración inicial](#-configuración-inicial)
- [Variables de entorno](#-variables-de-entorno)
- [Comandos](#-comandos)
- [Arquitectura](#-arquitectura)
- [UI: el sidebar colapsable](#-ui-el-sidebar-colapsable)
- [Registro de cambios](#-registro-de-cambios)
- [Roadmap](#-roadmap)

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite 6, Tailwind CSS 4 |
| Gráficos | Recharts (tooltips y animaciones personalizadas) |
| Iconos | Lucide React |
| Backend | Hono + `@hono/node-server` (reemplazo ligero de Express) |
| ORM / DB | Prisma 6 + `@prisma/adapter-libsql` (libSQL) → **Turso** |
| Validación | Zod |
| Utilidades | clsx + tailwind-merge, React Router 7 |

> **Nota de arquitectura:** no se usa SQLite local ni Express. La base de datos es
> **exclusivamente Turso** (SQLite en la nube) y el servidor es **Hono**, un framework
> minimalista y moderno. Si faltan las variables de entorno, la app lanza un error
> explícito en lugar de recurrir a una DB local.

---

## 📂 Estructura del proyecto

```
dashboard-financiero/
├── prisma/
│   ├── schema.prisma        # Esquema: Usuario, Cuenta, Categoria, Transaccion, Presupuesto
│   └── seed.ts              # Datos de demostración (6 meses de historia)
├── public/
│   └── logo.png             # Logo de FinHub usado en el sidebar
├── server/
│   ├── index.ts             # Entrypoint Hono (puerto 3001)
│   ├── db.ts                # Prisma Client con adaptador libSQL (Turso)
│   ├── lib/contexto.ts      # Contexto del usuario actual (MVP)
│   └── routes/
│       ├── resumen.ts       # KPIs, flujo mensual, gastos por categoría
│       ├── transacciones.ts # CRUD + filtros + paginación
│       ├── presupuestos.ts  # Presupuestos con cálculo de uso
│       └── categorias.ts    # Listado de categorías
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Layout (shell)
│   │   ├── ui/              # Card, Badge, ProgressBar, StatCard
│   │   └── charts/          # CashFlow, Bars, Line, Donut, ChartTooltip
│   ├── hooks/               # useCountUp (animación de KPIs)
│   ├── lib/                 # format, utils (cn), api (cliente HTTP tipado)
│   ├── data/mockData.ts     # Datos demo consistentes (MVP)
│   ├── pages/               # Resumen, Dashboard, Transacciones, Presupuestos
│   ├── types/index.ts       # Tipos del dominio (sin `any`)
│   ├── App.tsx              # Rutas con React Router
│   └── main.tsx
├── .env.example             # Plantilla de variables de entorno
└── README.md
```

---

## ⚙️ Configuración inicial

### 1. Requisitos previos

- **Node.js** ≥ 20 y npm
- Cuenta en [Turso](https://turso.tech) con la CLI instalada (`npm i -g @libsql/cli`)

### 2. Crear la base en Turso

```bash
turso db create finhub
turso db show finhub --url          # → libsql://finhub-xxx.turso.io
turso db tokens create finhub       # → token de acceso
```

### 3. Instalar y configurar

```bash
npm install
cp .env.example .env
# Editá .env con tu URL y token de Turso

npm run db:generate   # genera el cliente de Prisma
npm run db:push       # empuja el esquema a Turso
npm run db:seed       # (opcional) datos de demostración
```

### 4. Ejecutar

```bash
npm run dev
# → Frontend: http://localhost:5173  (Vite, con proxy /api → 3001)
# → API:      http://localhost:3001  (Hono)
```

---

## 🔐 Variables de entorno

Ver `.env.example`. Las claves son:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | URL `libsql://` de tu base Turso |
| `TURSO_AUTH_TOKEN` | Token de acceso a Turso |
| `TURSO_DATABASE_URL` | Alias opcional (toma precedencia sobre `DATABASE_URL`) |
| `PORT` | Puerto de la API (por defecto `3001`) |
| `VITE_API_BASE_URL` | Base URL de la API para el cliente; vacío usa el proxy de Vite |

---

## 🚀 Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Frontend + API en paralelo |
| `npm run dev:client` | Solo Vite |
| `npm run dev:server` | Solo API (con hot reload) |
| `npm run build` | Typecheck + build de producción |
| `npm run preview` | Preview del build |
| `npm run typecheck` | Typecheck del frontend (`tsc -b`, strict) |
| `npm run typecheck:server` | Typecheck del backend |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:push` | Sincroniza el esquema con Turso |
| `npm run db:seed` | Siembra datos demo |
| `npm run db:studio` | Prisma Studio |

---

## 🏛️ Arquitectura

### Backend — Prisma + Turso (driver adapter)

La conexión **no usa** el motor SQLite de Prisma sino el driver adapter de libSQL
(`server/db.ts`). El adapter recibe la configuración `{ url, authToken }` y
crea el cliente internamente:

```ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const prisma = new PrismaClient({ adapter })
```

> **Seguridad de build:** el proyecto usa un `overrides` en `package.json` para
> forzar `deepmerge-ts@^8.0.2` (dependencia transitiva de la CLI de Prisma con
> una vulnerabilidad de stack exhaustion). Ejecutar `npm audit` debe reportar
> **0 vulnerabilities**.

### API (Hono)

- `GET /api/health` — salud del servicio
- `GET /api/resumen` — KPIs, flujo de 6 meses, top categorías, últimas transacciones
- `GET /api/transacciones?tipo=&categoria=&q=&page=&limit=` — listado filtrado y paginado
- `POST /api/transacciones` — creación con validación Zod
- `GET /api/presupuestos?mes=&anio=` — presupuestos con gasto calculado
- `GET /api/categorias` — catálogo de categorías

En desarrollo, Vite hace proxy de `/api` al puerto 3001, así que el frontend usa
rutas relativas (ver `vite.config.ts` y `src/lib/api.ts`).

### Frontend

- **Tipado estricto:** `strict: true`, `noUnusedLocals`, `noUnusedParameters` en
  `tsconfig.app.json`. No hay `any` suelto en componentes clave; los tooltips de
  Recharts usan interfaces propias (`ChartTooltipProps`).
- **Datos:** el MVP usa `src/data/mockData.ts` (consistente: los totales se
  derivan de las transacciones). Para conectar la API real, reemplazá las lecturas
  por `apiFetch<T>()` de `src/lib/api.ts` — los endpoints ya existen y devuelven
  exactamente estos tipos.
- **Animaciones:** KPIs con `useCountUp` (ease-out cúbico), gráficos con
  `isAnimationActive` + duraciones y easing configurados, barras de progreso con
  transición CSS de ancho.

---

## 🎨 UI: el sidebar colapsable

El sidebar se oculta/muestra con un botón (dentro del sidebar y en el header)
**sin romper el diseño**:

- **Escritorio (≥1024px):** el sidebar es parte del flujo flex (`lg:static`) y
  anima su ancho entre `w-64` (completo) y `w-20` (solo íconos) con
  `transition-[width,transform]`. El texto colapsa con `w-0 + opacity-0`, por
  lo que nada se desborda.
- **Móvil:** el sidebar es un overlay fijo que entra/sale con `translate-x`, con
  backdrop.
- **Contenido principal:** `min-w-0 flex-1` + tablas con `overflow-x-auto` y
  cards con `min-w-0` → el layout nunca se rompe al animar.
- **Persistencia:** el estado se guarda en `localStorage` (`fhub:sidebar`).

Secciones de la app: **Resumen** (`/`), **Dashboard General** (`/dashboard`),
**Transacciones** (`/transacciones`), **Presupuestos** (`/presupuestos`).

---

## 🌗 Tema (Dark / Light Mode)

El botón de cambio de tema está en la **parte inferior del sidebar** (encima
de la tarjeta de usuario), con íconos **Sol / Luna** que cambian según el
estado actual.

- **Estrategia:** clase `dark` en `<html>` + el variant `@custom-variant dark`
  de Tailwind (ver `src/index.css`). Toda la UI ya usa el prefijo `dark:`.
- **Persistencia:** la preferencia se guarda en `localStorage` bajo la clave
  `fhub:theme` y sobrevive a recargas.
- **Sin flash:** un script inline en `index.html` aplica el tema guardado
  **antes del primer paint**.
- **Respeto al sistema:** si el usuario nunca eligió manualmente, sigue la
  preferencia del sistema (`prefers-color-scheme`) en tiempo real.
- **Hook:** `useTheme()` (`src/hooks/useTheme.ts`) expone
  `{ theme, isDark, toggleTheme }`.

La marca del sidebar usa `public/logo.png`, con proporción preservada mediante
`object-contain`; su ancho se adapta al sidebar expandido o colapsado.

---

## 📝 Registro de cambios

### v0.1.0 — Estructura base (sesión inicial)

**Configuración**
- `package.json` con scripts de dev/build/DB (concurrently + tsx + prisma)
- `tsconfig.json` (project references), `tsconfig.app.json` (strict),
  `tsconfig.node.json`, `tsconfig.server.json`
- `vite.config.ts` con plugin React, Tailwind v4 (`@tailwindcss/vite`) y proxy `/api`
- `index.html` (lang="es", Inter, título FinHub)
- `.env.example` con `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `TURSO_DATABASE_URL`,
  `PORT`, `VITE_API_BASE_URL`
- `.gitignore` (node_modules, dist, `.env*`, `*.db`, …)

**Backend**
- `prisma/schema.prisma`: modelos `Usuario`, `Cuenta`, `Categoria`,
  `Transaccion`, `Presupuesto` con enums, índices y `@@unique` de presupuesto
  por categoría/mes; mapeo a tablas en español
- `server/db.ts`: Prisma + `@prisma/adapter-libsql` (sin SQLite local, sin Express)
- `server/index.ts`: API Hono con CORS, logger y rutas montadas
- `server/routes/*`: resumen (agregaciones + `$queryRaw` con `strftime`),
  transacciones (filtros, paginación, POST validado con Zod), presupuestos
  (gasto calculado con `groupBy`), categorías
- `server/lib/contexto.ts`: `CURRENT_USER_ID` para el MVP (pendiente auth real)
- `prisma/seed.ts`: usuario demo, 3 cuentas, 9 categorías, 6 meses de
  transacciones determinísticas y presupuestos del mes
- **Nota de SQLite:** el esquema no usa native types (`@db.Decimal`,
  `@db.Timestamp`) porque no son soportados por el conector SQLite/libSQL;
  los `Decimal` y `DateTime` funcionan con su mapeo por defecto

**Frontend**
- Tipos de dominio en `src/types/index.ts`; utilidades en `src/lib/`
  (`format`, `cn`, `apiFetch` tipado); `useCountUp` para KPIs
- `src/data/mockData.ts`: datos demo **derivados y consistentes**
- Layout: `Layout` (shell con `min-w-0`), `Sidebar` colapsable con animación de
  ancho + overlay móvil, `Header` con título dinámico por ruta
- Componentes UI: `Card`, `Badge`, `ProgressBar` (color por umbral), `StatCard`
  (conteo animado + delta)
- Gráficos: `ChartTooltip` (tooltip custom tipado), `CashFlowChart` (área con
  gradientes), `SpendingByCategoryChart` (donut + leyenda), `MonthlyBarsChart`
  (barras agrupadas), `BalanceLineChart` (línea con `ReferenceDot` final)
- Páginas: **Resumen** (KPIs, flujo de caja, donut, transacciones recientes),
  **Dashboard General** (tendencias 6 meses, evolución de saldo, tabla de
  categorías vs presupuesto), **Transacciones** (búsqueda, filtros, paginación,
  modal de alta local), **Presupuestos** (resumen global, tarjetas con progreso,
  categorías sin presupuesto)

### v0.1.1 — Hardening y correcciones (misma sesión)

- **Prisma:** removidos native types incompatibles con SQLite/libSQL
  (`@db.Decimal`, `@db.Timestamp`) que bloqueaban `prisma generate`
- **Adapter libSQL:** migrado a la API actual (`new PrismaLibSQL({ url, authToken })`);
  el adapter crea el cliente internamente — se eliminó `@libsql/client` de las
  dependencias top-level (el adapter incluye la suya, evitando desalineación
  de versiones entre `@libsql/client@0.15` y `0.8`)
- **Seguridad:** `overrides` de `deepmerge-ts@^8.0.2` — `npm audit` ahora
  reporta 0 vulnerabilidades
- **Frontend:** corregidos imports relativos de páginas (`../` en vez de `../../`),
  agregado `src/vite-env.d.ts` para `import.meta.env` y módulos CSS, tipado
  estricto en `mockData.ts` (manejo de `categoriaId: string | null`)
- **Build:** comentario CSS corregido a `/* */`, `manualChunks` para separar
  `vendor` (React) y `recharts` en el bundle — build final sin warnings
- **Verificación:** `npm run build` ✅, `npm run typecheck:server` ✅,
  API levantada en runtime con `/api/health` respondiendo 200

### v0.1.2 — Moneda y marca

- **Moneda:** se cambió la moneda predeterminada de la aplicación de USD a ARS
  en los formatos, las cuentas de demostración y el esquema/seed de Prisma.
  Los importes numéricos existentes se conservaron.
- **Logo:** se agregó `public/logo.png` y se reemplazó el ícono de marca de la
  cabecera del sidebar por la imagen, manteniendo sus proporciones con Tailwind.

### v0.2.0 — Botón de cambio de tema (Dark / Light Mode)

- **Hook `useTheme`** (`src/hooks/useTheme.ts`): administra el tema, aplica la
  clase `dark` en `<html>`, persiste la preferencia en `localStorage`
  (clave `fhub:theme`) y sigue al sistema (`prefers-color-scheme`) cuando
  el usuario no eligió manualmente
- **Botón en la base del sidebar** (`src/components/layout/Sidebar.tsx`):
  íconos Sol/Luna que cambien según el estado, con el mismo patrón de
  colapso que los ítems de navegación (solo ícono con el sidebar cerrado)
  y atributos de accesibilidad (`aria-pressed`, `aria-label`)
- **Script anti-flash** en `index.html`: aplica el tema guardado antes del
  primer paint para evitar el destello de modo claro
- **Documentación:** nueva sección "🌗 Tema (Dark / Light Mode)" en este README
- **Verificación:** `npm run build` ✅ (2226 módulos, sin warnings)

---

## 🗺️ Roadmap

- [ ] Autenticación real (JWT/session) para reemplazar `CURRENT_USER_ID`
- [ ] Conectar páginas a la API real vía `src/lib/api.ts` (los endpoints ya existen)
- [ ] Edición/eliminación de transacciones y presupuestos
- [ ] Múltiples monedas y conversión
- [ ] Tests (Vitest + Testing Library) y ESLint
- [ ] Despliegue del frontend (estático) + API en un nodo Turso/Node
- [ ] Migración de Recharts v2 → v3

---

## 📄 Licencia

MIT
