import { useState, useRef, useEffect } from 'react'
import { FundsService, FUND_ICONS } from '../services/FundsService'
import type { FundGroup } from '../types'

interface FundSelectorProps {
  currentFund: string
  onFundChange: (fund: string) => void
}

export function FundSelector({ currentFund, onFundChange }: FundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const groups = FundsService.getGroups()
  const currentIcon = FundsService.getIcon(currentFund)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleFundClick = (fund: string) => {
    if (fund !== currentFund) {
      onFundChange(fund)
    }
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={`fund-selector ${isOpen ? 'fund-selector--open' : ''}`}
      aria-expanded={isOpen}
    >
      <button
        className="fund-selector__trigger"
        aria-haspopup="listbox"
        aria-label="Выбрать фонд"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <span
          className="fund-selector__icon"
          dangerouslySetInnerHTML={{ __html: currentIcon }}
        />
        <span className="fund-selector__value">{currentFund}</span>
        <span className="fund-selector__arrow">
          <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L11 14L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      <div className="fund-selector__dropdown" role="listbox" aria-label="Список фондов">
        <div className="fund-selector__grid">
          {groups.map((group) => (
            <FundGroup
              key={group.icon}
              group={group}
              currentFund={currentFund}
              onFundClick={handleFundClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FundGroupProps {
  group: FundGroup
  currentFund: string
  onFundClick: (fund: string) => void
}

function FundGroup({ group, currentFund, onFundClick }: FundGroupProps) {
  return (
    <div className="fund-selector__group">
      <span
        className="fund-selector__group-icon"
        dangerouslySetInnerHTML={{ __html: FUND_ICONS[group.icon] }}
      />
      <div className="fund-selector__group-separator" />
      <div className="fund-selector__group-funds">
        {group.funds.map((fund) => (
          <span
            key={fund}
            className={`fund-selector__fund ${fund === currentFund ? 'fund-selector__fund--active' : ''}`}
            onClick={() => onFundClick(fund)}
          >
            {fund}
          </span>
        ))}
      </div>
    </div>
  )
}
