import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { FundSelector, ViewToggle, TableSection, FinanceSection, BarChart } from './components'
import { FundsService } from './services/FundsService'
import { DashboardStore } from './services/DashboardStore'
import { DEFAULT_DATA } from './data/defaultData'
import { SECTIONS, DEFAULT_CHART_CONFIG } from './constants/sections'
import { processRawData } from './utils/processRawData'
import { useContainScale } from './hooks/useContainScale'
import type { ViewMode, Period, DashboardData } from './types'

// Initialize FundsService with window.DATA if available, otherwise use default
const initialData =
  (window as unknown as { DATA?: DashboardData }).DATA ?? DEFAULT_DATA;
FundsService.init(initialData);
DashboardStore.init(initialData);

function App() {
  const [currentFund, setCurrentFund] = useState<string>(
    FundsService.getDefaultFund() || ""
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialData.viewMode ?? "dynamics"
  );
  const [, forceUpdate] = useState({});

  // Refs for contain-scale behavior
  const viewportRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Apply contain-scale behavior (desktop: fit entirely, mobile: scale by width)
  useContainScale(dashboardRef, viewportRef);

  // Subscribe to store changes for external data loading
  useEffect(() => {
    const unsubscribe = DashboardStore.subscribe(() => {
      const state = DashboardStore.getState();
      setCurrentFund(state.currentFund);
      setViewMode(state.viewMode);
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const periodData = useMemo<Period[]>(() => {
    return FundsService.getDashboardData(currentFund);
  }, [currentFund]);

  const chartColors = useMemo(() => {
    const colors = FundsService.getColors(currentFund);
    return {
      fact: colors.chartFact,
      plan: DEFAULT_CHART_CONFIG.colors.plan,
    };
  }, [currentFund]);

  // Update CSS variable for section header color based on fund type
  useEffect(() => {
    const colors = FundsService.getColors(currentFund);
    document.documentElement.style.setProperty(
      "--color-section-header",
      colors.sectionHeader
    );
    document.documentElement.style.setProperty(
      "--color-primary-blue",
      colors.primary
    );
  }, [currentFund]);

  const handleFundChange = useCallback((fund: string) => {
    setCurrentFund(fund);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // Expose BDDS API to window
  useEffect(() => {
    window.BDDS = {
      Dashboard: {
        loadData: (data: unknown) => DashboardStore.loadData(data),
        getState: () => ({
          currentFund,
          viewMode,
          periodData,
        }),
        handleFundChange: (fund: string) => {
          setCurrentFund(fund);
        },
        handleViewModeChange: (mode: ViewMode) => {
          setViewMode(mode);
        },
      },
      FundsService,
      processRawData,
    };
  }, [currentFund, viewMode, periodData]);

  const isSinglePeriod = periodData.length === 1;
  const tableContentClass = `content__table ${
    viewMode === "dynamics" ? "content__table--dynamics" : ""
  } ${isSinglePeriod ? "content__table--single" : ""}`;

  return (
    <div className="dashboard-viewport" ref={viewportRef}>
      <div className="dashboard" ref={dashboardRef}>
        <article className="card" role="region" aria-label="Бюджет по фондам">
          {/* Header */}
          <header className="header">
            <div className="header__left">
              <h1 className="header__title">
                Бюджет по фондам,{" "}
                <span className="header__title-unit">млн ₽</span>
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
              <h2 className="chart__title">
                Выплата дохода
                <br />
                акционерам (пайщикам),{" "}
                <span className="header__title-unit">млн ₽</span>
              </h2>
            </div>
          </header>

          {/* Content */}
          <div className="content">
            <section className={tableContentClass} aria-label="Таблица бюджета">
              {/* View toggle */}
              <div className="table-header">
                <ViewToggle
                  mode={viewMode}
                  onModeChange={handleViewModeChange}
                />
              </div>

              {/* Table sections */}
              <TableSection
                section={SECTIONS.operation}
                periods={periodData}
                viewMode={viewMode}
                showHeader={true}
              />
              <TableSection
                section={SECTIONS.investment}
                periods={periodData}
                viewMode={viewMode}
                showHeader={true}
              />
              <FinanceSection periods={periodData} viewMode={viewMode} showHeader={true} />
            </section>

            {/* Chart */}
            <section className="content__chart" aria-label="График дивидендов">
              {/* Mobile chart title (hidden on desktop) */}
              <h2 className="chart__title chart__title--mobile">
                Выплата дохода <br />
                акционерам (пайщикам),{" "}
                <span className="header__title-unit">млн ₽</span>
              </h2>
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
  );
}

// Expose API for external use
declare global {
  interface Window {
    BDDS: {
      Dashboard: {
        loadData: (data: unknown) => void;
        getState: () => {
          currentFund: string;
          viewMode: ViewMode;
          periodData: Period[];
        };
        handleFundChange: (fund: string) => void;
        handleViewModeChange: (mode: ViewMode) => void;
      };
      FundsService: typeof FundsService;
      processRawData: typeof processRawData;
    };
  }
}

export default App;
