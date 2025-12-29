export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }
  if (isNaN(value)) {
    return '0'
  }

  const absValue = Math.abs(value)
  const formatted = new Intl.NumberFormat('ru-RU', {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(absValue)

  const withRegularSpace = formatted.replace(/\u00A0/g, ' ')
  return value < 0 ? `-${withRegularSpace}` : withRegularSpace
}

export function formatWithDelta(
  value: number | null,
  delta: number | null
): { value: string; delta: string | null } {
  const formattedValue = formatNumber(value)
  if (delta === null || isNaN(delta)) {
    return { value: formattedValue, delta: null }
  }
  const deltaStr = `(${Math.round(delta)}%)`
  return { value: formattedValue, delta: deltaStr }
}

export function formatShort(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return Math.round(value).toString()
}
