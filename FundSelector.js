/**
 * FundSelector.js - Fund Selector Dropdown Component for BDDS Dashboard
 *
 * Handles fund selection with dropdown menu
 */

/**
 * Fund icons mapping (different building types)
 */
const FUND_ICONS = {
  // Default building icon
  default: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 9v12h16V9l-8-6zm6 16H6v-9l6-4.5 6 4.5v9z"/>
    <rect x="8" y="13" width="3" height="3"/>
    <rect x="13" y="13" width="3" height="3"/>
    <rect x="8" y="17" width="3" height="2"/>
    <rect x="13" y="17" width="3" height="2"/>
  </svg>`,

  // Warehouse icon
  warehouse: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>`,

  // Office building icon
  office: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  </svg>`
};

/**
 * Get icon for a fund
 * @param {string} fundName - Fund name
 * @returns {string} SVG icon HTML
 */
function getFundIcon(fundName) {
  // Map fund names to icon types
  const iconMap = {
    'ДВН': 'default',
    'ЗОЛЯ': 'office',
    'КРАС': 'warehouse',
    'ЛОГ': 'warehouse',
    'НОР': 'default',
    'ОЗН': 'office',
    'ТРМ': 'warehouse',
    'СБЛ': 'office'
  };

  const iconType = iconMap[fundName] || 'default';
  return FUND_ICONS[iconType] || FUND_ICONS.default;
}

/**
 * FundSelector component
 */
const FundSelector = {
  // State
  state: {
    isOpen: false,
    selected: 'ДВН',
    funds: []
  },

  // DOM references
  elements: {
    container: null,
    trigger: null,
    value: null,
    dropdown: null,
    grid: null
  },

  /**
   * Initialize the component
   * @param {Object} options - Configuration options
   */
  init(options = {}) {
    this.state.selected = options.selected || window.DATA?.currentFund || 'ДВН';
    this.state.funds = options.funds || window.DATA?.funds || ['ДВН', 'ЗОЛЯ', 'КРАС', 'ЛОГ', 'НОР', 'ОЗН', 'ТРМ', 'СБЛ'];
    this.state.onChange = options.onChange || (() => {});

    // Get DOM elements
    this.elements.container = $('#fundSelector');
    this.elements.trigger = $('.fund-selector__trigger', this.elements.container);
    this.elements.value = $('#fundSelectorValue');
    this.elements.dropdown = $('#fundDropdown');
    this.elements.grid = $('#fundGrid');

    if (!this.elements.container) {
      console.error('FundSelector: Container element not found');
      return;
    }

    // Render and attach events
    this.render();
    this.attachEvents();
  },

  /**
   * Render the fund grid
   */
  render() {
    if (!this.elements.grid) return;

    clearElement(this.elements.grid);

    this.state.funds.forEach(fund => {
      const item = this.createFundItem(fund);
      this.elements.grid.appendChild(item);
    });

    // Update current value display
    if (this.elements.value) {
      this.elements.value.textContent = this.state.selected;
    }

    // Update icon
    const iconContainer = $('.fund-selector__icon', this.elements.container);
    if (iconContainer) {
      iconContainer.innerHTML = getFundIcon(this.state.selected);
    }
  },

  /**
   * Create a fund item element
   * @param {string} fund - Fund name
   * @returns {HTMLElement} Fund item element
   */
  createFundItem(fund) {
    const isActive = fund === this.state.selected;
    const classes = ['fund-selector__item'];
    if (isActive) classes.push('fund-selector__item--active');

    const item = createElement('div', classes.join(' '), '', {
      role: 'option',
      'aria-selected': isActive.toString(),
      data: { fund }
    });

    // Icon
    const icon = createElement('span', 'fund-selector__item-icon');
    icon.innerHTML = getFundIcon(fund);
    item.appendChild(icon);

    // Name
    const name = createElement('span', 'fund-selector__item-name', fund);
    item.appendChild(name);

    // Click handler
    item.addEventListener('click', () => this.select(fund));

    return item;
  },

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Trigger click
    if (this.elements.trigger) {
      this.elements.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.state.isOpen && !this.elements.container.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.state.isOpen) return;

      if (e.key === 'Escape') {
        this.close();
        this.elements.trigger?.focus();
      }
    });
  },

  /**
   * Toggle dropdown open/closed
   */
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open dropdown
   */
  open() {
    this.state.isOpen = true;
    this.elements.container.classList.add('fund-selector--open');
    this.elements.container.setAttribute('aria-expanded', 'true');
  },

  /**
   * Close dropdown
   */
  close() {
    this.state.isOpen = false;
    this.elements.container.classList.remove('fund-selector--open');
    this.elements.container.setAttribute('aria-expanded', 'false');
  },

  /**
   * Select a fund
   * @param {string} fund - Fund name to select
   */
  select(fund) {
    if (fund === this.state.selected) {
      this.close();
      return;
    }

    this.state.selected = fund;
    this.close();
    this.render();

    // Callback
    if (typeof this.state.onChange === 'function') {
      this.state.onChange(fund);
    }
  },

  /**
   * Get currently selected fund
   * @returns {string} Selected fund name
   */
  getSelected() {
    return this.state.selected;
  },

  /**
   * Set selected fund programmatically
   * @param {string} fund - Fund name to select
   */
  setSelected(fund) {
    if (this.state.funds.includes(fund)) {
      this.state.selected = fund;
      this.render();
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FUND_ICONS,
    getFundIcon,
    FundSelector
  };
}
