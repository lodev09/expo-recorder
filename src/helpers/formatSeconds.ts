export const formatSeconds = (seconds?: number): string => {
  if (typeof seconds === 'undefined') return ''
  return seconds > 3600
    ? `${Number((seconds / 60 / 60).toFixed(1))} hr`
    : `${Number((seconds / 60).toFixed(0))} min` // minutes or hours
}
