import type { DashboardData, FundGroup, Metrics, Period } from '../types'
import { parsePeriodInfo } from '../utils'

type FundType = 'building' | 'warehouse' | 'briefcase'

export const FUND_ICONS: Record<FundType, string> = {
  warehouse:
    '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 10V19H3V10L11 4L19 10Z" fill="#A9DB21"/><rect x="5" y="12" width="4" height="5" fill="white"/><rect x="13" y="12" width="4" height="5" fill="white"/></svg>',
  building:
    '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3H13V19H4V3Z" fill="#9DBCE0"/><path d="M13 8H18V19H13V8Z" fill="#9DBCE0"/><rect x="6" y="5" width="2" height="2" fill="white"/><rect x="9" y="5" width="2" height="2" fill="white"/><rect x="6" y="9" width="2" height="2" fill="white"/><rect x="9" y="9" width="2" height="2" fill="white"/><rect x="6" y="13" width="2" height="2" fill="white"/><rect x="9" y="13" width="2" height="2" fill="white"/><rect x="14" y="10" width="2" height="2" fill="white"/><rect x="14" y="14" width="2" height="2" fill="white"/></svg>',
  briefcase:
    '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="16" height="11" rx="1" fill="#C7A4C0"/><path d="M8 7V5C8 4.44772 8.44772 4 9 4H13C13.5523 4 14 4.44772 14 5V7" stroke="#C7A4C0" stroke-width="2"/><rect x="10" y="10" width="2" height="4" fill="white"/></svg>',
}

export const FUND_COLORS: Record<FundType, { primary: string; sectionHeader: string; chartFact: string }> = {
  warehouse: {
    primary: '#A9DB21',
    sectionHeader: 'rgba(169, 219, 33, 0.41)',
    chartFact: '#A9DB21',
  },
  building: {
    primary: '#9DBCE0',
    sectionHeader: 'rgba(157, 188, 224, 0.41)',
    chartFact: '#9DBCE0',
  },
  briefcase: {
    primary: '#C7A4C0',
    sectionHeader: 'rgba(199, 164, 192, 0.41)',
    chartFact: '#C7A4C0',
  },
}

const DEFAULT_ICON_TYPE: FundType = 'building'

class FundsServiceClass {
  private _rawData: DashboardData | null = null

  init(rawData: DashboardData): this {
    this._rawData = rawData
    return this
  }

  getFundsList(): string[] {
    if (!this._rawData?.funds) return []
    return Object.keys(this._rawData.funds)
  }

  getDefaultFund(): string | null {
    if (this._rawData?.currentFund) {
      return this._rawData.currentFund
    }
    const funds = this.getFundsList()
    return funds.length > 0 ? funds[0] : null
  }

  getFundType(fundName: string): FundType {
    if (this._rawData?.funds?.[fundName]) {
      return this._rawData.funds[fundName].type || DEFAULT_ICON_TYPE
    }
    return DEFAULT_ICON_TYPE
  }

  getIcon(fundName: string): string {
    const type = this.getFundType(fundName)
    return FUND_ICONS[type] || FUND_ICONS[DEFAULT_ICON_TYPE]
  }

  getColors(fundName: string) {
    const type = this.getFundType(fundName)
    return FUND_COLORS[type] || FUND_COLORS[DEFAULT_ICON_TYPE]
  }

  getGroups(): FundGroup[] {
    const groups: Record<FundType, FundGroup> = {} as Record<FundType, FundGroup>

    this.getFundsList().forEach((fund) => {
      const type = this.getFundType(fund)
      if (!groups[type]) {
        groups[type] = { icon: type, funds: [] }
      }
      groups[type].funds.push(fund)
    })

    return Object.values(groups)
  }

  getPeriods(fundName: string): Record<string, Metrics> {
    if (this._rawData?.funds?.[fundName]) {
      return this._rawData.funds[fundName].periods || {}
    }
    return {}
  }

  getPeriodsList(fundName: string): string[] {
    return Object.keys(this.getPeriods(fundName))
  }

  getAllFundsWithPeriods(): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    this.getFundsList().forEach((fund) => {
      result[fund] = this.getPeriodsList(fund)
    })
    return result
  }

  getDashboardData(fundName: string): Period[] {
    const periods = this.getPeriods(fundName)
    const result = Object.keys(periods).map((label, index) => {
      const info = parsePeriodInfo(label)
      return {
        id: `period-${index}`,
        title: label,
        type: info.type,
        year: info.year,
        metrics: periods[label],
      }
    })

    result.sort((a, b) => a.year - b.year)
    return result
  }
}

export const FundsService = new FundsServiceClass()
