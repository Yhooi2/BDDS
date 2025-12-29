export function calculateDelta(
  currentValue: number | null,
  previousValue: number | null
): number | null {
  if (
    currentValue === null ||
    previousValue === null ||
    typeof currentValue !== 'number' ||
    typeof previousValue !== 'number' ||
    isNaN(currentValue) ||
    isNaN(previousValue)
  ) {
    return null
  }
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100
  }
  return Math.round(
    ((currentValue - previousValue) / Math.abs(previousValue)) * 100
  )
}
