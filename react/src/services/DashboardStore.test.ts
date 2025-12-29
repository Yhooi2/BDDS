import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardStore } from './DashboardStore'
import { FundsService } from './FundsService'

describe('DashboardStore', () => {
  beforeEach(() => {
    // Reset FundsService before each test
    FundsService.init({ funds: {} })
  })

  describe('loadData', () => {
    it('should load data and update state', () => {
      const testData = {
        funds: {
          'МойФонд': {
            type: 'building' as const,
            periods: {
              "Факт '24": {
                'Поступления по операционной деятельности': 456,
              },
            },
          },
        },
      }

      DashboardStore.loadData(testData)
      const state = DashboardStore.getState()

      expect(state.currentFund).toBe('МойФонд')
      expect(state.viewMode).toBe('dynamics')
    })

    it('should notify subscribers on loadData', () => {
      const listener = vi.fn()
      const unsubscribe = DashboardStore.subscribe(listener)

      DashboardStore.loadData({
        funds: {
          'Тест': {
            type: 'building' as const,
            periods: {},
          },
        },
      })

      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })

    it('should use currentFund from data if provided', () => {
      DashboardStore.loadData({
        funds: {
          'Фонд1': { type: 'building' as const, periods: {} },
          'Фонд2': { type: 'warehouse' as const, periods: {} },
        },
        currentFund: 'Фонд2',
      })

      expect(DashboardStore.getState().currentFund).toBe('Фонд2')
    })

    it('should use viewMode from data if provided', () => {
      DashboardStore.loadData({
        funds: {
          'Фонд1': { type: 'building' as const, periods: {} },
        },
        viewMode: 'details',
      })

      expect(DashboardStore.getState().viewMode).toBe('details')
    })

    it('should process raw array data', () => {
      DashboardStore.loadData([
        {
          name: 'ТестФонд',
          type: 'warehouse',
          periods: {
            "Факт '24": { metric: 100 },
          },
        },
      ])

      const state = DashboardStore.getState()
      expect(state.currentFund).toBe('ТестФонд')
      expect(FundsService.getFundType('ТестФонд')).toBe('warehouse')
    })
  })

  describe('setCurrentFund', () => {
    it('should update current fund and notify', () => {
      DashboardStore.loadData({
        funds: {
          'Фонд1': { type: 'building' as const, periods: {} },
          'Фонд2': { type: 'warehouse' as const, periods: {} },
        },
      })

      const listener = vi.fn()
      const unsubscribe = DashboardStore.subscribe(listener)

      DashboardStore.setCurrentFund('Фонд2')

      expect(DashboardStore.getState().currentFund).toBe('Фонд2')
      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })
  })

  describe('setViewMode', () => {
    it('should update view mode and notify', () => {
      DashboardStore.loadData({
        funds: {
          'Фонд1': { type: 'building' as const, periods: {} },
        },
      })

      const listener = vi.fn()
      const unsubscribe = DashboardStore.subscribe(listener)

      DashboardStore.setViewMode('details')

      expect(DashboardStore.getState().viewMode).toBe('details')
      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })
  })

  describe('subscribe', () => {
    it('should allow unsubscribing', () => {
      const listener = vi.fn()
      const unsubscribe = DashboardStore.subscribe(listener)

      unsubscribe()

      DashboardStore.loadData({
        funds: { 'Тест': { type: 'building' as const, periods: {} } },
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('getState', () => {
    it('should return a copy of state', () => {
      DashboardStore.loadData({
        funds: { 'Фонд': { type: 'building' as const, periods: {} } },
      })

      const state1 = DashboardStore.getState()
      const state2 = DashboardStore.getState()

      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })
  })
})
