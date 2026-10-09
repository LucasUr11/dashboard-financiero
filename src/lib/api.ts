// Cliente HTTP tipado hacia la API (Hono).
// En desarrollo, Vite hace proxy de /api a localhost:3001.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    const detalle = await response.text()
    throw new ApiError(response.status, detalle || `Error HTTP ${response.status}`)
  }

  return (await response.json()) as T
}
