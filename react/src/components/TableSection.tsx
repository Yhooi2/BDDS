import type { Period, SectionConfig, ViewMode } from '../types'
import { TableRow } from './TableRow'
import { TableHeaders } from './TableHeaders'

interface TableSectionProps {
  section: SectionConfig
  periods: Period[]
  viewMode: ViewMode
}

export function TableSection({ section, periods, viewMode }: TableSectionProps) {
  return (
    <section className={`table-section ${section.cssClass}`}>
      <h2 className="table-section__title">{section.title}</h2>
      <div className="table-section__headers">
        <TableHeaders periods={periods} viewMode={viewMode} />
      </div>
      <div className="table-section__content">
        {section.rows.map((row) => (
          <TableRow key={row.id} row={row} periods={periods} viewMode={viewMode} />
        ))}
      </div>
    </section>
  )
}
