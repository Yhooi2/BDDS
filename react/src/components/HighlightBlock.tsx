import type { Period, RowConfig, ViewMode } from '../types'
import { TableRow } from './TableRow'

interface HighlightBlockProps {
  rows: RowConfig[]
  periods: Period[]
  viewMode: ViewMode
}

export function HighlightBlock({ rows, periods, viewMode }: HighlightBlockProps) {
  return (
    <div className="highlight-block">
      {rows.map((row) => (
        <TableRow key={row.id} row={row} periods={periods} viewMode={viewMode} />
      ))}
    </div>
  )
}
