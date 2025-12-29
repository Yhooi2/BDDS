import { useState, useEffect, useMemo } from 'react'
import { FundSelector, ViewToggle, TableSection, FinanceSection, BarChart, TableHeaders } from './components'
import { FundsService } from './services/FundsService'
import { DEFAULT_DATA } from './data/defaultData'
import { SECTIONS, DEFAULT_CHART_CONFIG } from './constants/sections'
import type { ViewMode, Period, DashboardData } from './types'

// Initialize FundsService with default data
FundsService.init(DEFAULT_DATA)

function App() {
  const [currentFund, setCurrentFund] = useState<string>(FundsService.getDefaultFund() || '')
  const [viewMode, setViewMode] = useState<ViewMode>('details')

  const periodData = useMemo<Period[]>(() => {
    return FundsService.getDashboardData(currentFund)
  }, [currentFund])

  const chartColors = useMemo(() => {
    const colors = FundsService.getColors(currentFund)
    return {
      fact: colors.chartFact,
      plan: DEFAULT_CHART_CONFIG.colors.plan,
    }
  }, [currentFund])

  // Update CSS variable for section header color based on fund type
  useEffect(() => {
    const colors = FundsService.getColors(currentFund)
    document.documentElement.style.setProperty('--color-section-header', colors.sectionHeader)
    document.documentElement.style.setProperty('--color-primary-blue', colors.primary)
  }, [currentFund])

  const handleFundChange = (fund: string) => {
    setCurrentFund(fund)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const tableContentClass = `content__table ${viewMode === 'dynamics' ? 'content__table--dynamics' : ''}`

  return (
    <div className="dashboard-viewport">
      <div className="dashboard">
        <article className="card" role="region" aria-label="Бюджет по фондам">
          {/* Header */}
          <header className="header">
            <div className="header__left">
              <h1 className="header__title">
                Бюджет по фондам, <span className="header__title-unit">млн ₽</span>
              </h1>
              <div className="header__fund-row">
                <FundSelector
                  currentFund={currentFund}
                  onFundChange={handleFundChange}
                />
                <ViewToggle
                  mode={viewMode}
                  onModeChange={handleViewModeChange}
                  className="view-toggle--mobile"
                />
              </div>
            </div>
            <div className="header__right">
              <ViewToggle mode={viewMode} onModeChange={handleViewModeChange} />
            </div>
          </header>

          {/* Content */}
          <div className="content">
            <section className={tableContentClass} aria-label="Таблица бюджета">
              {/* Table header with column titles */}
              <div className="table-header">
                <ViewToggle mode={viewMode} onModeChange={handleViewModeChange} />
                <TableHeaders periods={periodData} viewMode={viewMode} />
              </div>

              {/* Table sections */}
              <TableSection
                section={SECTIONS.operation}
                periods={periodData}
                viewMode={viewMode}
              />
              <TableSection
                section={SECTIONS.investment}
                periods={periodData}
                viewMode={viewMode}
              />
              <FinanceSection periods={periodData} viewMode={viewMode} />
            </section>

            {/* Chart */}
            <section className="content__chart" aria-label="График дивидендов">
              <BarChart
                periods={periodData}
                metric={DEFAULT_CHART_CONFIG.metric}
                title={DEFAULT_CHART_CONFIG.title}
                colors={chartColors}
              />
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}

// Expose API for external use
declare global {
  interface Window {
    BDDS: {
      Dashboard: {
        loadData: (data: DashboardData) => void
        getState: () => { currentFund: string; viewMode: ViewMode; periodData: Period[] }
      }
      FundsService: typeof FundsService
    }
  }
}

export default App
