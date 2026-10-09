import { cn } from '../../lib/utils'

type ProgressColor = 'auto' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate'

interface ProgressBarProps {
  /** Valor entre 0 y 100. */
  value: number
  color?: ProgressColor
  className?: string
  barClassName?: string
}

const COLOR_STYLES: Record<Exclude<ProgressColor, 'auto'>, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  indigo: 'bg-indigo-500',
  slate: 'bg-slate-500',
}

function colorAuto(porcentaje: number): Exclude<ProgressColor, 'auto'> {
  if (porcentaje < 60) return 'emerald'
  if (porcentaje < 90) return 'amber'
  return 'rose'
}

export function ProgressBar({
  value,
  color = 'auto',
  className,
  barClassName,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const resolucion = color === 'auto' ? colorAuto(clamped) : color

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          COLOR_STYLES[resolucion],
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
