import { intervalToDuration } from 'date-fns'

export const notEmpty = <TValue = unknown>(value: TValue | null | undefined): value is TValue =>
  value !== null && value !== undefined

/**
 * Format time to ISO format
 * Removes hour if zero
 */
export const formatTimer = (ms: number, includeMs: boolean = false) => {
  const sign = ms < 0 ? '-' : ''

  const absMs = Math.abs(ms)
  const duration = intervalToDuration({ start: 0, end: absMs })
  const zeroPad = (num: number) => String(num).padStart(2, '0')

  const format = [
    duration.hours,
    duration.minutes ?? 0,
    duration.seconds ?? 0,
    includeMs ? Math.min(99, Math.round(((absMs / 1000) % 1) * 100)) : undefined,
  ]
    .filter(notEmpty)
    .map(zeroPad)
    .join(':')

  return `${sign}${format}`
}
