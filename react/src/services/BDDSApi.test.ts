import { describe, it, expect, beforeEach } from 'vitest'
import { DashboardStore } from './DashboardStore'
import { FundsService } from './FundsService'
import { processRawData } from '../utils/processRawData'

/**
 * Integration test for BDDS.Dashboard.loadData API
 * This simulates how external code would use the API
 */
describe('BDDS API Integration', () => {
  beforeEach(() => {
    FundsService.init({ funds: {} })
  })

  it('should support the documented API usage pattern', () => {
    // This is the documented usage from README:
    // BDDS.Dashboard.loadData({ funds: { ... } })

    const testData = {
      funds: {
        'МойФонд': {
          type: 'building' as const,
          periods: {
            "Факт '24": {
              'Поступления по операционной деятельности': 456,
              'Выплата дохода акционерам (пайщикам)': -89,
            },
          },
        },
      },
    }

    // Simulate BDDS.Dashboard.loadData
    DashboardStore.loadData(testData)

    // Verify state
    const state = DashboardStore.getState()
    expect(state.currentFund).toBe('МойФонд')
    expect(state.viewMode).toBe('dynamics')

    // Verify FundsService is updated
    expect(FundsService.getFundsList()).toContain('МойФонд')
    expect(FundsService.getFundType('МойФонд')).toBe('building')

    // Verify period data is generated
    expect(state.periodData.length).toBeGreaterThan(0)
    const period = state.periodData.find(p => p.title.includes('24'))
    expect(period).toBeDefined()
    expect(period?.metrics['Поступления по операционной деятельности']).toBe(456)
  })

  it('should support multiple funds scenario', () => {
    DashboardStore.loadData({
      funds: {
        'Фонд1': {
          type: 'building' as const,
          periods: {
            "Факт '24": { 'Поступления по операционной деятельности': 45 },
          },
        },
        'Фонд2': {
          type: 'warehouse' as const,
          periods: {
            "Факт '24": { 'Поступления по операционной деятельности': -789 },
          },
        },
      },
    })

    // Should select first fund by default
    expect(DashboardStore.getState().currentFund).toBe('Фонд1')

    // Can switch funds
    DashboardStore.setCurrentFund('Фонд2')
    expect(DashboardStore.getState().currentFund).toBe('Фонд2')

    // Data should reflect new fund
    const state = DashboardStore.getState()
    const period = state.periodData.find(p => p.title.includes('24'))
    expect(period?.metrics['Поступления по операционной деятельности']).toBe(-789)
  })

  it('should support view mode switching', () => {
    DashboardStore.loadData({
      funds: {
        'Тест': { type: 'building' as const, periods: {} },
      },
    })

    DashboardStore.setViewMode('details')
    expect(DashboardStore.getState().viewMode).toBe('details')

    DashboardStore.setViewMode('dynamics')
    expect(DashboardStore.getState().viewMode).toBe('dynamics')
  })

  it('should support processRawData for backend transformation', () => {
    // Backend array format
    const backendData = [
      { fund: 'ДВН', year: 2024, income: 100 },
      { fund: 'ДВН', year: 2023, income: 80 },
    ]

    // Custom transform (simulating what user would do)
    const transformed = {
      funds: {} as Record<string, { type: 'building'; periods: Record<string, Record<string, number>> }>,
    }

    backendData.forEach((item) => {
      if (!transformed.funds[item.fund]) {
        transformed.funds[item.fund] = { type: 'building', periods: {} }
      }
      const periodName = "Факт '" + String(item.year).slice(-2)
      transformed.funds[item.fund].periods[periodName] = {
        'Поступления по операционной деятельности': item.income,
      }
    })

    const result = processRawData(transformed)
    expect(result.funds['ДВН']).toBeDefined()
    expect(result.funds['ДВН'].periods["Факт '24"]).toBeDefined()
  })
})
