import type { Period, RowConfig, ViewMode } from '../types'
import { formatNumber, formatWithDelta, calculateDelta } from '../utils'

interface TableRowProps {
  row: RowConfig
  periods: Period[]
  viewMode: ViewMode
}

export function TableRow({ row, periods, viewMode }: TableRowProps) {
  const rowClasses = `table-row ${row.isHeader ? 'table-row--header' : ''}`

  return (
    <div className={rowClasses}>
      <span className="table-row__label">
        {row.multiline ? (
          <span dangerouslySetInnerHTML={{ __html: row.label.replace(/\n/g, '<br>') }} />
        ) : (
          row.label
        )}
      </span>
      <div className="table-row__values">
        {viewMode === 'details' ? (
          <DetailsValues row={row} periods={periods} />
        ) : (
          <DynamicsValues row={row} periods={periods} />
        )}
      </div>
    </div>
  )
}

function DetailsValues({ row, periods }: { row: RowConfig; periods: Period[] }) {
  return (
    <>
      {periods.map((period) => {
        const value = period.metrics[row.key]
        const className = `table-row__value ${period.type === 'mixed' ? 'table-row__value--wide' : ''}`
        return (
          <span key={period.id} className={className}>
            {formatNumber(value)}
          </span>
        )
      })}
    </>
  )
}

function DynamicsValues({ row, periods }: { row: RowConfig; periods: Period[] }) {
  const firstPeriod = periods[0]
  const lastPeriod = periods[periods.length - 1]
  const isSinglePeriod = periods.length === 1

  const value1 = firstPeriod?.metrics[row.key] ?? null
  const value2 = isSinglePeriod ? value1 : (lastPeriod?.metrics[row.key] ?? null)
  const delta = isSinglePeriod ? 0 : calculateDelta(value2, value1)
  const formatted = formatWithDelta(value2, delta)

  return (
    <>
      <span className="table-row__value">{formatNumber(value1)}</span>
      <span className="table-row__value table-row__value--wide">{formatNumber(value2)}</span>
      <span className="table-row__value">
        {formatted.value}
        {formatted.delta !== null && (
          <span className="table-row__delta">{formatted.delta}</span>
        )}
      </span>
    </>
  )
}
