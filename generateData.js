/**
 * generateData.js - Data generation utilities for BDDS Dashboard
 *
 * Generates period data from input array with configurable multipliers
 */

/**
 * All metric keys used in the dashboard
 */
const METRIC_KEYS = {
  // Operational Activity Section
  OPERATION_MOVEMENT: 'Движение Д/С по операционной деятельности ООО',
  OPERATION_INCOME: 'Поступления по операционной деятельности',
  OPERATION_EXPENSE: 'Расходы по основной деятельности',
  OPERATION_DEPOSITS: 'Обеспечительные платежи',

  // Investment Activity Section
  INVESTMENT_MOVEMENT: 'Движение Д/С по инвестиционной деятельности',
  INVESTMENT_DIVIDENDS: 'Выплата дохода акционерам (пайщикам)',
  INVESTMENT_REPAIRS: 'Расходы на капитальный ремонт',

  // Financial Activity Section
  FINANCE_MOVEMENT: 'Движение Д/С по финансовой деятельности',
  FINANCE_CREDITS: 'Расчеты по кредитам',
  FINANCE_OTHER: 'Прочие доходы и расходы по финансовой деятельности',
  FINANCE_PARUS: 'Расходы на УК Парус',

  // Credit Balance Block
  CREDIT_START: 'Остаток по кредиту на начало периода',
  CREDIT_END: 'Остаток по кредиту на конец периода',

  // Cash Movement Section
  CASH_MOVEMENT: 'Движение за период по Д/С',
  RESERVES_FORMED: 'Сформированные резервы (нарастающим итогом)',
  RESERVES_ACCUMULATED: 'Накопленные резервы на ремонт, непредвиденные расходы и вакансию',

  // Cash Balance Block
  CASH_START: 'Остаток Д/С на начало периода',
  CASH_END: 'Остаток Д/С на конец периода',
  CASH_WITH_RESERVE: 'Д/С на конец периода (с учетом резерва)'
};

/**
 * Base values for metrics (used with multipliers)
 */
const BASE_VALUES = {
  [METRIC_KEYS.OPERATION_MOVEMENT]: 1366339,
  [METRIC_KEYS.OPERATION_INCOME]: 1366339,
  [METRIC_KEYS.OPERATION_EXPENSE]: 1366339,
  [METRIC_KEYS.OPERATION_DEPOSITS]: 1366339,

  [METRIC_KEYS.INVESTMENT_MOVEMENT]: 1366339,
  [METRIC_KEYS.INVESTMENT_DIVIDENDS]: -850000, // Negative (expense)
  [METRIC_KEYS.INVESTMENT_REPAIRS]: 136633,

  [METRIC_KEYS.FINANCE_MOVEMENT]: 1366339,
  [METRIC_KEYS.FINANCE_CREDITS]: 1366339,
  [METRIC_KEYS.FINANCE_OTHER]: 1366339,
  [METRIC_KEYS.FINANCE_PARUS]: 1366339,

  [METRIC_KEYS.CREDIT_START]: 1366339,
  [METRIC_KEYS.CREDIT_END]: 1366339,

  [METRIC_KEYS.CASH_MOVEMENT]: 1366339,
  [METRIC_KEYS.RESERVES_FORMED]: 1366339,
  [METRIC_KEYS.RESERVES_ACCUMULATED]: 1366339,

  [METRIC_KEYS.CASH_START]: 1366339,
  [METRIC_KEYS.CASH_END]: 1366339,
  [METRIC_KEYS.CASH_WITH_RESERVE]: 1366339
};

/**
 * Generate metrics for a single period
 * @param {number} index - Period index (0-based)
 * @param {number} fundMultiplier - Multiplier for fund variation
 * @returns {Object} Metrics object
 */
function generateMetrics(index, fundMultiplier) {
  const yearMultiplier = 1 + (index * 0.1);
  const m = fundMultiplier;

  const metrics = {};

  // Apply multipliers to all base values
  Object.entries(BASE_VALUES).forEach(([key, baseValue]) => {
    // Credit balances decrease over time
    if (key === METRIC_KEYS.CREDIT_START || key === METRIC_KEYS.CREDIT_END) {
      metrics[key] = Math.round(baseValue * m * (2 - index * 0.2));
    } else {
      metrics[key] = Math.round(baseValue * m * yearMultiplier);
    }
  });

  return metrics;
}

