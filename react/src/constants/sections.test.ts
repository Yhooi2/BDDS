import { describe, it, expect } from 'vitest'
import {
  SECTIONS,
  CREDIT_BALANCE_ROWS,
  CASH_MOVEMENT_ROWS,
  CASH_BALANCE_ROWS,
} from './sections'
import { METRIC_KEYS } from './metricKeys'

describe('sections', () => {
  describe('SECTIONS.operation', () => {
    it('should have correct title', () => {
      expect(SECTIONS.operation.title).toBe('Операционная часть')
    })

    it('should have 4 rows', () => {
      expect(SECTIONS.operation.rows).toHaveLength(4)
    })

    it('should have all required rows in correct order', () => {
      const keys = SECTIONS.operation.rows.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.OPERATION_MOVEMENT,
        METRIC_KEYS.OPERATION_INCOME,
        METRIC_KEYS.OPERATION_EXPENSE,
        METRIC_KEYS.OPERATION_DEPOSITS,
      ])
    })

    it('should have header row as first row', () => {
      expect(SECTIONS.operation.rows[0].isHeader).toBe(true)
    })
  })

  describe('SECTIONS.investment', () => {
    it('should have correct title', () => {
      expect(SECTIONS.investment.title).toBe('Инвестиционная часть')
    })

    it('should have 4 rows', () => {
      expect(SECTIONS.investment.rows).toHaveLength(4)
    })

    it('should have all required rows in correct order', () => {
      const keys = SECTIONS.investment.rows.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.INVESTMENT_MOVEMENT,
        METRIC_KEYS.INVESTMENT_DIVIDENDS,
        METRIC_KEYS.INVESTMENT_ADDITIONAL_SHARES,
        METRIC_KEYS.INVESTMENT_REPAIRS,
      ])
    })

    it('should have header row as first row', () => {
      expect(SECTIONS.investment.rows[0].isHeader).toBe(true)
    })
  })

  describe('SECTIONS.finance', () => {
    it('should have correct title', () => {
      expect(SECTIONS.finance.title).toBe('Финансовая часть')
    })

    it('should have 4 rows', () => {
      expect(SECTIONS.finance.rows).toHaveLength(4)
    })

    it('should have all required rows in correct order', () => {
      const keys = SECTIONS.finance.rows.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.FINANCE_MOVEMENT,
        METRIC_KEYS.FINANCE_CREDITS,
        METRIC_KEYS.FINANCE_OTHER,
        METRIC_KEYS.FINANCE_PARUS,
      ])
    })

    it('should have header row as first row', () => {
      expect(SECTIONS.finance.rows[0].isHeader).toBe(true)
    })
  })

  describe('CREDIT_BALANCE_ROWS', () => {
    it('should have 2 rows', () => {
      expect(CREDIT_BALANCE_ROWS).toHaveLength(2)
    })

    it('should have all required rows in correct order', () => {
      const keys = CREDIT_BALANCE_ROWS.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.CREDIT_START,
        METRIC_KEYS.CREDIT_END,
      ])
    })

    it('should have all rows as headers', () => {
      CREDIT_BALANCE_ROWS.forEach((row) => {
        expect(row.isHeader).toBe(true)
      })
    })
  })

  describe('CASH_MOVEMENT_ROWS', () => {
    it('should have 3 rows', () => {
      expect(CASH_MOVEMENT_ROWS).toHaveLength(3)
    })

    it('should have all required rows in correct order', () => {
      const keys = CASH_MOVEMENT_ROWS.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.CASH_MOVEMENT,
        METRIC_KEYS.RESERVES_FORMED,
        METRIC_KEYS.RESERVES_ACCUMULATED,
      ])
    })

    it('should have header row as first row', () => {
      expect(CASH_MOVEMENT_ROWS[0].isHeader).toBe(true)
    })
  })

  describe('CASH_BALANCE_ROWS', () => {
    it('should have 3 rows', () => {
      expect(CASH_BALANCE_ROWS).toHaveLength(3)
    })

    it('should have all required rows in correct order', () => {
      const keys = CASH_BALANCE_ROWS.map((r) => r.key)
      expect(keys).toEqual([
        METRIC_KEYS.CASH_START,
        METRIC_KEYS.CASH_END,
        METRIC_KEYS.CASH_WITH_RESERVE,
      ])
    })

    it('should have all rows as headers', () => {
      CASH_BALANCE_ROWS.forEach((row) => {
        expect(row.isHeader).toBe(true)
      })
    })
  })

  describe('all metric keys coverage', () => {
    it('should use all METRIC_KEYS in sections', () => {
      const allRows = [
        ...SECTIONS.operation.rows,
        ...SECTIONS.investment.rows,
        ...SECTIONS.finance.rows,
        ...CREDIT_BALANCE_ROWS,
        ...CASH_MOVEMENT_ROWS,
        ...CASH_BALANCE_ROWS,
      ]
      const usedKeys = new Set(allRows.map((r) => r.key))
      const allMetricKeys = Object.values(METRIC_KEYS)

      expect(usedKeys.size).toBe(allMetricKeys.length)
      allMetricKeys.forEach((key) => {
        expect(usedKeys.has(key)).toBe(true)
      })
    })

    it('should have exactly 20 rows total', () => {
      const totalRows =
        SECTIONS.operation.rows.length +
        SECTIONS.investment.rows.length +
        SECTIONS.finance.rows.length +
        CREDIT_BALANCE_ROWS.length +
        CASH_MOVEMENT_ROWS.length +
        CASH_BALANCE_ROWS.length

      expect(totalRows).toBe(20)
    })
  })

  describe('row labels match metric keys', () => {
    const allRows = [
      ...SECTIONS.operation.rows,
      ...SECTIONS.investment.rows,
      ...SECTIONS.finance.rows,
      ...CREDIT_BALANCE_ROWS,
      ...CASH_MOVEMENT_ROWS,
      ...CASH_BALANCE_ROWS,
    ]

    it('each row should have unique id', () => {
      const ids = allRows.map((r) => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('each row should have non-empty label', () => {
      allRows.forEach((row) => {
        expect(row.label.length).toBeGreaterThan(0)
      })
    })

    it('each row key should be valid METRIC_KEY value', () => {
      const validKeys = Object.values(METRIC_KEYS)
      allRows.forEach((row) => {
        expect(validKeys).toContain(row.key)
      })
    })
  })
})
