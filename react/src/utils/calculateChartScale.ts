export interface ChartScale {
  min: number
  max: number
  step: number
}

export function calculateChartScale(maxValue: number): ChartScale {
  const DIVISIONS = 5

  if (maxValue <= 0) {
    return { min: 0, max: 100, step: 20 }
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)))
  const normalized = maxValue / magnitude

  const niceMultipliers = [1, 1.5, 2, 2.5, 5, 10]
  let niceMax = magnitude * 10
  for (const multiplier of niceMultipliers) {
    if (normalized <= multiplier) {
      niceMax = magnitude * multiplier
      break
    }
  }

  const step = niceMax / DIVISIONS

  return { min: 0, max: niceMax, step }
}
