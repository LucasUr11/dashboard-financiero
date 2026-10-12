import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Lock, Mail, User, X } from 'lucide-react'
import { useAuth, type UsuarioAuth } from '../../context/AuthContext'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'

type ModoAuth = 'login' | 'registro'

interface AuthFormState {
  nombre: string
  email: string
  contrasena: string
}

type AuthErrors = Partial<Record<keyof AuthFormState, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface AuthModalProps {
  abierto: boolean
  onClose: () => void
}

function validar(form: AuthFormState, modo: ModoAuth): AuthErrors {
  const errores: AuthErrors = {}

  if (modo === 'registro') {
    if (form.nombre.trim().length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
  }
  if (!EMAIL_REGEX.test(form.email.trim())) {
    errores.email = 'Ingresá un email válido'
  }
  if (form.contrasena.length === 0) {
    errores.contrasena = 'La contraseña es obligatoria'
  } else if (modo === 'registro' && form.contrasena.length < 6) {
    errores.contrasena = 'La contraseña debe tener al menos 6 caracteres'
  }

  return errores
}

const INPUT_STYLES =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900'

const INPUT_ERROR_STYLES =
  'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900'

export function AuthModal({ abierto, onClose }: AuthModalProps) {
  const { iniciarSesion, registrarse } = useAuth()
  const [modo, setModo] = useState<ModoAuth>('login')
  const [form, setForm] = useState<AuthFormState>({
    nombre: '',
    email: '',
    contrasena: '',
  })
  const [errores, setErrores] = useState<AuthErrors>({})
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  // Resetear al abrir.
  useEffect(() => {
    if (abierto) {
      setForm({ nombre: '', email: '', contrasena: '' })
      setErrores({})
      setErrorGeneral(null)
      setCargando(false)
    }
  }, [abierto])

  // Cerrar con Escape.
  useEffect(() => {
    if (!abierto) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [abierto, onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorGeneral(null)

    const erroresValidacion = validar(form, modo)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) {
      return
    }

    setCargando(true)
    try {
      let perfil: UsuarioAuth
      if (modo === 'login') {
        perfil = await iniciarSesion(form.email.trim(), form.contrasena)
      } else {
        perfil = await registrarse(form.nombre.trim(), form.email.trim(), form.contrasena)
      }
      void perfil
      onClose()
    } catch {
      setErrorGeneral('No pudimos completar la operación. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  if (!abierto) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={modo === 'login' ? 'Iniciar sesión' : 'Registrarse'}
    >
      <div
        className="w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Card>
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
            {modo === 'registro' && (
              <div>
                <label
                  htmlFor="auth-nombre"
                  className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-nombre"
                    type="text"
                    autoComplete="name"
                    value={form.nombre}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, nombre: event.target.value }))
                    }
                    placeholder="Ej. Juan Pérez"
                    className={cn(
                      INPUT_STYLES,
                      'pl-9',
                      errores.nombre ? INPUT_ERROR_STYLES : '',
                    )}
                  />
                </div>
                {errores.nombre && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errores.nombre}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, email: event.target.value }))
                  }
                  placeholder="tu@email.com"
                  className={cn(
                    INPUT_STYLES,
                    'pl-9',
                    errores.email ? INPUT_ERROR_STYLES : '',
                  )}
                />
              </div>
              {errores.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errores.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="auth-contrasena"
                className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-contrasena"
                  type="password"
                  autoComplete={
                    modo === 'login' ? 'current-password' : 'new-password'
                  }
                  value={form.contrasena}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, contrasena: event.target.value }))
                  }
                  placeholder="••••••••"
                  className={cn(
                    INPUT_STYLES,
                    'pl-9',
                    errores.contrasena ? INPUT_ERROR_STYLES : '',
                  )}
                />
              </div>
              {errores.contrasena && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errores.contrasena}
                </p>
              )}
              {modo === 'registro' && !errores.contrasena && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            {errorGeneral && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400">
                {errorGeneral}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
              {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {/* Toggle login / registro */}
          <div className="border-t border-slate-100 px-6 py-4 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setModo((m) => (m === 'login' ? 'registro' : 'login'))
                  setErrores({})
                  setErrorGeneral(null)
                }}
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
