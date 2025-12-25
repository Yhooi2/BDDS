/**
 * БДДС Financial Dashboard
 * Vanilla JavaScript implementation
 */
(function() {
    'use strict';

    // ========================================
    // 1. CONSTANTS
    // ========================================
    const SELECTORS = {
        fundButton: '.fund-selector__button',
        fundDropdown: '#fund-dropdown',
        fundOptions: '#fund-options',
        fundName: '#selected-fund',
        operationRows: '#operation-rows',
        investmentRows: '#investment-rows',
        financeRows: '#finance-rows',
        movementRows: '#movement-rows',
        creditBalance: '#credit-balance',
        cashBalance: '#cash-balance',
        chartTitle: '#chart-title',
        chartYAxis: '#chart-y-axis',
        chartGrid: '#chart-grid',
        chartBars: '#chart-bars',
        chartXAxis: '#chart-x-axis'
    };

    const COLORS = {
        fact: '#9DBCE0',
        plan: '#D9D9D9'
    };

    // ========================================
    // 2. STATE
    // ========================================
    const state = {
        currentFund: null,
        dropdownOpen: false,
        data: null
    };

    // ========================================
    // 3. UTILS MODULE
    // ========================================
    const Utils = {
        /**
         * Format number with space as thousands separator
         * @param {number|null|undefined} value
         * @returns {string}
         */
        formatNumber(value) {
            if (value === null || value === undefined) return '—';
            if (typeof value !== 'number' || isNaN(value)) return '—';

            const absValue = Math.abs(value);
            const formatted = new Intl.NumberFormat('ru-RU', {
                useGrouping: true,
                maximumFractionDigits: 0
            }).format(absValue);

            // Replace non-breaking space with regular space
            return formatted.replace(/\u00A0/g, ' ');
        },

        /**
         * Check if value is negative
         */
        isNegative(value) {
            return typeof value === 'number' && value < 0;
        },

        /**
         * Format value with sign consideration
         * @returns {{ text: string, isNegative: boolean }}
         */
        formatValue(value) {
            const isNeg = this.isNegative(value);
            const text = this.formatNumber(value);
            return { text, isNegative: isNeg };
        },

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        /**
         * Query selector shorthand
         */
        $(selector, context = document) {
            return context.querySelector(selector);
        },

        /**
         * Query selector all shorthand
         */
        $$(selector, context = document) {
            return Array.from(context.querySelectorAll(selector));
        },

        /**
         * Debounce function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ========================================
    // 4. DROPDOWN MODULE
    // ========================================
    const Dropdown = {
        button: null,
        dropdown: null,
        optionsContainer: null,
        options: [],

        init() {
            this.button = Utils.$(SELECTORS.fundButton);
            this.dropdown = Utils.$(SELECTORS.fundDropdown);
            this.optionsContainer = Utils.$(SELECTORS.fundOptions);

            if (!this.button || !this.dropdown) return;

            this.renderOptions();
            this.bindEvents();
        },

        renderOptions() {
            if (!this.optionsContainer || !state.data.funds) return;

            const optionsHtml = state.data.funds.map(fund => {
                const isActive = fund.id === state.currentFund.id;
                const activeClass = isActive ? 'fund-selector__option--active' : '';
                return `
                    <button
                        class="fund-selector__option ${activeClass}"
                        role="option"
                        data-fund="${fund.id}"
                        tabindex="-1"
                        aria-selected="${isActive}"
                    >
                        ${Utils.escapeHtml(fund.name)}
                    </button>
                `;
            }).join('');

            this.optionsContainer.innerHTML = optionsHtml;
            this.options = Utils.$$('.fund-selector__option', this.optionsContainer);
        },

        bindEvents() {
            this.button.addEventListener('click', () => this.toggle());

            this.optionsContainer.addEventListener('click', (e) => {
                const option = e.target.closest('.fund-selector__option');
                if (option) {
                    this.select(option.dataset.fund);
                }
            });

            // Keyboard navigation
            this.optionsContainer.addEventListener('keydown', (e) => this.handleKeyNav(e));

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!this.button.contains(e.target) && !this.dropdown.contains(e.target)) {
                    this.close();
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.dropdownOpen) {
                    this.close();
                }
            });
        },

        toggle() {
            state.dropdownOpen ? this.close() : this.open();
        },

        open() {
            state.dropdownOpen = true;
            this.dropdown.hidden = false;
            this.button.setAttribute('aria-expanded', 'true');

            // Focus first option
            const firstOption = this.options[0];
            if (firstOption) {
                firstOption.focus();
            }
        },

        close() {
            state.dropdownOpen = false;
            this.dropdown.hidden = true;
            this.button.setAttribute('aria-expanded', 'false');
            this.button.focus();
        },

        select(fundId) {
            const fund = state.data.funds.find(f => f.id === fundId);
            if (!fund) return;

            state.currentFund = fund;

            // Update displayed name
            const nameElement = Utils.$(SELECTORS.fundName);
            if (nameElement) {
                nameElement.textContent = fund.name;
            }

            // Update active option
            this.options.forEach(opt => {
                const isActive = opt.dataset.fund === fundId;
                opt.classList.toggle('fund-selector__option--active', isActive);
                opt.setAttribute('aria-selected', isActive);
            });

            this.close();

            // Re-render with new fund data
            App.render();
        },

        handleKeyNav(e) {
            const currentIndex = this.options.indexOf(document.activeElement);
            let newIndex;

            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = (currentIndex + 1) % this.options.length;
                    this.options[newIndex]?.focus();
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = (currentIndex - 1 + this.options.length) % this.options.length;
                    this.options[newIndex]?.focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const focused = document.activeElement;
                    if (focused && focused.dataset.fund) {
                        this.select(focused.dataset.fund);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    this.options[0]?.focus();
                    break;
                case 'End':
                    e.preventDefault();
                    this.options[this.options.length - 1]?.focus();
                    break;
            }
        }
    };

    // ========================================
    // 5. TABLE MODULE
    // ========================================
    const Table = {
        render() {
            const fundId = state.currentFund.id;
            const fundData = state.data.data[fundId];
            const periods = state.data.periods;

            if (!fundData) {
                console.warn('No data for fund:', fundId);
                return;
            }

            // Render column headers
            this.renderColumnHeaders(periods);

            // Render sections
            this.renderSection('operation', fundData, periods);
            this.renderSection('investment', fundData, periods);
            this.renderSection('finance', fundData, periods);
            this.renderSection('movement', fundData, periods);

            // Render highlight blocks
            this.renderHighlightBlock('credit', fundData, periods);
            this.renderHighlightBlock('cash', fundData, periods);
        },

        renderColumnHeaders(periods) {
            periods.forEach((period, index) => {
                const header = Utils.$(`#col-header-${index}`);
                if (header) {
                    if (period.type === 'mixed') {
                        header.innerHTML = period.title.replace(' / ', '<br>');
                    } else {
                        header.textContent = period.title;
                    }
                }
            });
        },

        renderSection(sectionId, fundData, periods) {
            const section = state.data.sections[sectionId];
            const container = Utils.$(`#${sectionId}-rows`);

            if (!section || !container) return;

            const rowsHtml = section.rows.map(row => {
                const rowClass = row.isHeader ? 'budget-table__row--header' : '';
                const labelClass = row.isMultiline ? 'budget-table__cell--multiline' : '';

                const cellsHtml = periods.map(period => {
                    const value = fundData[period.id]?.[row.key];
                    const { text, isNegative } = Utils.formatValue(value);
                    const cellClass = isNegative ? 'budget-table__cell--negative' : '';

                    return `<td class="budget-table__cell ${cellClass}">${text}</td>`;
                }).join('');

                return `
                    <tr class="budget-table__row ${rowClass}">
                        <td class="budget-table__cell budget-table__cell--label ${labelClass}">
                            ${Utils.escapeHtml(row.label)}
                        </td>
                        ${cellsHtml}
                    </tr>
                `;
            }).join('');

            container.innerHTML = rowsHtml;
        },

        renderHighlightBlock(blockId, fundData, periods) {
            const block = state.data.highlightBlocks[blockId];
            const container = Utils.$(`#${blockId}-balance`);

            if (!block || !container) return;

            const rowsHtml = block.rows.map(row => {
                const valuesHtml = periods.map(period => {
                    const value = fundData[period.id]?.[row.key];
                    const { text, isNegative } = Utils.formatValue(value);
                    const valueClass = isNegative ? 'highlight-block__value--negative' : '';

                    return `<span class="highlight-block__value ${valueClass}">${text}</span>`;
                }).join('');

                return `
                    <div class="highlight-block__row">
                        <span class="highlight-block__label">${Utils.escapeHtml(row.label)}</span>
                        ${valuesHtml}
                    </div>
                `;
            }).join('');

            container.innerHTML = rowsHtml;
        }
    };

    // ========================================
    // 6. CHART MODULE
    // ========================================
    const Chart = {
        config: {
            maxHeight: 444,
            steps: 9,
            minValue: 100,
            maxValue: 1000
        },

        render() {
            const chartConfig = state.data.chartConfig;
            const fundId = state.currentFund.id;
            const fundData = state.data.data[fundId];
            const periods = state.data.periods;

            if (!chartConfig || !fundData) return;

            // Update config from data
            this.config.minValue = chartConfig.minValue;
            this.config.maxValue = chartConfig.maxValue;

            // Update title
            const titleElement = Utils.$(SELECTORS.chartTitle);
            if (titleElement) {
                titleElement.textContent = chartConfig.title;
            }

            // Prepare chart data
            const chartData = periods.map(period => {
                const rawValue = fundData[period.id]?.[chartConfig.metric];
                // Convert to display value (divide if needed, take absolute)
                const value = chartConfig.divisor
                    ? Math.abs(rawValue) / chartConfig.divisor
                    : Math.abs(rawValue);

                return {
                    label: period.title,
                    value: Math.round(value),
                    type: period.type === 'plan' ? 'plan' : 'fact'
                };
            });

            this.renderYAxis();
            this.renderGrid();
            this.renderBars(chartData);
            this.renderXAxis(chartData);
        },

        renderYAxis() {
            const container = Utils.$(SELECTORS.chartYAxis);
            if (!container) return;

            const { minValue, maxValue, steps } = this.config;
            const step = (maxValue - minValue) / steps;

            const labels = [];
            for (let v = maxValue; v >= minValue; v -= step) {
                labels.push(`<span class="chart__y-label">${Utils.formatNumber(v)}</span>`);
            }

            container.innerHTML = labels.join('');
        },

        renderGrid() {
            const container = Utils.$(SELECTORS.chartGrid);
            if (!container) return;

            const lines = Array(this.config.steps + 1)
                .fill('<div class="chart__grid-line"></div>')
                .join('');

            container.innerHTML = lines;
        },

        renderBars(data) {
            const container = Utils.$(SELECTORS.chartBars);
            if (!container) return;

            const { minValue, maxValue } = this.config;
            const maxHeight = this.getChartHeight();

            const barsHtml = data.map(item => {
                const height = this.calculateHeight(item.value, minValue, maxValue, maxHeight);
                const barClass = item.type === 'fact' ? 'chart__bar--fact' : 'chart__bar--plan';

                return `
                    <div class="chart__bar-wrapper">
                        <span class="chart__bar-value">${item.value}</span>
                        <div class="chart__bar ${barClass}" style="height: ${height}px;"></div>
                    </div>
                `;
            }).join('');

            container.innerHTML = barsHtml;
        },

        renderXAxis(data) {
            const container = Utils.$(SELECTORS.chartXAxis);
            if (!container) return;

            const labelsHtml = data.map(item => {
                return `<span class="chart__x-label">${Utils.escapeHtml(item.label)}</span>`;
            }).join('');

            container.innerHTML = labelsHtml;
        },

        calculateHeight(value, min, max, maxHeight) {
            // Clamp value to range
            const clampedValue = Math.max(min, Math.min(max, value));
            const range = max - min;
            const normalizedValue = clampedValue - min;
            return Math.round((normalizedValue / range) * maxHeight);
        },

        getChartHeight() {
            // Get actual chart height from CSS variable or default
            const root = document.documentElement;
            const cssHeight = getComputedStyle(root).getPropertyValue('--chart-height');
            return parseInt(cssHeight) || this.config.maxHeight;
        }
    };

    // ========================================
    // 7. RESPONSIVE MODULE
    // ========================================
    const Responsive = {
        breakpoints: {
            mobile: 768,
            tablet: 1280
        },

        currentBreakpoint: 'desktop',

        init() {
            this.checkBreakpoint();
            window.addEventListener('resize', Utils.debounce(() => {
                this.checkBreakpoint();
            }, 150));
        },

        checkBreakpoint() {
            const width = window.innerWidth;
            let newBreakpoint;

            if (width < this.breakpoints.mobile) {
                newBreakpoint = 'mobile';
            } else if (width < this.breakpoints.tablet) {
                newBreakpoint = 'tablet';
            } else {
                newBreakpoint = 'desktop';
            }

            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.onBreakpointChange(newBreakpoint);
            }
        },

        onBreakpointChange(breakpoint) {
            // Re-render chart to recalculate heights
            Chart.render();
        }
    };

    // ========================================
    // 8. APP MODULE
    // ========================================
    const App = {
        init() {
            // Check for data
            if (!window.DATA) {
                console.error('window.DATA is required');
                this.showError('Данные не загружены');
                return;
            }

            // Initialize state
            state.data = window.DATA;
            state.currentFund = state.data.funds.find(f => f.id === state.data.currentFund)
                || state.data.funds[0];

            // Initialize modules
            Dropdown.init();
            Responsive.init();

            // Initial render
            this.render();
        },

        render() {
            Table.render();
            Chart.render();
        },

        showError(message) {
            const dashboard = Utils.$('.dashboard');
            if (dashboard) {
                dashboard.innerHTML = `
                    <div class="card" style="padding: 40px; text-align: center;">
                        <h1 style="color: #DC2626; margin-bottom: 16px;">Ошибка</h1>
                        <p>${Utils.escapeHtml(message)}</p>
                    </div>
                `;
            }
        }
    };

    // ========================================
    // 9. INITIALIZATION
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();
