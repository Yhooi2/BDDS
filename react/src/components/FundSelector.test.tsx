import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FundSelector } from './FundSelector'
import { FundsService } from '../services/FundsService'
import { DEFAULT_DATA } from '../data/defaultData'

describe('FundSelector', () => {
  beforeEach(() => {
    FundsService.init(DEFAULT_DATA)
  })

  it('renders current fund name in trigger', () => {
    render(<FundSelector currentFund="ДВН" onFundChange={() => {}} />)
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent('ДВН')
  })

  it('opens dropdown on click', () => {
    render(<FundSelector currentFund="ДВН" onFundChange={() => {}} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const container = trigger.closest('.fund-selector')
    expect(container).toHaveClass('fund-selector--open')
  })

  it('closes dropdown on escape key', () => {
    render(<FundSelector currentFund="ДВН" onFundChange={() => {}} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })

    const container = trigger.closest('.fund-selector')
    expect(container).not.toHaveClass('fund-selector--open')
  })

  it('calls onFundChange when different fund is selected', () => {
    const onFundChange = vi.fn()
    render(<FundSelector currentFund="ДВН" onFundChange={onFundChange} />)

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('ЗОЛЯ'))

    expect(onFundChange).toHaveBeenCalledWith('ЗОЛЯ')
  })

  it('does not call onFundChange when same fund is selected', () => {
    const onFundChange = vi.fn()
    render(<FundSelector currentFund="ДВН" onFundChange={onFundChange} />)

    fireEvent.click(screen.getByRole('button'))
    // Click on the fund in dropdown (not trigger), use getAllByText and pick the dropdown one
    const fundElements = screen.getAllByText('ДВН')
    fireEvent.click(fundElements[fundElements.length - 1])

    expect(onFundChange).not.toHaveBeenCalled()
  })

  it('shows fund groups with icons', () => {
    render(<FundSelector currentFund="ДВН" onFundChange={() => {}} />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getAllByText('ДВН')).toHaveLength(2)
    expect(screen.getByText('ЗОЛЯ')).toBeInTheDocument()
    expect(screen.getByText('КРАС')).toBeInTheDocument()
    expect(screen.getByText('ТРМ')).toBeInTheDocument()
  })
})
