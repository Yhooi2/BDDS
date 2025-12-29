import type { Period, ViewMode } from '../types'

interface TableHeadersProps {
  periods: Period[]
  viewMode: ViewMode
  className?: string
}

export function TableHeaders({ periods, viewMode, className = '' }: TableHeadersProps) {
  if (viewMode === 'details') {
    return (
      <div className={`table-header__columns ${className}`}>
        {periods.map((period) => {
          const isWide = period.type === 'mixed'
          const headerClass = `table-header__column ${isWide ? 'table-header__column--wide' : ''}`
          return (
            <span
              key={period.id}
              className={headerClass}
              dangerouslySetInnerHTML={{ __html: period.title.replace(/\n/g, '<br>') }}
            />
          )
        })}
      </div>
    )
  }

  // Dynamics mode
  const firstPeriod = periods[0]
  const lastPeriod = periods[periods.length - 1]
  const isSinglePeriod = periods.length === 1

  const headers = [
    { label: firstPeriod?.title || '-', wide: firstPeriod?.type === 'mixed' },
    { label: isSinglePeriod ? firstPeriod.title : (lastPeriod?.title || '-'), wide: lastPeriod?.type === 'mixed' },
    { label: 'Дельта', wide: false },
  ]

  return (
    <div className={`table-header__columns ${className}`}>
      {headers.map((header, i) => {
        const headerClass = `table-header__column ${header.wide ? 'table-header__column--wide' : ''}`
        return (
          <span
            key={i}
            className={headerClass}
            dangerouslySetInnerHTML={{ __html: header.label.replace(/\n/g, '<br>') }}
          />
        )
      })}
    </div>
  )
}
