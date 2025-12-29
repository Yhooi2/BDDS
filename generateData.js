/**
 * generateData.js - Data utilities for BDDS Dashboard
 *
 * Note: Fund data now comes from window.DATA.funds via FundsService
 * This file contains only shared utilities (METRIC_KEYS, parsePeriodInfo, etc.)
 */

/**
 * All metric keys used in the dashboard
 */
const METRIC_KEYS = {
  // Operational Activity Section
  OPERATION_MOVEMENT: "Движение Д/С по операционной деятельности ООО",
  OPERATION_INCOME: "Поступления по операционной деятельности",
  OPERATION_EXPENSE: "Расходы по основной деятельности",
  OPERATION_DEPOSITS: "Обеспечительные платежи",

  // Investment Activity Section
  INVESTMENT_MOVEMENT: "Движение Д/С по инвестиционной деятельности",
  INVESTMENT_DIVIDENDS: "Выплата дохода акционерам (пайщикам)",
  INVESTMENT_REPAIRS: "Расходы на капитальный ремонт",

  // Financial Activity Section
  FINANCE_MOVEMENT: "Движение Д/С по финансовой деятельности",
  FINANCE_CREDITS: "Расчеты по кредитам",
  FINANCE_OTHER: "Прочие доходы и расходы по финансовой деятельности",
  FINANCE_PARUS: "Расходы на УК Парус",

  // Credit Balance Block
  CREDIT_START: "Остаток по кредиту на начало периода",
  CREDIT_END: "Остаток по кредиту на конец периода",

  // Cash Movement Section
  CASH_MOVEMENT: "Движение за период по Д/С",
  RESERVES_FORMED: "Сформированные резервы (нарастающим итогом)",
  RESERVES_ACCUMULATED:
    "Накопленные резервы на ремонт, непредвиденные расходы и вакансию",

  // Cash Balance Block
  CASH_START: "Остаток Д/С на начало периода",
  CASH_END: "Остаток Д/С на конец периода",
  CASH_WITH_RESERVE: "Д/С на конец периода (с учетом резерва)",
};

/**
 * Calculate delta between two periods
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @returns {number} Delta percentage
 */
function calculateDelta(currentValue, previousValue) {
  if (currentValue === null || previousValue === null) {
    return null;
  }
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return Math.round(
    ((currentValue - previousValue) / Math.abs(previousValue)) * 100
  );
}

/**
 * Parse period string to extract type and year
 * @param {string} periodString - Period label (e.g., "Факт '23", "План '26")
 * @returns {Object} { type: 'fact'|'plan'|'mixed', year: number }
 *
 * @example
 * parsePeriodInfo("Факт '23")  // { type: 'fact', year: 2023 }
 * parsePeriodInfo("План '26")  // { type: 'plan', year: 2026 }
 * parsePeriodInfo("Факт (I-III кв. '25)\nПлан (IV кв. '25)")  // { type: 'mixed', year: 2025 }
 */
function parsePeriodInfo(periodString) {
  const hasFact = /факт/i.test(periodString);
  const hasPlan = /план/i.test(periodString);

  let type = "fact";
  if (hasFact && hasPlan) {
    type = "mixed";
  } else if (hasPlan) {
    type = "plan";
  }

  // Extract year from patterns like '23, '24, '25, '26
  const yearMatch = periodString.match(/'(\d{2})/);
  let year = new Date().getFullYear();
  if (yearMatch) {
    year = 2000 + parseInt(yearMatch[1], 10);
  }

  return { type, year };
}

/**
 * Default periods configuration (for fallback/testing)
 */
const DEFAULT_PERIODS = [
  { year: 2023, type: "fact", label: "Факт '23" },
  { year: 2024, type: "fact", label: "Факт '24" },
  {
    year: 2025,
    type: "mixed",
    label: "Факт (I-III кв. '25)\nПлан (IV кв. '25)",
  },
  { year: 2026, type: "plan", label: "План '26" },
];

/**
 * Default chart configuration
 * Customize scale (min/max/step), bar values, and colors
 */
const DEFAULT_CHART_CONFIG = {
  title: "Выплата дохода акционерам (пайщикам), тыс. ₽",
  metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
  unit: "тыс. ₽",
  // Scale settings for Y-axis
  scale: {
    min: 100, // Minimum value on Y-axis
    max: 1000, // Maximum value on Y-axis
    step: 100, // Step between grid lines
  },
  // Custom bar values (override calculated values)
  // Set to null to use calculated values from data
  customValues: [390, 670, 860, 980],
  // Bar colors
  colors: {
    fact: "#9DBCE0",
    plan: "#D9D9D9",
  },
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    METRIC_KEYS,
    calculateDelta,
    parsePeriodInfo,
    DEFAULT_PERIODS,
    DEFAULT_CHART_CONFIG,
  };
}

// Export for browser usage
if (typeof window !== "undefined") {
  window.DataModule = {
    METRIC_KEYS,
    calculateDelta,
    parsePeriodInfo,
    DEFAULT_PERIODS,
    DEFAULT_CHART_CONFIG,
  };
}
