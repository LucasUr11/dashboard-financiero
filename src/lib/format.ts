const LOCALE = 'es-AR'

export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function monthKey(date: Date): string {
  const anio = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  return `${anio}-${mes}`
}

export function monthLabel(key: string): string {
  const [anio, mes] = key.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString(LOCALE, {
    month: 'short',
    year: '2-digit',
  })
}
