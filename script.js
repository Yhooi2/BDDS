/**
 * BDDS Dashboard - Financial Dashboard
 *
 * Unified script file for GitHub Pages deployment
 * Combines all modules: utilities, components, and main dashboard
 *
 * @version 1.0.0
 * @author BDDS Team
 */

(function () {
  "use strict";

  // ============================================================================
  // 1. UTILITIES - formatNumber.js CHART_CONFIG_DEFAULTS
  // ============================================================================

  /**
   * Format a number with space as thousand separator
   * @param {number} value - The number to format
   * @returns {string} Formatted number string (e.g., "1 366 339")
   */
  function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }

    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat("ru-RU", {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(absValue);

    const withRegularSpace = formatted.replace(/\u00A0/g, " ");
    return value < 0 ? `-${withRegularSpace}` : withRegularSpace;
  }

  /**
   * Format a number with delta percentage
   */
  function formatWithDelta(value, delta) {
    const formattedValue = formatNumber(value);
    const formattedDelta = Math.round(delta);
    return `${formattedValue} (${formattedDelta}%)`;
  }

  /**
   * Format a number for chart display (short format)
   */
  function formatShort(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return "0";
    }
    return Math.round(value).toString();
  }

  // ============================================================================
  // 2. UTILITIES - dom.js
  // ============================================================================

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return (context || document).querySelectorAll(selector);
  }

  function createElement(tag, className, content, attrs) {
    className = className || "";
    content = content || "";
    attrs = attrs || {};

    const element = document.createElement(tag);

    if (className) {
      if (Array.isArray(className)) {
        element.classList.add.apply(
          element.classList,
          className.filter(Boolean)
        );
      } else {
        element.className = className;
      }
    }

    if (content) {
      if (typeof content === "string") {
        element.textContent = content;
      } else if (Array.isArray(content)) {
        content.forEach(function (child) {
          if (child) element.appendChild(child);
        });
      } else if (content instanceof Element) {
        element.appendChild(content);
      }
    }

    Object.entries(attrs).forEach(function (entry) {
      var key = entry[0];
      var value = entry[1];
      if (key === "data") {
        Object.entries(value).forEach(function (dataEntry) {
          element.dataset[dataEntry[0]] = dataEntry[1];
        });
      } else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key.startsWith("on") && typeof value === "function") {
        var event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    return element;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function createSVGElement(tag, attrs) {
    attrs = attrs || {};
    var element = document.createElementNS(SVG_NS, tag);

    Object.entries(attrs).forEach(function (entry) {
      if (entry[1] !== undefined && entry[1] !== null) {
        element.setAttribute(entry[0], entry[1]);
      }
    });

    return element;
  }

  function createSVG(width, height, className) {
    var svg = createSVGElement("svg", {
      viewBox: "0 0 " + width + " " + height,
      class: className || "",
      preserveAspectRatio: "xMidYMid meet",
    });
    return svg;
  }

  function createSVGText(text, x, y, attrs) {
    var textElement = createSVGElement(
      "text",
      Object.assign({ x: x, y: y }, attrs || {})
    );
    textElement.textContent = text;
    return textElement;
  }

  function createSVGRect(x, y, width, height, attrs) {
    return createSVGElement(
      "rect",
      Object.assign({ x: x, y: y, width: width, height: height }, attrs || {})
    );
  }

  function createSVGLine(x1, y1, x2, y2, attrs) {
    return createSVGElement(
      "line",
      Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2 }, attrs || {})
    );
  }

  function createSVGGroup(className, children) {
    var group = createSVGElement("g", { class: className || "" });
    (children || []).forEach(function (child) {
      if (child) group.appendChild(child);
    });
    return group;
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  // ============================================================================
  // 3. DATA - generateData.js
  // ============================================================================

  var METRIC_KEYS = {
    OPERATION_MOVEMENT: "Движение Д/С по операционной деятельности ООО",
    OPERATION_INCOME: "Поступления по операционной деятельности",
    OPERATION_EXPENSE: "Расходы по основной деятельности",
    OPERATION_DEPOSITS: "Обеспечительные платежи",
    INVESTMENT_MOVEMENT: "Движение Д/С по инвестиционной деятельности",
    INVESTMENT_DIVIDENDS: "Выплата дохода акционерам (пайщикам)",
    INVESTMENT_REPAIRS: "Расходы на капитальный ремонт",
    FINANCE_MOVEMENT: "Движение Д/С по финансовой деятельности",
    FINANCE_CREDITS: "Расчеты по кредитам",
    FINANCE_OTHER: "Прочие доходы и расходы по финансовой деятельности",
    FINANCE_PARUS: "Расходы на УК Парус",
    CREDIT_START: "Остаток по кредиту на начало периода",
    CREDIT_END: "Остаток по кредиту на конец периода",
    CASH_MOVEMENT: "Движение за период по Д/С",
    RESERVES_FORMED: "Сформированные резервы (нарастающим итогом)",
    RESERVES_ACCUMULATED:
      "Накопленные резервы на ремонт, непредвиденные расходы и вакансию",
    CASH_START: "Остаток Д/С на начало периода",
    CASH_END: "Остаток Д/С на конец периода",
    CASH_WITH_RESERVE: "Д/С на конец периода (с учетом резерва)",
  };

  var BASE_VALUES = {};
  BASE_VALUES[METRIC_KEYS.OPERATION_MOVEMENT] = 1366339;
  BASE_VALUES[METRIC_KEYS.OPERATION_INCOME] = 1366339;
  BASE_VALUES[METRIC_KEYS.OPERATION_EXPENSE] = 1366339;
  BASE_VALUES[METRIC_KEYS.OPERATION_DEPOSITS] = 1366339;
  BASE_VALUES[METRIC_KEYS.INVESTMENT_MOVEMENT] = 1366339;
  BASE_VALUES[METRIC_KEYS.INVESTMENT_DIVIDENDS] = -850000;
  BASE_VALUES[METRIC_KEYS.INVESTMENT_REPAIRS] = 136633;
  BASE_VALUES[METRIC_KEYS.FINANCE_MOVEMENT] = 1366339;
  BASE_VALUES[METRIC_KEYS.FINANCE_CREDITS] = 1366339;
  BASE_VALUES[METRIC_KEYS.FINANCE_OTHER] = 1366339;
  BASE_VALUES[METRIC_KEYS.FINANCE_PARUS] = 1366339;
  BASE_VALUES[METRIC_KEYS.CREDIT_START] = 1366339;
  BASE_VALUES[METRIC_KEYS.CREDIT_END] = 1366339;
  BASE_VALUES[METRIC_KEYS.CASH_MOVEMENT] = 1366339;
  BASE_VALUES[METRIC_KEYS.RESERVES_FORMED] = 1366339;
  BASE_VALUES[METRIC_KEYS.RESERVES_ACCUMULATED] = 1366339;
  BASE_VALUES[METRIC_KEYS.CASH_START] = 1366339;
  BASE_VALUES[METRIC_KEYS.CASH_END] = 1366339;
  BASE_VALUES[METRIC_KEYS.CASH_WITH_RESERVE] = 1366339;

  function generateMetrics(index, fundMultiplier) {
    var yearMultiplier = 1 + index * 0.1;
    var m = fundMultiplier;
    var metrics = {};

    Object.entries(BASE_VALUES).forEach(function (entry) {
      var key = entry[0];
      var baseValue = entry[1];
      if (key === METRIC_KEYS.CREDIT_START || key === METRIC_KEYS.CREDIT_END) {
        metrics[key] = Math.round(baseValue * m * (2 - index * 0.2));
      } else {
        metrics[key] = Math.round(baseValue * m * yearMultiplier);
      }
    });

    return metrics;
  }

  function generatePeriodData(periods, fundMultiplier) {
    fundMultiplier = fundMultiplier || 1;
    if (!Array.isArray(periods) || periods.length === 0) {
      return [];
    }

    return periods.map(function (period, index) {
      return {
        id: "period-" + index,
        title: period.label,
        type: period.type,
        year: period.year,
        metrics: generateMetrics(index, fundMultiplier),
      };
    });
  }

  function calculateDelta(currentValue, previousValue) {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : 100;
    }
    return Math.round(
      ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    );
  }

  var DEFAULT_PERIODS = [
    { year: 2023, type: "fact", label: "Факт '23", shortLabel: "'23" },
    { year: 2024, type: "fact", label: "Факт '24", shortLabel: "'24" },
    {
      year: 2025,
      type: "mixed",
      label: "Факт (I-III кв. '25)\nПлан (IV кв. '25)",
      shortLabel: "'25",
    },
    { year: 2026, type: "plan", label: "План '26", shortLabel: "'26" },
  ];

  var FUND_MULTIPLIERS = {
    ДВН: 1.0,
    ЗОЛЯ: 0.8,
    КРАС: 1.2,
    ЛОГ: 0.9,
    НОР: 1.1,
    ОЗН: 0.7,
    ТРМ: 1.3,
    СБЛ: 0.95,
  };

  function getFundMultiplier(fundName) {
    return FUND_MULTIPLIERS[fundName] || 1.0;
  }

  // ============================================================================
  // 4. COMPONENTS - HighlightBlock.js
  // ============================================================================

  function renderHighlightBlock(rows, periodData, viewMode) {
    var blockEl = createElement("div", "highlight-block");

    rows.forEach(function (row) {
      var rowEl = renderHighlightRow(row, periodData, viewMode);
      blockEl.appendChild(rowEl);
    });

    return blockEl;
  }

  function renderHighlightRow(row, periodData, viewMode) {
    var rowEl = createElement("div", "table-row");

    var labelEl = createElement("span", "table-row__label");
    if (row.multiline) {
      var lines = row.label.split("\n");
      labelEl.innerHTML = lines.join("<br>");
    } else {
      labelEl.textContent = row.label;
    }
    rowEl.appendChild(labelEl);

    var valuesEl = createElement("div", "table-row__values");

    if (viewMode === "details") {
      periodData.forEach(function (period) {
        var value = period.metrics[row.key] || 0;
        var valueEl = createElement("span", "table-row__value");

        if (period.type === "mixed") {
          valueEl.classList.add("table-row__value--wide");
        }

        valueEl.textContent = formatNumber(value);
        valuesEl.appendChild(valueEl);
      });
    } else {
      var firstPeriod = periodData[0];
      var currentPeriod = periodData[2];

      var value1 = firstPeriod ? firstPeriod.metrics[row.key] || 0 : 0;
      var valueEl1 = createElement("span", "table-row__value");
      valueEl1.textContent = formatNumber(value1);
      valuesEl.appendChild(valueEl1);

      var value2 = currentPeriod ? currentPeriod.metrics[row.key] || 0 : 0;
      var valueEl2 = createElement(
        "span",
        "table-row__value table-row__value--wide"
      );
      valueEl2.textContent = formatNumber(value2);
      valuesEl.appendChild(valueEl2);

      var delta = calculateDelta(value2, value1);
      var deltaEl = createElement("span", "table-row__value");
      deltaEl.textContent = formatWithDelta(value2, delta);
      valuesEl.appendChild(deltaEl);
    }

    rowEl.appendChild(valuesEl);
    return rowEl;
  }

  // ============================================================================
  // 5. COMPONENTS - TableSection.js
  // ============================================================================

  var SECTIONS = {
    operation: {
      id: "operation",
      title: "Операционная часть",
      cssClass: "table-section--operation",
      rows: [
        {
          id: "op-movement",
          key: METRIC_KEYS.OPERATION_MOVEMENT,
          label: "Движение Д/С по операционной деятельности ООО",
          isHeader: true,
        },
        {
          id: "op-income",
          key: METRIC_KEYS.OPERATION_INCOME,
          label: "Поступления по операционной деятельности",
          isHeader: false,
        },
        {
          id: "op-expense",
          key: METRIC_KEYS.OPERATION_EXPENSE,
          label: "Расходы по основной деятельности",
          isHeader: false,
        },
        {
          id: "op-deposits",
          key: METRIC_KEYS.OPERATION_DEPOSITS,
          label: "Обеспечительные платежи",
          isHeader: false,
        },
      ],
    },
    investment: {
      id: "investment",
      title: "Инвестиционная часть",
      cssClass: "table-section--investment",
      rows: [
        {
          id: "inv-movement",
          key: METRIC_KEYS.INVESTMENT_MOVEMENT,
          label: "Движение Д/С по инвестиционной деятельности",
          isHeader: true,
        },
        {
          id: "inv-dividends",
          key: METRIC_KEYS.INVESTMENT_DIVIDENDS,
          label: "Выплата дохода акционерам (пайщикам)",
          isHeader: false,
        },
        {
          id: "inv-repairs",
          key: METRIC_KEYS.INVESTMENT_REPAIRS,
          label: "Расходы на капитальный ремонт",
          isHeader: false,
        },
      ],
    },
    finance: {
      id: "finance",
      title: "Финансовая часть",
      cssClass: "table-section--finance",
      rows: [
        {
          id: "fin-movement",
          key: METRIC_KEYS.FINANCE_MOVEMENT,
          label: "Движение Д/С по финансовой деятельности",
          isHeader: true,
        },
        {
          id: "fin-credits",
          key: METRIC_KEYS.FINANCE_CREDITS,
          label: "Расчеты по кредитам",
          isHeader: false,
        },
        {
          id: "fin-other",
          key: METRIC_KEYS.FINANCE_OTHER,
          label: "Прочие доходы и расходы\nпо финансовой деятельности",
          isHeader: false,
          multiline: true,
        },
        {
          id: "fin-parus",
          key: METRIC_KEYS.FINANCE_PARUS,
          label: "Расходы на УК Парус",
          isHeader: false,
        },
      ],
    },
  };

  var CREDIT_BALANCE_ROWS = [
    {
      id: "credit-start",
      key: METRIC_KEYS.CREDIT_START,
      label: "Остаток по кредиту на начало периода",
      isHeader: true,
    },
    {
      id: "credit-end",
      key: METRIC_KEYS.CREDIT_END,
      label: "Остаток по кредиту на конец периода",
      isHeader: true,
    },
  ];

  var CASH_MOVEMENT_ROWS = [
    {
      id: "cash-movement",
      key: METRIC_KEYS.CASH_MOVEMENT,
      label: "Движение за период по Д/С",
      isHeader: true,
    },
    {
      id: "reserves-formed",
      key: METRIC_KEYS.RESERVES_FORMED,
      label: "Сформированные резервы (нарастающим итогом)",
      isHeader: false,
    },
    {
      id: "reserves-accumulated",
      key: METRIC_KEYS.RESERVES_ACCUMULATED,
      label:
        "Накопленные резервы на ремонт,\nнепредвиденные расходы и вакансию",
      isHeader: false,
      multiline: true,
    },
  ];

  var CASH_BALANCE_ROWS = [
    {
      id: "cash-start",
      key: METRIC_KEYS.CASH_START,
      label: "Остаток Д/С на начало периода",
      isHeader: true,
    },
    {
      id: "cash-end",
      key: METRIC_KEYS.CASH_END,
      label: "Остаток Д/С на конец периода",
      isHeader: true,
    },
    {
      id: "cash-reserve",
      key: METRIC_KEYS.CASH_WITH_RESERVE,
      label: "Д/С на конец периода (с учетом резерва)",
      isHeader: true,
    },
  ];

  function renderTableRow(row, periodData, viewMode) {
    var rowClasses = ["table-row"];
    if (row.isHeader) rowClasses.push("table-row--header");

    var rowEl = createElement("div", rowClasses.join(" "));

    var labelEl = createElement("span", "table-row__label");
    if (row.multiline) {
      var lines = row.label.split("\n");
      labelEl.innerHTML = lines.join("<br>");
    } else {
      labelEl.textContent = row.label;
    }
    rowEl.appendChild(labelEl);

    var valuesEl = createElement("div", "table-row__values");

    if (viewMode === "details") {
      periodData.forEach(function (period) {
        var value = period.metrics[row.key] || 0;
        var valueEl = createElement("span", "table-row__value");

        if (period.type === "mixed") {
          valueEl.classList.add("table-row__value--wide");
        }

        valueEl.textContent = formatNumber(value);
        valuesEl.appendChild(valueEl);
      });
    } else {
      var firstPeriod = periodData[0];
      var currentPeriod = periodData[2];

      var value1 = firstPeriod ? firstPeriod.metrics[row.key] || 0 : 0;
      var valueEl1 = createElement("span", "table-row__value");
      valueEl1.textContent = formatNumber(value1);
      valuesEl.appendChild(valueEl1);

      var value2 = currentPeriod ? currentPeriod.metrics[row.key] || 0 : 0;
      var valueEl2 = createElement(
        "span",
        "table-row__value table-row__value--wide"
      );
      valueEl2.textContent = formatNumber(value2);
      valuesEl.appendChild(valueEl2);

      var delta = calculateDelta(value2, value1);
      var deltaEl = createElement("span", "table-row__value");
      deltaEl.textContent = formatWithDelta(value2, delta);
      valuesEl.appendChild(deltaEl);
    }

    rowEl.appendChild(valuesEl);
    return rowEl;
  }

  function renderTableSection(section, periodData, viewMode) {
    var sectionEl = createElement(
      "section",
      "table-section " + section.cssClass
    );

    var titleEl = createElement("h2", "table-section__title", section.title);
    sectionEl.appendChild(titleEl);

    var contentEl = createElement("div", "table-section__content");

    section.rows.forEach(function (row) {
      var rowEl = renderTableRow(row, periodData, viewMode);
      contentEl.appendChild(rowEl);
    });

    sectionEl.appendChild(contentEl);
    return sectionEl;
  }

  function renderTableHeaders(periods, viewMode) {
    var container = createElement("div", "table-header__columns");

    if (viewMode === "details") {
      periods.forEach(function (period) {
        var headerEl = createElement("span", "table-header__column");

        if (period.type === "mixed") {
          headerEl.classList.add("table-header__column--wide");
          var lines = period.label.split("\n");
          headerEl.innerHTML = lines.join("<br>");
        } else {
          headerEl.textContent = period.label;
        }

        container.appendChild(headerEl);
      });
    } else {
      var headers = [
        { label: "Факт '23", wide: false },
        { label: "Факт (I-III кв. '25)\nПлан (IV кв. '25)", wide: true },
        { label: "Дельта", wide: false },
      ];

      headers.forEach(function (header) {
        var headerEl = createElement("span", "table-header__column");
        if (header.wide) {
          headerEl.classList.add("table-header__column--wide");
          var lines = header.label.split("\n");
          headerEl.innerHTML = lines.join("<br>");
        } else {
          headerEl.textContent = header.label;
        }
        container.appendChild(headerEl);
      });
    }

    return container;
  }

  function renderAllTableSections(periodData, viewMode) {
    var fragment = document.createDocumentFragment();

    fragment.appendChild(
      renderTableSection(SECTIONS.operation, periodData, viewMode)
    );
    fragment.appendChild(
      renderTableSection(SECTIONS.investment, periodData, viewMode)
    );

    // Finance section (includes credit balance, cash movement, cash balance)
    var financeSection = createElement(
      "section",
      "table-section table-section--finance"
    );

    // Title with colored background
    var financeTitleEl = createElement(
      "h2",
      "table-section__title",
      SECTIONS.finance.title
    );
    financeSection.appendChild(financeTitleEl);

    // Content container with border
    var financeContentEl = createElement("div", "table-section__content");

    // Finance rows
    SECTIONS.finance.rows.forEach(function (row) {
      financeContentEl.appendChild(renderTableRow(row, periodData, viewMode));
    });

    // Credit balance highlight block (inside finance section)
    financeContentEl.appendChild(
      renderHighlightBlock(CREDIT_BALANCE_ROWS, periodData, viewMode)
    );

    // Cash movement rows
    CASH_MOVEMENT_ROWS.forEach(function (row) {
      financeContentEl.appendChild(renderTableRow(row, periodData, viewMode));
    });

    // Cash balance highlight block (inside finance section)
    financeContentEl.appendChild(
      renderHighlightBlock(CASH_BALANCE_ROWS, periodData, viewMode)
    );

    financeSection.appendChild(financeContentEl);
    fragment.appendChild(financeSection);

    return fragment;
  }

  // ============================================================================
  // 6. COMPONENTS - BarChart.js
  // ============================================================================

  var CHART_CONFIG_DEFAULTS = {
    viewBoxWidth: 300,
    viewBoxHeight: 520,
    chartLeft: 50,
    chartRight: 290,
    chartTop: 20,
    chartBottom: 480,
    barWidth: 45,
    barGap: 15,
    barRadius: 5,
    yAxisLabelX: 40,
    xAxisLabelY: 505,
  };

  function calculateBarHeight(value, scale, maxPixelHeight) {
    var min = scale.min;
    var max = scale.max;
    var range = max - min;

    if (range === 0) return 0;

    var normalized = (value - min) / range;
    return Math.max(0, normalized * maxPixelHeight);
  }

  function generateYAxisLabels(scale, chartTop, chartBottom) {
    var labels = [];
    var min = scale.min;
    var max = scale.max;
    var step = scale.step;
    var chartHeight = chartBottom - chartTop;
    var range = max - min;

    for (var value = max; value >= min; value -= step) {
      if (value === 0) continue;
      var normalized = (max - value) / range;
      var y = chartTop + normalized * chartHeight;
      labels.push({ value: value, y: y + 4 });
    }

    return labels;
  }

  function generateGridLines(
    scale,
    chartTop,
    chartBottom,
    chartLeft,
    chartRight
  ) {
    var lines = [];
    var min = scale.min;
    var max = scale.max;
    var step = scale.step;
    var chartHeight = chartBottom - chartTop;
    var range = max - min;

    for (var value = max; value >= min; value -= step) {
      var normalized = (max - value) / range;
      var y = chartTop + normalized * chartHeight;
      lines.push({ y: y, x1: chartLeft, x2: chartRight });
    }

    lines.push({ y: chartBottom, x1: chartLeft, x2: chartRight });

    return lines;
  }

  function renderBarChart(config, data) {
    var scale = config.scale || { min: 100, max: 1000, step: 100 };
    var customValues = config.customValues || null;
    var colors = config.colors || { fact: "#9DBCE0", plan: "#D9D9D9" };

    var viewBoxWidth = CHART_CONFIG_DEFAULTS.viewBoxWidth;
    var viewBoxHeight = CHART_CONFIG_DEFAULTS.viewBoxHeight;
    var chartLeft = CHART_CONFIG_DEFAULTS.chartLeft;
    var chartRight = CHART_CONFIG_DEFAULTS.chartRight;
    var chartTop = CHART_CONFIG_DEFAULTS.chartTop;
    var chartBottom = CHART_CONFIG_DEFAULTS.chartBottom;
    var barWidth = CHART_CONFIG_DEFAULTS.barWidth;
    var barGap = CHART_CONFIG_DEFAULTS.barGap;
    var barRadius = CHART_CONFIG_DEFAULTS.barRadius;
    var yAxisLabelX = CHART_CONFIG_DEFAULTS.yAxisLabelX;
    var xAxisLabelY = CHART_CONFIG_DEFAULTS.xAxisLabelY;

    var chartHeight = chartBottom - chartTop;
    var chartWidth = chartRight - chartLeft;

    var totalBarsWidth = data.length * barWidth + (data.length - 1) * barGap;
    var barsStartX = chartLeft + (chartWidth - totalBarsWidth) / 2;

    var svg = createSVG(viewBoxWidth, viewBoxHeight, "chart__svg");
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      "Bar chart showing dividend payments by year"
    );

    var titleEl = createSVGElement("title");
    titleEl.textContent = config.title || "Dividend Chart";
    svg.appendChild(titleEl);

    // Y-axis labels
    var yAxisGroup = createSVGGroup("chart__y-axis");
    var yLabels = generateYAxisLabels(scale, chartTop, chartBottom);

    yLabels.forEach(function (label) {
      var text = createSVGText(
        formatNumber(label.value),
        yAxisLabelX,
        label.y,
        { "text-anchor": "end" }
      );
      yAxisGroup.appendChild(text);
    });
    svg.appendChild(yAxisGroup);

    // Grid lines
    var gridGroup = createSVGGroup("chart__grid");
    var gridLines = generateGridLines(
      scale,
      chartTop,
      chartBottom,
      chartLeft,
      chartRight
    );

    gridLines.forEach(function (line) {
      var lineEl = createSVGLine(line.x1, line.y, line.x2, line.y);
      gridGroup.appendChild(lineEl);
    });
    svg.appendChild(gridGroup);

    // Bars
    var barsGroup = createSVGGroup("chart__bars");

    data.forEach(function (item, index) {
      var value =
        customValues && customValues[index] !== undefined
          ? customValues[index]
          : item.value;

      var height = calculateBarHeight(value, scale, chartHeight);
      var x = barsStartX + index * (barWidth + barGap);
      var y = chartBottom - height;

      var actualFill = index < 2 ? colors.fact : colors.plan;

      var rect = createSVGRect(x, y, barWidth, height, {
        rx: barRadius,
        ry: barRadius,
        fill: actualFill,
        class: "chart__bar chart__bar--" + (index < 2 ? "fact" : "plan"),
      });

      rect.setAttribute("aria-label", item.label + ": " + value);

      barsGroup.appendChild(rect);
    });
    svg.appendChild(barsGroup);

    // Value labels
    var valuesGroup = createSVGGroup("chart__values");

    data.forEach(function (item, index) {
      var value =
        customValues && customValues[index] !== undefined
          ? customValues[index]
          : item.value;

      var height = calculateBarHeight(value, scale, chartHeight);
      var x = barsStartX + index * (barWidth + barGap) + barWidth / 2;
      var y = chartBottom - height - 8;

      var text = createSVGText(formatShort(value), x, y, {
        "text-anchor": "middle",
      });
      valuesGroup.appendChild(text);
    });
    svg.appendChild(valuesGroup);

    // X-axis labels
    var xAxisGroup = createSVGGroup("chart__x-axis");

    data.forEach(function (item, index) {
      var x = barsStartX + index * (barWidth + barGap) + barWidth / 2;

      var text = createSVGText(item.label, x, xAxisLabelY, {
        "text-anchor": "middle",
      });
      xAxisGroup.appendChild(text);
    });
    svg.appendChild(xAxisGroup);

    return svg;
  }

  // ============================================================================
  // 7. COMPONENTS - FundSelector.js
  // ============================================================================

  var FUND_ICONS = {
    default:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L4 9v12h16V9l-8-6zm6 16H6v-9l6-4.5 6 4.5v9z"/><rect x="8" y="13" width="3" height="3"/><rect x="13" y="13" width="3" height="3"/><rect x="8" y="17" width="3" height="2"/><rect x="13" y="17" width="3" height="2"/></svg>',
    warehouse:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    office:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>',
  };

  function getFundIcon(fundName) {
    var iconMap = {
      ДВН: "default",
      ЗОЛЯ: "office",
      КРАС: "warehouse",
      ЛОГ: "warehouse",
      НОР: "default",
      ОЗН: "office",
      ТРМ: "warehouse",
      СБЛ: "office",
    };
    var iconType = iconMap[fundName] || "default";
    return FUND_ICONS[iconType] || FUND_ICONS.default;
  }

  var FundSelector = {
    state: { isOpen: false, selected: "ДВН", funds: [], onChange: null },
    elements: {
      container: null,
      trigger: null,
      value: null,
      dropdown: null,
      grid: null,
    },

    init: function (options) {
      options = options || {};
      this.state.selected =
        options.selected || (window.DATA && window.DATA.currentFund) || "ДВН";
      this.state.funds = options.funds ||
        (window.DATA && window.DATA.funds) || [
          "ДВН",
          "ЗОЛЯ",
          "КРАС",
          "ЛОГ",
          "НОР",
          "ОЗН",
          "ТРМ",
          "СБЛ",
        ];
      this.state.onChange = options.onChange || function () {};

      this.elements.container = $("#fundSelector");
      this.elements.trigger = $(
        ".fund-selector__trigger",
        this.elements.container
      );
      this.elements.value = $("#fundSelectorValue");
      this.elements.dropdown = $("#fundDropdown");
      this.elements.grid = $("#fundGrid");

      if (!this.elements.container) {
        console.error("FundSelector: Container element not found");
        return;
      }

      this.render();
      this.attachEvents();
    },

    render: function () {
      var self = this;
      if (!this.elements.grid) return;

      clearElement(this.elements.grid);

      this.state.funds.forEach(function (fund) {
        var item = self.createFundItem(fund);
        self.elements.grid.appendChild(item);
      });

      if (this.elements.value) {
        this.elements.value.textContent = this.state.selected;
      }

      var iconContainer = $(".fund-selector__icon", this.elements.container);
      if (iconContainer) {
        iconContainer.innerHTML = getFundIcon(this.state.selected);
      }
    },

    createFundItem: function (fund) {
      var self = this;
      var isActive = fund === this.state.selected;
      var classes = ["fund-selector__item"];
      if (isActive) classes.push("fund-selector__item--active");

      var item = createElement("div", classes.join(" "), "", {
        role: "option",
        "aria-selected": isActive.toString(),
        data: { fund: fund },
      });

      var icon = createElement("span", "fund-selector__item-icon");
      icon.innerHTML = getFundIcon(fund);
      item.appendChild(icon);

      var name = createElement("span", "fund-selector__item-name", fund);
      item.appendChild(name);

      item.addEventListener("click", function () {
        self.select(fund);
      });

      return item;
    },

    attachEvents: function () {
      var self = this;

      if (this.elements.trigger) {
        this.elements.trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          self.toggle();
        });
      }

      document.addEventListener("click", function (e) {
        if (self.state.isOpen && !self.elements.container.contains(e.target)) {
          self.close();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (!self.state.isOpen) return;
        if (e.key === "Escape") {
          self.close();
          if (self.elements.trigger) self.elements.trigger.focus();
        }
      });
    },

    toggle: function () {
      if (this.state.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function () {
      this.state.isOpen = true;
      this.elements.container.classList.add("fund-selector--open");
      this.elements.container.setAttribute("aria-expanded", "true");
    },

    close: function () {
      this.state.isOpen = false;
      this.elements.container.classList.remove("fund-selector--open");
      this.elements.container.setAttribute("aria-expanded", "false");
    },

    select: function (fund) {
      if (fund === this.state.selected) {
        this.close();
        return;
      }

      this.state.selected = fund;
      this.close();
      this.render();

      if (typeof this.state.onChange === "function") {
        this.state.onChange(fund);
      }
    },

    getSelected: function () {
      return this.state.selected;
    },

    setSelected: function (fund) {
      if (this.state.funds.indexOf(fund) !== -1) {
        this.state.selected = fund;
        this.render();
      }
    },
  };

  // ============================================================================
  // 8. COMPONENTS - ViewToggle.js
  // ============================================================================

  var VIEW_LABELS = {
    details: "Детали за текущий год",
    dynamics: "Динамика по годам",
  };

  var ViewToggle = {
    state: { mode: "details", onChange: null },
    elements: { button: null, text: null },

    init: function (options) {
      options = options || {};
      this.state.mode =
        options.mode || (window.DATA && window.DATA.viewMode) || "details";
      this.state.onChange = options.onChange || function () {};

      this.elements.button = $("#viewToggle");
      this.elements.text = $("#viewToggleText");

      if (!this.elements.button) {
        console.error("ViewToggle: Button element not found");
        return;
      }

      this.render();
      this.attachEvents();
    },

    render: function () {
      if (this.elements.text) {
        this.elements.text.textContent = VIEW_LABELS[this.state.mode];
      }

      if (this.elements.button) {
        var nextMode = this.state.mode === "details" ? "dynamics" : "details";
        this.elements.button.setAttribute(
          "aria-label",
          "Переключить на " + VIEW_LABELS[nextMode]
        );
      }
    },

    attachEvents: function () {
      var self = this;
      if (this.elements.button) {
        this.elements.button.addEventListener("click", function () {
          self.toggle();
        });
      }
    },

    toggle: function () {
      this.state.mode = this.state.mode === "details" ? "dynamics" : "details";
      this.render();

      if (typeof this.state.onChange === "function") {
        this.state.onChange(this.state.mode);
      }
    },

    getMode: function () {
      return this.state.mode;
    },

    setMode: function (mode) {
      if (mode === "details" || mode === "dynamics") {
        this.state.mode = mode;
        this.render();
      }
    },
  };

  // ============================================================================
  // 9. MAIN - Dashboard.js
  // ============================================================================

  var Dashboard = {
    state: {
      currentFund: "ДВН",
      viewMode: "details",
      periods: [],
      periodData: [],
      chartConfig: {},
    },

    elements: {
      tableContainer: null,
      tableHeaders: null,
      tableSections: null,
      chartContainer: null,
      chartTitle: null,
    },

    init: function () {
      var config = window.DATA || {};

      this.state.currentFund = config.currentFund || "ДВН";
      this.state.viewMode = config.viewMode || "details";
      this.state.periods = config.periods || DEFAULT_PERIODS;
      this.state.chartConfig = config.chartConfig || {
        title: "Выплата дохода акционерам (пайщикам), тыс. ₽",
        metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
        scale: { min: 100, max: 1000, step: 100 },
        customValues: [390, 670, 860, 980],
      };

      this.elements.tableContainer = $(".content__table");
      this.elements.tableHeaders = $("#tableHeaderColumns");
      this.elements.tableSections = $("#tableSections");
      this.elements.chartContainer = $("#chartContainer");
      this.elements.chartTitle = $("#chartTitle");

      this.generateData();
      this.initComponents();
      this.render();

      console.log("Dashboard initialized");
    },

    initComponents: function () {
      var self = this;

      FundSelector.init({
        selected: this.state.currentFund,
        funds: (window.DATA && window.DATA.funds) || [
          "ДВН",
          "ЗОЛЯ",
          "КРАС",
          "ЛОГ",
          "НОР",
          "ОЗН",
          "ТРМ",
          "СБЛ",
        ],
        onChange: function (fund) {
          self.handleFundChange(fund);
        },
      });

      ViewToggle.init({
        mode: this.state.viewMode,
        onChange: function (mode) {
          self.handleViewModeChange(mode);
        },
      });
    },

    generateData: function () {
      var multiplier = getFundMultiplier(this.state.currentFund);
      this.state.periodData = generatePeriodData(
        this.state.periods,
        multiplier
      );
    },

    render: function () {
      // Toggle view mode class on table container
      if (this.elements.tableContainer) {
        this.elements.tableContainer.classList.toggle(
          "content__table--dynamics",
          this.state.viewMode === "dynamics"
        );
      }

      this.renderTableHeaders();
      this.renderTableSections();
      this.renderChart();
    },

    renderTableHeaders: function () {
      if (!this.elements.tableHeaders) return;

      clearElement(this.elements.tableHeaders);

      var headers = renderTableHeaders(this.state.periods, this.state.viewMode);
      while (headers.firstChild) {
        this.elements.tableHeaders.appendChild(headers.firstChild);
      }
    },

    renderTableSections: function () {
      if (!this.elements.tableSections) return;

      clearElement(this.elements.tableSections);

      var sections = renderAllTableSections(
        this.state.periodData,
        this.state.viewMode
      );

      this.elements.tableSections.appendChild(sections);
    },

    renderChart: function () {
      if (!this.elements.chartContainer) return;

      clearElement(this.elements.chartContainer);

      if (this.elements.chartTitle) {
        this.elements.chartTitle.textContent = this.state.chartConfig.title;
      }

      var chartData = this.state.periods.map(function (period, index) {
        return {
          label:
            period.label.indexOf("\n") !== -1
              ? "План '" + (period.shortLabel || "25")
              : period.label,
          value:
            (this.state.chartConfig.customValues &&
              this.state.chartConfig.customValues[index]) ||
            0,
          type: period.type,
        };
      }, this);

      var svg = renderBarChart(this.state.chartConfig, chartData);
      this.elements.chartContainer.appendChild(svg);
    },

    handleFundChange: function (fund) {
      this.state.currentFund = fund;
      this.generateData();
      this.render();
    },

    handleViewModeChange: function (mode) {
      this.state.viewMode = mode;
      this.render();
    },

    updateData: function (newData) {
      if (newData.periods) {
        this.state.periods = newData.periods;
      }
      if (newData.chartConfig) {
        this.state.chartConfig = Object.assign(
          {},
          this.state.chartConfig,
          newData.chartConfig
        );
      }
      if (newData.currentFund) {
        this.state.currentFund = newData.currentFund;
        FundSelector.setSelected(newData.currentFund);
      }

      this.generateData();
      this.render();
    },

    getState: function () {
      return Object.assign({}, this.state);
    },
  };

  // ============================================================================
  // 10. INITIALIZATION
  // ============================================================================

  function initDashboard() {
    Dashboard.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
  } else {
    initDashboard();
  }

  // Expose to global scope for debugging
  window.BDDS = {
    Dashboard: Dashboard,
    FundSelector: FundSelector,
    ViewToggle: ViewToggle,
    formatNumber: formatNumber,
    generatePeriodData: generatePeriodData,
  };
})();
