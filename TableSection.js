/**
 * TableSection.js - Table Section Component for BDDS Dashboard
 *
 * Renders a section of the budget table (Operational, Investment, Financial)
 */

/**
 * Section definitions with rows
 */
const SECTIONS = {
  operation: {
    id: 'operation',
    title: 'Операционная часть',
    cssClass: 'table-section--operation',
    rows: [
      { id: 'op-movement', key: METRIC_KEYS.OPERATION_MOVEMENT, label: 'Движение Д/С по операционной деятельности ООО', isHeader: true },
      { id: 'op-income', key: METRIC_KEYS.OPERATION_INCOME, label: 'Поступления по операционной деятельности', isHeader: false },
      { id: 'op-expense', key: METRIC_KEYS.OPERATION_EXPENSE, label: 'Расходы по основной деятельности', isHeader: false },
      { id: 'op-deposits', key: METRIC_KEYS.OPERATION_DEPOSITS, label: 'Обеспечительные платежи', isHeader: false }
    ]
  },
  investment: {
    id: 'investment',
    title: 'Инвестиционная часть',
    cssClass: 'table-section--investment',
    rows: [
      { id: 'inv-movement', key: METRIC_KEYS.INVESTMENT_MOVEMENT, label: 'Движение Д/С по инвестиционной деятельности', isHeader: true },
      { id: 'inv-dividends', key: METRIC_KEYS.INVESTMENT_DIVIDENDS, label: 'Выплата дохода акционерам (пайщикам)', isHeader: false },
      { id: 'inv-repairs', key: METRIC_KEYS.INVESTMENT_REPAIRS, label: 'Расходы на капитальный ремонт', isHeader: false }
    ]
  },
  finance: {
    id: 'finance',
    title: 'Финансовая часть',
    cssClass: 'table-section--finance',
    rows: [
      { id: 'fin-movement', key: METRIC_KEYS.FINANCE_MOVEMENT, label: 'Движение Д/С по финансовой деятельности', isHeader: true },
      { id: 'fin-credits', key: METRIC_KEYS.FINANCE_CREDITS, label: 'Расчеты по кредитам', isHeader: false },
      { id: 'fin-other', key: METRIC_KEYS.FINANCE_OTHER, label: 'Прочие доходы и расходы\nпо финансовой деятельности', isHeader: false, multiline: true },
      { id: 'fin-parus', key: METRIC_KEYS.FINANCE_PARUS, label: 'Расходы на УК Парус', isHeader: false }
    ]
  }
};

/**
 * Credit balance block rows
 */
const CREDIT_BALANCE_ROWS = [
  { id: 'credit-start', key: METRIC_KEYS.CREDIT_START, label: 'Остаток по кредиту на начало периода', isHeader: true },
  { id: 'credit-end', key: METRIC_KEYS.CREDIT_END, label: 'Остаток по кредиту на конец периода', isHeader: true }
];

/**
 * Cash movement section rows
 */
const CASH_MOVEMENT_ROWS = [
  { id: 'reserves-formed', key: METRIC_KEYS.RESERVES_FORMED, label: 'Сформированные резервы (нарастающим итогом)', isHeader: false },
  { id: 'reserves-accumulated', key: METRIC_KEYS.RESERVES_ACCUMULATED, label: 'Накопленные резервы на ремонт,\nнепредвиденные расходы и вакансию', isHeader: false, multiline: true }
];

/**
 * Cash balance block rows
 */
const CASH_BALANCE_ROWS = [
  { id: 'cash-start', key: METRIC_KEYS.CASH_START, label: 'Остаток Д/С на начало периода', isHeader: true },
  { id: 'cash-end', key: METRIC_KEYS.CASH_END, label: 'Остаток Д/С на конец периода', isHeader: true },
  { id: 'cash-reserve', key: METRIC_KEYS.CASH_WITH_RESERVE, label: 'Д/С на конец периода (с учетом резерва)', isHeader: true }
];

/**
 * Render a single table row
 * @param {Object} row - Row definition
 * @param {Array} periodData - Period data array
 * @param {string} viewMode - Current view mode ('details' | 'dynamics')
 * @returns {HTMLElement} Row element
 */