/**
 * Generate period data from input array
 * @param {Array} periods - Array of period definitions
 * @param {number} fundMultiplier - Multiplier for fund variation (default: 1)
 * @returns {Array} Array of period objects with metrics
 *
 * @example
 * const periods = [
 *   { year: 2023, type: 'fact', label: "Факт '23" },
 *   { year: 2024, type: 'fact', label: "Факт '24" }
 * ];
 * const data = generatePeriodData(periods, 1.2);
 */
function generatePeriodData(periods, fundMultiplier = 1) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return [];
  }

  return periods.map((period, index) => ({
    id: `period-${index}`,
    title: period.label,
    type: period.type,
    year: period.year,
    metrics: generateMetrics(index, fundMultiplier)
  }));
}

/**
 * Get metric value from generated data
 * @param {Array} periodData - Generated period data array
 * @param {string} metricKey - Metric key
 * @param {number} periodIndex - Period index
 * @returns {number} Metric value
 */
function getMetricValue(periodData, metricKey, periodIndex) {
  if (!periodData || !periodData[periodIndex]) {
    return 0;
  }
  return periodData[periodIndex].metrics[metricKey] || 0;
}

/**
 * Calculate delta between two periods
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @returns {number} Delta percentage
 */
function calculateDelta(currentValue, previousValue) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return Math.round(((currentValue - previousValue) / Math.abs(previousValue)) * 100);
}

/**
 * Generate chart data for a specific metric
 * @param {Array} periodData - Generated period data
 * @param {string} metricKey - Metric to use for chart
 * @returns {Array} Chart data array
 */
function generateChartData(periodData, metricKey) {
  return periodData.map((period, index) => ({
    label: period.title,
    value: Math.abs(period.metrics[metricKey] || 0),
    type: period.type,
    year: period.year
  }));
}

/**
 * Default periods configuration
 */
const DEFAULT_PERIODS = [
  { year: 2023, type: 'fact', label: "Факт '23" },
  { year: 2024, type: 'fact', label: "Факт '24" },
  { year: 2025, type: 'mixed', label: "Факт (I-III кв. '25)\nПлан (IV кв. '25)" },
  { year: 2026, type: 'plan', label: "План '26" }
];

/**
 * Fund multipliers for different funds
 */
const FUND_MULTIPLIERS = {
  'ДВН': 1.0,
  'ЗОЛЯ': 0.8,
  'КРАС': 1.2,
  'ЛОГ': 0.9,
  'НОР': 1.1,
  'ОЗН': 0.7,
  'ТРМ': 1.3,
  'СБЛ': 0.95
};

/**
 * Get multiplier for a fund
 * @param {string} fundName - Fund name
 * @returns {number} Multiplier value
 */
function getFundMultiplier(fundName) {
  return FUND_MULTIPLIERS[fundName] || 1.0;
}

/**
 * Default chart configuration
 * Customize scale (min/max/step), bar values, and colors
 */
const DEFAULT_CHART_CONFIG = {
  title: 'Выплата дохода акционерам (пайщикам), тыс. ₽',
  metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
  unit: 'тыс. ₽',
  // Scale settings for Y-axis
  scale: {
    min: 100,   // Minimum value on Y-axis
    max: 800,   // Maximum value on Y-axis (TEST: changed from 1000)
    step: 100   // Step between grid lines
  },
  // Custom bar values (override calculated values)
  // Set to null to use calculated values from data
  customValues: [200, 400, 600, 750],  // TEST: changed values
  // Bar colors
  colors: {
    fact: '#FF6B6B',  // TEST: changed to red
    plan: '#4ECDC4'   // TEST: changed to teal
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    METRIC_KEYS,
    BASE_VALUES,
    generatePeriodData,
    getMetricValue,
    calculateDelta,
    generateChartData,
    DEFAULT_PERIODS,
    FUND_MULTIPLIERS,
    getFundMultiplier,
    DEFAULT_CHART_CONFIG
  };
}
