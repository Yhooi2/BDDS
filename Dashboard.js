/**
 * Dashboard.js - Main Dashboard Component for BDDS Dashboard
 *
 * Orchestrates all components and manages application state
 */

/**
 * Dashboard controller
 */
const Dashboard = {
  // Application state
  state: {
    currentFund: 'ДВН',
    viewMode: 'details',
    periods: [],
    periodData: [],
    chartConfig: {}
  },

  // DOM references
  elements: {
    tableHeaders: null,
    tableSections: null,
    chartContainer: null,
    chartTitle: null
  },

  /**
   * Initialize the dashboard
   */
  init() {
    // Load configuration from window.DATA
    const config = window.DATA || {};

    this.state.currentFund = config.currentFund || 'ДВН';
    this.state.viewMode = config.viewMode || 'details';
    this.state.periods = config.periods || DEFAULT_PERIODS;
    this.state.chartConfig = config.chartConfig || {
      title: 'Выплата дохода акционерам (пайщикам), тыс. ₽',
      metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
      scale: { min: 0, max: 1000, step: 100 },
      customValues: [390, 670, 860, 980]
    };

    // Get DOM elements
    this.elements.tableHeaders = $('#tableHeaderColumns');
    this.elements.tableSections = $('#tableSections');
    this.elements.chartContainer = $('#chartContainer');
    this.elements.chartTitle = $('#chartTitle');

    // Generate initial data
    this.generateData();

    // Initialize components
    this.initComponents();

    // Initial render
    this.render();

    console.log('Dashboard initialized');
  },

  /**
   * Initialize sub-components
   */
  initComponents() {
    // Fund Selector
    FundSelector.init({
      selected: this.state.currentFund,
      funds: window.DATA?.funds || ['ДВН', 'ЗОЛЯ', 'КРАС', 'ЛОГ', 'НОР', 'ОЗН', 'ТРМ', 'СБЛ'],
      onChange: (fund) => this.handleFundChange(fund)
    });

    // View Toggle
    ViewToggle.init({
      mode: this.state.viewMode,
      onChange: (mode) => this.handleViewModeChange(mode)
    });
  },

  /**
   * Generate period data based on current fund
   */
  generateData() {
    const multiplier = getFundMultiplier(this.state.currentFund);
    this.state.periodData = generatePeriodData(this.state.periods, multiplier);
  },

  /**
   * Render the entire dashboard
   */
  render() {
    this.renderTableHeaders();
    this.renderTableSections();
    this.renderChart();
  },

  /**
   * Render table column headers
   */
  renderTableHeaders() {
    if (!this.elements.tableHeaders) return;

    clearElement(this.elements.tableHeaders);

    const headers = renderTableHeaders(this.state.periods, this.state.viewMode);
    while (headers.firstChild) {
      this.elements.tableHeaders.appendChild(headers.firstChild);
    }
  },

  /**
   * Render all table sections
   */
  renderTableSections() {
    if (!this.elements.tableSections) return;

    clearElement(this.elements.tableSections);

    const sections = renderAllTableSections(
      this.state.periodData,
      this.state.viewMode
    );

    this.elements.tableSections.appendChild(sections);
  },

  /**
   * Render the bar chart
   */
  renderChart() {
    if (!this.elements.chartContainer) return;

    clearElement(this.elements.chartContainer);

    // Update chart title if element exists
    if (this.elements.chartTitle) {
      this.elements.chartTitle.textContent = this.state.chartConfig.title;
    }

    // Create chart data
    const chartData = this.state.periods.map((period, index) => ({
      label: period.label.includes('\n') ? `План '${period.shortLabel || '25'}` : period.label,
      value: this.state.chartConfig.customValues?.[index] || 0,
      type: period.type
    }));

    // Render SVG chart
    const svg = renderBarChart(this.state.chartConfig, chartData);
    this.elements.chartContainer.appendChild(svg);
  },

  /**
   * Handle fund change
   * @param {string} fund - New fund name
   */
  handleFundChange(fund) {
    this.state.currentFund = fund;
    this.generateData();
    this.render();
  },

  /**
   * Handle view mode change
   * @param {string} mode - New view mode
   */
  handleViewModeChange(mode) {
    this.state.viewMode = mode;
    this.render();
  },

  /**
   * Update dashboard with new data
   * @param {Object} newData - New data configuration
   */
  updateData(newData) {
    if (newData.periods) {
      this.state.periods = newData.periods;
    }
    if (newData.chartConfig) {
      this.state.chartConfig = { ...this.state.chartConfig, ...newData.chartConfig };
    }
    if (newData.currentFund) {
      this.state.currentFund = newData.currentFund;
      FundSelector.setSelected(newData.currentFund);
    }

    this.generateData();
    this.render();
  },

  /**
   * Get current dashboard state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }
};

/**
 * Initialize dashboard on DOM ready
 */
function initDashboard() {
  Dashboard.init();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  // DOM already loaded
  initDashboard();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dashboard,
    initDashboard
  };
}
