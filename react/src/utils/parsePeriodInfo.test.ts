import { describe, it, expect } from 'vitest'
import { parsePeriodInfo } from './parsePeriodInfo'

describe('parsePeriodInfo', () => {
  it('parses fact period', () => {
    const result = parsePeriodInfo("Факт '23")
    expect(result.type).toBe('fact')
    expect(result.year).toBe(2023)
  })

  it('parses plan period', () => {
    const result = parsePeriodInfo("План '26")
    expect(result.type).toBe('plan')
    expect(result.year).toBe(2026)
  })

  it('parses mixed period (fact and plan)', () => {
    const result = parsePeriodInfo("Факт (I-III кв. '25)\nПлан (IV кв. '25)")
    expect(result.type).toBe('mixed')
    expect(result.year).toBe(2025)
  })

  it('is case insensitive', () => {
    expect(parsePeriodInfo("ФАКТ '24").type).toBe('fact')
    expect(parsePeriodInfo("ПЛАН '24").type).toBe('plan')
    expect(parsePeriodInfo("факт '24").type).toBe('fact')
  })

  it('extracts year from different formats', () => {
    expect(parsePeriodInfo("Факт '24").year).toBe(2024)
    expect(parsePeriodInfo("Факт '99").year).toBe(2099)
    expect(parsePeriodInfo("Факт '00").year).toBe(2000)
  })

  it('defaults to current year when no year found', () => {
    const result = parsePeriodInfo('Факт')
    expect(result.type).toBe('fact')
    expect(result.year).toBe(new Date().getFullYear())
  })

  it('defaults to fact type when no type keyword found', () => {
    const result = parsePeriodInfo("2025")
    expect(result.type).toBe('fact')
  })
})
