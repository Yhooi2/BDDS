import type { Period, ViewMode } from '../types'
import { DataGrid } from './DataGrid'
import { HighlightBlock } from './HighlightBlock'
import { SECTIONS, CREDIT_BALANCE_ROWS, CASH_MOVEMENT_ROWS, CASH_BALANCE_ROWS } from '../constants/sections'

interface FinanceSectionProps {
  periods: Period[]
  viewMode: ViewMode
  showHeader?: boolean
}

export function FinanceSection({ periods, viewMode, showHeader = false }: FinanceSectionProps) {
  const section = SECTIONS.finance

  return (
    <section className={`table-section ${section.cssClass}`}>
      <h2 className="table-section__title">{section.title}</h2>
      <div className="table-section__content">
        {/* Finance rows */}
        <DataGrid
          periods={periods}
          rows={section.rows}
          viewMode={viewMode}
          showHeader={showHeader}
        />

        {/* Credit balance highlight block */}
        <HighlightBlock rows={CREDIT_BALANCE_ROWS} periods={periods} viewMode={viewMode} />

        {/* Cash movement rows */}
        <DataGrid
          periods={periods}
          rows={CASH_MOVEMENT_ROWS}
          viewMode={viewMode}
          showHeader={false}
        />

        {/* Cash balance highlight block */}
        <HighlightBlock rows={CASH_BALANCE_ROWS} periods={periods} viewMode={viewMode} />
      </div>
    </section>
  )
}
