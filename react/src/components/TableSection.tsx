import type { Period, SectionConfig, ViewMode } from '../types'
import { DataGrid } from './DataGrid'

interface TableSectionProps {
  section: SectionConfig
  periods: Period[]
  viewMode: ViewMode
  showHeader?: boolean
}

export function TableSection({ section, periods, viewMode, showHeader = false }: TableSectionProps) {
  return (
    <section className={`table-section ${section.cssClass}`}>
      <h2 className="table-section__title">{section.title}</h2>
      <div className="table-section__content">
        <DataGrid
          periods={periods}
          rows={section.rows}
          viewMode={viewMode}
          showHeader={showHeader}
        />
      </div>
    </section>
  )
}
