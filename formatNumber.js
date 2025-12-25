/**
 * formatNumber.js - Number formatting utilities for BDDS Dashboard
 *
 * Formats numbers with Russian locale (space as thousand separator)
 * Handles negative numbers and delta percentages
 */

/**
 * Format a number with space as thousand separator
 * @param {number} value - The number to format
 * @returns {string} Formatted number string (e.g., "1 366 339")
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('ru-RU', {
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(absValue);

  // Intl.NumberFormat uses non-breaking space, replace with regular space for consistency
  const withRegularSpace = formatted.replace(/\u00A0/g, ' ');

  return value < 0 ? `-${withRegularSpace}` : withRegularSpace;
}

/**
 * Format a number with delta percentage
 * @param {number} value - The number to format
 * @param {number} delta - The delta percentage (e.g., 10 for 10%)
 * @returns {string} Formatted string (e.g., "1 366 339 (10%)")
 */
function formatWithDelta(value, delta) {
  const formattedValue = formatNumber(value);
  const formattedDelta = Math.round(delta);
  return `${formattedValue} (${formattedDelta}%)`;
}

/**
 * Format a number for chart display (short format, no spaces)
 * @param {number} value - The number to format
 * @returns {string} Short formatted number (e.g., "390")
 */
function formatShort(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return Math.round(value).toString();
}

/**
 * Check if a value is negative (for styling purposes)
 * @param {number} value - The number to check
 * @returns {boolean} True if negative
 */
function isNegative(value) {
  return typeof value === 'number' && value < 0;
}

// Export for module usage (will be inlined in final script.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatNumber, formatWithDelta, formatShort, isNegative };
}
