import type { Period, RowConfig, ViewMode } from '../types'
import { DataGrid } from './DataGrid'

interface HighlightBlockProps {
  rows: RowConfig[]
  periods: Period[]
  viewMode: ViewMode
}

export function HighlightBlock({ rows, periods, viewMode }: HighlightBlockProps) {
  return (
    <div className="highlight-block">
      <DataGrid
        periods={periods}
        rows={rows}
        viewMode={viewMode}
        showHeader={false}
      />
    </div>
  )
}
