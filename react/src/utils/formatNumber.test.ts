import { describe, it, expect } from 'vitest'
import { formatNumber, formatWithDelta, formatShort } from './formatNumber'

describe('formatNumber', () => {
  it('formats positive integers with space separators', () => {
    expect(formatNumber(1234567)).toBe('1 234 567')
    expect(formatNumber(1000)).toBe('1 000')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats negative integers with minus sign', () => {
    expect(formatNumber(-1234567)).toBe('-1 234 567')
    expect(formatNumber(-1000)).toBe('-1 000')
    expect(formatNumber(-999)).toBe('-999')
  })

  it('returns dash for null', () => {
    expect(formatNumber(null)).toBe('-')
  })

  it('returns dash for undefined', () => {
    expect(formatNumber(undefined)).toBe('-')
  })

  it('returns 0 for NaN', () => {
    expect(formatNumber(NaN)).toBe('0')
  })

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatWithDelta', () => {
  it('returns formatted value and delta percentage', () => {
    const result = formatWithDelta(1000, 25)
    expect(result.value).toBe('1 000')
    expect(result.delta).toBe('(25%)')
  })

  it('wraps delta in parentheses', () => {
    expect(formatWithDelta(100, 1)?.delta).toBe('(1%)')
    expect(formatWithDelta(100, 100)?.delta).toBe('(100%)')
    expect(formatWithDelta(100, -50)?.delta).toBe('(-50%)')
  })

  it('returns null delta when delta is null', () => {
    const result = formatWithDelta(1000, null)
    expect(result.value).toBe('1 000')
    expect(result.delta).toBeNull()
  })

  it('handles null value', () => {
    const result = formatWithDelta(null, 25)
    expect(result.value).toBe('-')
    expect(result.delta).toBe('(25%)')
  })
})

describe('formatShort', () => {
  it('returns rounded integer as string', () => {
    expect(formatShort(1234.56)).toBe('1235')
    expect(formatShort(1234.4)).toBe('1234')
  })

  it('returns 0 for null', () => {
    expect(formatShort(null)).toBe('0')
  })

  it('returns 0 for undefined', () => {
    expect(formatShort(undefined)).toBe('0')
  })

  it('returns 0 for NaN', () => {
    expect(formatShort(NaN)).toBe('0')
  })
})
