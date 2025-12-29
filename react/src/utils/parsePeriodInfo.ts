export interface PeriodInfo {
  type: 'fact' | 'plan' | 'mixed'
  year: number
}

export function parsePeriodInfo(periodString: string): PeriodInfo {
  const hasFact = /факт/i.test(periodString)
  const hasPlan = /план/i.test(periodString)

  let type: PeriodInfo['type'] = 'fact'
  if (hasFact && hasPlan) {
    type = 'mixed'
  } else if (hasPlan) {
    type = 'plan'
  }

  const yearMatch = periodString.match(/'(\d{2})/)
  let year = new Date().getFullYear()
  if (yearMatch) {
    year = 2000 + parseInt(yearMatch[1], 10)
  }

  return { type, year }
}
