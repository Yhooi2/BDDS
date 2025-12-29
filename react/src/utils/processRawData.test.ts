import { describe, it, expect } from 'vitest'
import { processRawData } from './processRawData'

describe('processRawData', () => {
  it('should return data as-is if already in dashboard format', () => {
    const dashboardData = {
      funds: {
        'ДВН': {
          type: 'building' as const,
          periods: {
            "Факт '24": {
              'Поступления по операционной деятельности': 456,
            },
          },
        },
      },
    }

    const result = processRawData(dashboardData)
    expect(result).toBe(dashboardData)
  })

  it('should transform array format to dashboard format', () => {
    const arrayData = [
      {
        name: 'ДВН',
        type: 'building',
        periods: {
          "Факт '24": {
            'Поступления по операционной деятельности': 100,
          },
        },
      },
      {
        name: 'ЗОЛЯ',
        category: 'warehouse',
        data: {
          "План '25": {
            'Выплата дохода акционерам (пайщикам)': -200,
          },
        },
      },
    ]

    const result = processRawData(arrayData)

    expect(result.funds).toBeDefined()
    expect(result.funds['ДВН']).toEqual({
      type: 'building',
      periods: {
        "Факт '24": {
          'Поступления по операционной деятельности': 100,
        },
      },
    })
    expect(result.funds['ЗОЛЯ']).toEqual({
      type: 'warehouse',
      periods: {
        "План '25": {
          'Выплата дохода акционерам (пайщикам)': -200,
        },
      },
    })
  })

  it('should handle fund_name property for fund name', () => {
    const data = [
      {
        fund_name: 'МойФонд',
        periods: { "Факт '24": { metric: 123 } },
      },
    ]

    const result = processRawData(data)
    expect(result.funds['МойФонд']).toBeDefined()
  })

  it('should handle fund property for fund name', () => {
    const data = [
      {
        fund: 'ТестФонд',
        periods: { "Факт '24": { metric: 456 } },
      },
    ]

    const result = processRawData(data)
    expect(result.funds['ТестФонд']).toBeDefined()
  })

  it('should default to building type', () => {
    const data = [
      {
        name: 'Фонд1',
        periods: {},
      },
    ]

    const result = processRawData(data)
    expect(result.funds['Фонд1'].type).toBe('building')
  })

  it('should detect warehouse type from category', () => {
    const data = [{ name: 'Склад', category: 'warehouse', periods: {} }]
    const result = processRawData(data)
    expect(result.funds['Склад'].type).toBe('warehouse')
  })

  it('should detect briefcase type from type property', () => {
    const data = [{ name: 'Портфель', type: 'briefcase', periods: {} }]
    const result = processRawData(data)
    expect(result.funds['Портфель'].type).toBe('briefcase')
  })

  it('should return empty funds for unknown format', () => {
    const result = processRawData('invalid data')
    expect(result).toEqual({ funds: {} })
  })

  it('should return empty funds for null', () => {
    const result = processRawData(null)
    expect(result).toEqual({ funds: {} })
  })

  it('should return empty funds for undefined', () => {
    const result = processRawData(undefined)
    expect(result).toEqual({ funds: {} })
  })
})
