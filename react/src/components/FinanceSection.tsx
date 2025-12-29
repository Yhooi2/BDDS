import type { Period, ViewMode } from '../types'
import { TableRow } from './TableRow'
import { TableHeaders } from './TableHeaders'
import { HighlightBlock } from './HighlightBlock'
import { SECTIONS, CREDIT_BALANCE_ROWS, CASH_MOVEMENT_ROWS, CASH_BALANCE_ROWS } from '../constants/sections'

interface FinanceSectionProps {
  periods: Period[]
  viewMode: ViewMode
}

export function FinanceSection({ periods, viewMode }: FinanceSectionProps) {
  const section = SECTIONS.finance

  return (
    <section className={`table-section ${section.cssClass}`}>
      <h2 className="table-section__title">{section.title}</h2>
      <TableHeaders periods={periods} viewMode={viewMode} className="table-section__headers" />
      <div className="table-section__content">
        {/* Finance rows */}
        {section.rows.map((row) => (
          <TableRow key={row.id} row={row} periods={periods} viewMode={viewMode} />
        ))}

        {/* Credit balance highlight block */}
        <HighlightBlock rows={CREDIT_BALANCE_ROWS} periods={periods} viewMode={viewMode} />

        {/* Cash movement rows */}
        {CASH_MOVEMENT_ROWS.map((row) => (
          <TableRow key={row.id} row={row} periods={periods} viewMode={viewMode} />
        ))}

        {/* Cash balance highlight block */}
        <HighlightBlock rows={CASH_BALANCE_ROWS} periods={periods} viewMode={viewMode} />
      </div>
    </section>
  )
}
