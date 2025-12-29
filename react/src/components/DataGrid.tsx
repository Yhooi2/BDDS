import type { Period, RowConfig, ViewMode } from '../types'
import { formatNumber, formatWithDelta, calculateDelta } from '../utils'

interface DataGridProps {
  periods: Period[]
  rows: RowConfig[]
  viewMode: ViewMode
  className?: string
  showHeader?: boolean
}

interface GridHeadersProps {
  periods: Period[]
  viewMode: ViewMode
  className?: string
}

interface Column {
  title: string
  wide: boolean
  isDelta?: boolean
  periodIndex?: number
}

export function getColumns(periods: Period[], viewMode: ViewMode): Column[] {
  if (viewMode === 'details') {
    return periods.map((p, i) => ({
      title: p.title,
      wide: p.type === 'mixed',
      periodIndex: i,
    }))
  }

  // Dynamics mode
  if (periods.length === 1) {
    return [{
      title: periods[0].title,
      wide: periods[0].type === 'mixed',
      periodIndex: 0,
    }]
  }

  const firstPeriod = periods[0]
  const nonPlanPeriods = periods.filter(p => p.type !== 'plan')
  const lastNonPlan = nonPlanPeriods[nonPlanPeriods.length - 1]
  // If only one non-plan period, second column shows dash (no data)
  const hasSecondPeriod = nonPlanPeriods.length > 1

  return [
    { title: firstPeriod.title, wide: firstPeriod.type === 'mixed', periodIndex: 0 },
    { title: hasSecondPeriod ? lastNonPlan.title : '-', wide: hasSecondPeriod && lastNonPlan.type === 'mixed', periodIndex: hasSecondPeriod ? periods.indexOf(lastNonPlan) : -1 },
    { title: 'Дельта', wide: false, isDelta: true },
  ]
}

export function getGridTemplateColumns(periods: Period[], viewMode: ViewMode): string {
  const columns = getColumns(periods, viewMode)
  const columnWidths = columns.map(col => {
    if (col.isDelta) return 'var(--col-delta, 100px)'
    if (col.wide) return 'var(--col-wide, 110px)'
    return 'var(--col-normal, 71px)'
  }).join(' ')
  return `var(--col-label, 1fr) ${columnWidths}`
}

export function GridHeaders({ periods, viewMode, className = '' }: GridHeadersProps) {
  const columns = getColumns(periods, viewMode)
  const gridTemplateColumns = getGridTemplateColumns(periods, viewMode)

  return (
    <div className={`data-grid__header-row ${className}`} style={{ gridTemplateColumns }}>
      <div className="data-grid__label-header" />
      {columns.map((col, i) => (
        <div
          key={i}
          className={`data-grid__column-header ${col.wide ? 'data-grid__column-header--wide' : ''} ${col.isDelta ? 'data-grid__column-header--delta' : ''}`}
          dangerouslySetInnerHTML={{ __html: col.title.replace(/\n/g, '<br>') }}
        />
      ))}
    </div>
  )
}

export function DataGrid({
  periods,
  rows,
  viewMode,
  className = '',
  showHeader = true,
}: DataGridProps) {
  const columns = getColumns(periods, viewMode)
  const gridTemplateColumns = getGridTemplateColumns(periods, viewMode)

  return (
    <div className={`data-grid ${className}`}>
      {showHeader && (
        <GridHeaders periods={periods} viewMode={viewMode} />
      )}

      {rows.map((row) => (
        <div
          key={row.id}
          className={`data-grid__row ${row.isHeader ? 'data-grid__row--header' : ''}`}
          style={{ gridTemplateColumns }}
        >
          <div className="data-grid__label">
            {row.multiline ? (
              <span dangerouslySetInnerHTML={{ __html: row.label.replace(/\n/g, '<br>') }} />
            ) : (
              row.label
            )}
          </div>
          {viewMode === 'details' ? (
            <DetailsValues row={row} periods={periods} columns={columns} />
          ) : (
            <DynamicsValues row={row} periods={periods} columns={columns} />
          )}
        </div>
      ))}
    </div>
  )
}

function DetailsValues({ row, periods, columns }: { row: RowConfig; periods: Period[]; columns: Column[] }) {
  return (
    <>
      {columns.map((col, i) => {
        const period = periods[col.periodIndex!]
        const value = period?.metrics[row.key] ?? null
        return (
          <div
            key={i}
            className={`data-grid__value ${col.wide ? 'data-grid__value--wide' : ''}`}
          >
            {formatNumber(value)}
          </div>
        )
      })}
    </>
  )
}

function DynamicsValues({ row, periods, columns }: { row: RowConfig; periods: Period[]; columns: Column[] }) {
  if (periods.length === 1) {
    const value = periods[0]?.metrics[row.key] ?? null
    return (
      <div className="data-grid__value">{formatNumber(value)}</div>
    )
  }

  const firstPeriod = periods[0]
  const nonPlanPeriods = periods.filter(p => p.type !== 'plan')
  const hasSecondPeriod = nonPlanPeriods.length > 1
  const lastNonPlan = hasSecondPeriod ? nonPlanPeriods[nonPlanPeriods.length - 1] : null

  const value1 = firstPeriod?.metrics[row.key] ?? null
  const value2 = lastNonPlan?.metrics[row.key] ?? null
  const delta = hasSecondPeriod ? calculateDelta(value2, value1) : null
  const formatted = formatWithDelta(value2, delta)

  return (
    <>
      <div className={`data-grid__value ${columns[0].wide ? 'data-grid__value--wide' : ''}`}>
        {formatNumber(value1)}
      </div>
      <div className={`data-grid__value ${columns[1].wide ? 'data-grid__value--wide' : ''}`}>
        {formatNumber(value2)}
      </div>
      <div className="data-grid__value">
        {formatted.value}
        {formatted.delta !== null && (
          <span className="data-grid__delta">{formatted.delta}</span>
        )}
      </div>
    </>
  )
}
