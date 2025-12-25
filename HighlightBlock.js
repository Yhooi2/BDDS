/**
 * HighlightBlock.js - Highlight Block Component for BDDS Dashboard
 *
 * Renders highlighted blocks for balance information (credit, cash)
 */

/**
 * Render a highlight block (gray background section)
 * @param {Array} rows - Row definitions for the block
 * @param {Array} periodData - Period data array
 * @param {string} viewMode - Current view mode ('details' | 'dynamics')
 * @returns {HTMLElement} Highlight block element
 */
function renderHighlightBlock(rows, periodData, viewMode) {
  const blockEl = createElement('div', 'highlight-block');

  rows.forEach(row => {
    const rowEl = renderHighlightRow(row, periodData, viewMode);
    blockEl.appendChild(rowEl);
  });

  return blockEl;
}

/**
 * Render a single row within a highlight block
 * @param {Object} row - Row definition
 * @param {Array} periodData - Period data array
 * @param {string} viewMode - Current view mode
 * @returns {HTMLElement} Row element
 */
function renderHighlightRow(row, periodData, viewMode) {
  const rowEl = createElement('div', 'table-row');

  // Label (always semibold in highlight blocks)
  const labelEl = createElement('span', 'table-row__label');
  if (row.multiline) {
    const lines = row.label.split('\n');
    labelEl.innerHTML = lines.join('<br>');
  } else {
    labelEl.textContent = row.label;
  }
  rowEl.appendChild(labelEl);

  // Values container
  const valuesEl = createElement('div', 'table-row__values');

  if (viewMode === 'details') {
    // Show all periods
    periodData.forEach((period) => {
      const value = period.metrics[row.key] || 0;
      const valueEl = createElement('span', 'table-row__value');

      if (period.type === 'mixed') {
        valueEl.classList.add('table-row__value--wide');
      }

      valueEl.textContent = formatNumber(value);
      if (isNegative(value)) {
        valueEl.classList.add('text-negative');
      }

      valuesEl.appendChild(valueEl);
    });
  } else {
    // Dynamics mode
    const firstPeriod = periodData[0];
    const currentPeriod = periodData[2];

    // First period value
    const value1 = firstPeriod ? firstPeriod.metrics[row.key] || 0 : 0;
    const valueEl1 = createElement('span', 'table-row__value');
    valueEl1.textContent = formatNumber(value1);
    if (isNegative(value1)) valueEl1.classList.add('text-negative');
    valuesEl.appendChild(valueEl1);

    // Current period value
    const value2 = currentPeriod ? currentPeriod.metrics[row.key] || 0 : 0;
    const valueEl2 = createElement('span', 'table-row__value table-row__value--wide');
    valueEl2.textContent = formatNumber(value2);
    if (isNegative(value2)) valueEl2.classList.add('text-negative');
    valuesEl.appendChild(valueEl2);

    // Delta
    const delta = calculateDelta(value2, value1);
    const deltaEl = createElement('span', 'table-row__value');
    deltaEl.textContent = formatWithDelta(value2, delta);
    valuesEl.appendChild(deltaEl);
  }

  rowEl.appendChild(valuesEl);
  return rowEl;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderHighlightBlock,
    renderHighlightRow
  };
}
