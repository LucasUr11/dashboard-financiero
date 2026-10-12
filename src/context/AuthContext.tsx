import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface UsuarioAuth {
  nombre: string
  email: string
}

interface AuthContextValue {
  usuario: UsuarioAuth | null
  isAuthenticated: boolean
  /** Simula el inicio de sesión. Acepta cualquier credencial con formato válido (MVP). */
  iniciarSesion: (email: string, contrasena: string) => Promise<UsuarioAuth>
  /** Simula el registro. */
  registrarse: (nombre: string, email: string, contrasena: string) => Promise<UsuarioAuth>
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'fhub:auth'
const SIMULATED_DELAY_MS = 700

function restaurarSesion(): UsuarioAuth | null {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    return guardado ? (JSON.parse(guardado) as UsuarioAuth) : null
  } catch {
    return null
  }
}

/** Deriva un nombre amigable a partir del email (ej. "juan.perez" → "Juan Perez"). */
function nombreDesdeEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const nombre = local
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
  return nombre.length > 0 ? nombre : 'Usuario'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(restaurarSesion)

  // Persistir la sesión (solo el perfil, NUNCA la contraseña).
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [usuario])

  const iniciarSesion = useCallback(
    async (email: string, _contrasena: string): Promise<UsuarioAuth> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS))
      // Simulación MVP: cualquier credencial con formato válido inicia sesión.
      const perfil: UsuarioAuth = { nombre: nombreDesdeEmail(email), email }
      setUsuario(perfil)
      return perfil
    },
    [],
  )

  const registrarse = useCallback(
    async (nombre: string, email: string, _contrasena: string): Promise<UsuarioAuth> => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS))
      const perfil: UsuarioAuth = { nombre, email }
      setUsuario(perfil)
      return perfil
    },
    [],
  )

  const cerrarSesion = useCallback(() => {
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: usuario !== null,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}