function renderTableRow(row, periodData, viewMode) {
  const rowClasses = ['table-row'];
  if (row.isHeader) rowClasses.push('table-row--header');

  const rowEl = createElement('div', rowClasses.join(' '));

  // Label
  const labelEl = createElement('span', 'table-row__label');
  if (row.multiline) {
    // Handle multiline labels
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
    periodData.forEach((period, index) => {
      const value = period.metrics[row.key] || 0;
      const valueEl = createElement('span', 'table-row__value');

      // Check if this is the mixed period (wider column)
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
    // Dynamics mode: Факт '23, Факт/План '25, Дельта
    const firstPeriod = periodData[0];
    const currentPeriod = periodData[2]; // Mixed period (2025)

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

/**
 * Render a table section
 * @param {Object} section - Section definition
 * @param {Array} periodData - Period data array
 * @param {string} viewMode - Current view mode
 * @returns {HTMLElement} Section element
 */
function renderTableSection(section, periodData, viewMode) {
  const sectionEl = createElement('section', `table-section ${section.cssClass}`);

  // Title with colored background
  const titleEl = createElement('h2', 'table-section__title', section.title);
  sectionEl.appendChild(titleEl);

  // Content container with border
  const contentEl = createElement('div', 'table-section__content');

  // Render rows
  section.rows.forEach(row => {
    const rowEl = renderTableRow(row, periodData, viewMode);
    contentEl.appendChild(rowEl);
  });

  sectionEl.appendChild(contentEl);
  return sectionEl;
}

/**
 * Render table column headers
 * @param {Array} periods - Period definitions
 * @param {string} viewMode - Current view mode
 * @returns {HTMLElement} Headers container
 */
function renderTableHeaders(periods, viewMode) {
  const container = createElement('div', 'table-header__columns');

  if (viewMode === 'details') {
    periods.forEach(period => {
      const headerEl = createElement('span', 'table-header__column');

      if (period.type === 'mixed') {
        headerEl.classList.add('table-header__column--wide');
        // Handle multiline header
        const lines = period.label.split('\n');
        headerEl.innerHTML = lines.join('<br>');
      } else {
        headerEl.textContent = period.label;
      }

      container.appendChild(headerEl);
    });
  } else {
    // Dynamics mode headers
    const headers = [
      { label: "Факт '23", wide: false },
      { label: "Факт (I-III кв. '25)\nПлан (IV кв. '25)", wide: true },
      { label: "Дельта", wide: false }
    ];

    headers.forEach(header => {
      const headerEl = createElement('span', 'table-header__column');
      if (header.wide) {
        headerEl.classList.add('table-header__column--wide');
        const lines = header.label.split('\n');
        headerEl.innerHTML = lines.join('<br>');
      } else {
        headerEl.textContent = header.label;
      }
      container.appendChild(headerEl);
    });
  }

  return container;
}

/**
 * Render all table sections including highlight blocks
 * @param {Array} periodData - Period data array
 * @param {string} viewMode - Current view mode
 * @returns {DocumentFragment} All sections
 */
function renderAllTableSections(periodData, viewMode) {
  const fragment = document.createDocumentFragment();

  // Operation section
  fragment.appendChild(renderTableSection(SECTIONS.operation, periodData, viewMode));

  // Investment section
  fragment.appendChild(renderTableSection(SECTIONS.investment, periodData, viewMode));

  // Finance section
  fragment.appendChild(renderTableSection(SECTIONS.finance, periodData, viewMode));

  // Credit balance highlight block
  fragment.appendChild(renderHighlightBlock(CREDIT_BALANCE_ROWS, periodData, viewMode));

  // Cash movement section (no border)
  const movementSection = createElement('div', 'movement-section');
  const movementTitle = createElement('h3', 'movement-section__title', 'Движение за период по Д/С');
  movementSection.appendChild(movementTitle);

  CASH_MOVEMENT_ROWS.forEach(row => {
    movementSection.appendChild(renderTableRow(row, periodData, viewMode));
  });
  fragment.appendChild(movementSection);

  // Cash balance highlight block
  fragment.appendChild(renderHighlightBlock(CASH_BALANCE_ROWS, periodData, viewMode));

  return fragment;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SECTIONS,
    CREDIT_BALANCE_ROWS,
    CASH_MOVEMENT_ROWS,
    CASH_BALANCE_ROWS,
    renderTableRow,
    renderTableSection,
    renderTableHeaders,
    renderAllTableSections
  };
}
