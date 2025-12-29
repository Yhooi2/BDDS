import { describe, it, expect } from 'vitest'
import { calculateDelta } from './calculateDelta'

describe('calculateDelta', () => {
  it('calculates positive delta correctly', () => {
    expect(calculateDelta(120, 100)).toBe(20)
    expect(calculateDelta(200, 100)).toBe(100)
    expect(calculateDelta(150, 100)).toBe(50)
  })

  it('calculates negative delta correctly', () => {
    expect(calculateDelta(80, 100)).toBe(-20)
    expect(calculateDelta(50, 100)).toBe(-50)
    expect(calculateDelta(0, 100)).toBe(-100)
  })

  it('returns null when current value is null', () => {
    expect(calculateDelta(null, 100)).toBeNull()
  })

  it('returns null when previous value is null', () => {
    expect(calculateDelta(100, null)).toBeNull()
  })

  it('returns null when both values are null', () => {
    expect(calculateDelta(null, null)).toBeNull()
  })

  it('handles zero previous value', () => {
    expect(calculateDelta(100, 0)).toBe(100)
    expect(calculateDelta(0, 0)).toBe(0)
  })

  it('handles negative values correctly', () => {
    // -50 from -100 = (-50 - (-100)) / |-100| * 100 = 50%
    expect(calculateDelta(-50, -100)).toBe(50)
    // -200 from -100 = (-200 - (-100)) / |-100| * 100 = -100%
    expect(calculateDelta(-200, -100)).toBe(-100)
  })

  it('rounds to whole percentages', () => {
    expect(calculateDelta(133, 100)).toBe(33)
    expect(calculateDelta(166, 100)).toBe(66)
  })
})
