import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ViewToggle } from './ViewToggle'

describe('ViewToggle', () => {
  it('renders button with text for switching to dynamics mode', () => {
    render(<ViewToggle mode="details" onModeChange={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('Динамика по годам')
  })

  it('renders button with text for switching to details mode', () => {
    render(<ViewToggle mode="dynamics" onModeChange={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('Детали за текущий год')
  })

  it('calls onModeChange with dynamics when in details mode', () => {
    const onModeChange = vi.fn()
    render(<ViewToggle mode="details" onModeChange={onModeChange} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onModeChange).toHaveBeenCalledWith('dynamics')
  })

  it('calls onModeChange with details when in dynamics mode', () => {
    const onModeChange = vi.fn()
    render(<ViewToggle mode="dynamics" onModeChange={onModeChange} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onModeChange).toHaveBeenCalledWith('details')
  })

  it('applies custom className', () => {
    render(<ViewToggle mode="details" onModeChange={() => {}} className="custom-class" />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
