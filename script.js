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
    if (value === null || value === undefined) {
      return "-";
    }
    if (isNaN(value)) {
      return "0";
    }

    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat("ru-RU", {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(absValue);

    const withRegularSpace = formatted.replace(/\u00A0/g, " ");
    return value < 0 ? `(${withRegularSpace})` : withRegularSpace;
  }

  /**
   * Format a number with delta percentage
   */
  function formatWithDelta(value, delta) {
    const formattedValue = formatNumber(value);
    if (delta === null) {
      return { value: formattedValue, delta: null };
    }
    const deltaStr = `(${Math.round(delta)}%)`;
    return { value: formattedValue, delta: deltaStr };
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
  // 3. COMPONENTS - HighlightBlock.js
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
        var value = period.metrics[row.key];
        var valueEl = createElement("span", "table-row__value");

        if (period.type === "mixed") {
          valueEl.classList.add("table-row__value--wide");
        }

        valueEl.textContent = formatNumber(value);
        valuesEl.appendChild(valueEl);
      });
    } else {
      // Dynamics mode: first period vs last period
      var firstPeriod = periodData[0];
      var lastPeriod = periodData[periodData.length - 1];
      var isSinglePeriod = periodData.length === 1;

      var value1 = firstPeriod ? firstPeriod.metrics[row.key] : null;
      var valueEl1 = createElement("span", "table-row__value");
      valueEl1.textContent = formatNumber(value1);
      valuesEl.appendChild(valueEl1);

      // If single period, show same value; otherwise show last period
      var value2 = isSinglePeriod
        ? value1
        : lastPeriod
        ? lastPeriod.metrics[row.key]
        : null;
      var valueEl2 = createElement(
        "span",
        "table-row__value table-row__value--wide"
      );
      valueEl2.textContent = formatNumber(value2);
      valuesEl.appendChild(valueEl2);

      // Delta: 0 if same period, otherwise calculate
      var delta = isSinglePeriod ? 0 : calculateDelta(value2, value1);
      var formatted = formatWithDelta(value2, delta);
      var deltaEl = createElement("span", "table-row__value");
      deltaEl.textContent = formatted.value;
      if (formatted.delta !== null) {
        var deltaSpan = createElement("span", "table-row__delta");
        deltaSpan.textContent = formatted.delta;
        deltaEl.appendChild(deltaSpan);
      }
      valuesEl.appendChild(deltaEl);
    }

    rowEl.appendChild(valuesEl);
    return rowEl;
  }

  // ============================================================================
  // 4. COMPONENTS - TableSection.js
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
        var value = period.metrics[row.key];
        var valueEl = createElement("span", "table-row__value");

        if (period.type === "mixed") {
          valueEl.classList.add("table-row__value--wide");
        }

        valueEl.textContent = formatNumber(value);
        valuesEl.appendChild(valueEl);
      });
    } else {
      // Dynamics mode: first period vs last period
      var firstPeriod = periodData[0];
      var lastPeriod = periodData[periodData.length - 1];
      var isSinglePeriod = periodData.length === 1;

      var value1 = firstPeriod ? firstPeriod.metrics[row.key] : null;
      var valueEl1 = createElement("span", "table-row__value");
      valueEl1.textContent = formatNumber(value1);
      valuesEl.appendChild(valueEl1);

      // If single period, show same value; otherwise show last period
      var value2 = isSinglePeriod
        ? value1
        : lastPeriod
        ? lastPeriod.metrics[row.key]
        : null;
      var valueEl2 = createElement(
        "span",
        "table-row__value table-row__value--wide"
      );
      valueEl2.textContent = formatNumber(value2);
      valuesEl.appendChild(valueEl2);

      // Delta: 0 if same period, otherwise calculate
      var delta = isSinglePeriod ? 0 : calculateDelta(value2, value1);
      var formatted = formatWithDelta(value2, delta);
      var deltaEl = createElement("span", "table-row__value");
      deltaEl.textContent = formatted.value;
      if (formatted.delta !== null) {
        var deltaSpan = createElement("span", "table-row__delta");
        deltaSpan.textContent = formatted.delta;
        deltaEl.appendChild(deltaSpan);
      }
      valuesEl.appendChild(deltaEl);
    }

    rowEl.appendChild(valuesEl);
    return rowEl;
  }

  function renderTableSection(section, periodData, viewMode, periods) {
    var sectionEl = createElement(
      "section",
      "table-section " + section.cssClass
    );

    var titleEl = createElement("h2", "table-section__title", section.title);
    sectionEl.appendChild(titleEl);

    // Column headers for mobile (hidden on desktop via CSS)
    if (periodData && periodData.length > 0) {
      var columnHeaders = renderTableHeaders(periodData, viewMode);
      columnHeaders.classList.add("table-section__headers");
      sectionEl.appendChild(columnHeaders);
    }

    var contentEl = createElement("div", "table-section__content");

    section.rows.forEach(function (row) {
      var rowEl = renderTableRow(row, periodData, viewMode);
      contentEl.appendChild(rowEl);
    });

    sectionEl.appendChild(contentEl);
    return sectionEl;
  }

  function renderTableHeaders(periodData, viewMode) {
    var container = createElement("div", "table-header__columns");

    if (viewMode === "details") {
      periodData.forEach(function (period) {
        var headerEl = createElement("span", "table-header__column");

        if (period.type === "mixed") {
          headerEl.classList.add("table-header__column--wide");
          var lines = period.title.split("\n");
          headerEl.innerHTML = lines.join("<br>");
        } else {
          headerEl.textContent = period.title;
        }

        container.appendChild(headerEl);
      });
    } else {
      // Dynamics mode: first period, last period, delta
      var firstPeriod = periodData[0];
      var lastPeriod = periodData[periodData.length - 1];
      var isSinglePeriod = periodData.length === 1;

      var headers = [
        {
          label: firstPeriod ? firstPeriod.title : "-",
          wide: firstPeriod && firstPeriod.type === "mixed",
        },
        {
          label: isSinglePeriod
            ? firstPeriod.title
            : lastPeriod
            ? lastPeriod.title
            : "-",
          wide: lastPeriod && lastPeriod.type === "mixed",
        },
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

  function renderAllTableSections(periodData, viewMode, periods) {
    var fragment = document.createDocumentFragment();

    fragment.appendChild(
      renderTableSection(SECTIONS.operation, periodData, viewMode, periods)
    );
    fragment.appendChild(
      renderTableSection(SECTIONS.investment, periodData, viewMode, periods)
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

    // Column headers for mobile (hidden on desktop via CSS)
    if (periodData && periodData.length > 0) {
      var columnHeaders = renderTableHeaders(periodData, viewMode);
      columnHeaders.classList.add("table-section__headers");
      financeSection.appendChild(columnHeaders);
    }

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
  // 5. COMPONENTS - BarChart.js
  // ============================================================================

  // Mobile detection helper
  function isMobile() {
    return window.innerWidth < 768;
  }

  // Desktop chart config
  var CHART_CONFIG_DESKTOP = {
    viewBoxWidth: 300,
    viewBoxHeight: 520,
    chartLeft: 50,
    chartRight: 290,
    chartTop: 20,
    chartBottom: 480,
    barWidth: 50,
    barGap: 12,
    barRadius: 5,
    yAxisLabelX: 40,
    xAxisLabelY: 505,
  };

  // Mobile chart config (per Figma spec)
  var CHART_CONFIG_MOBILE = {
    viewBoxWidth: 260,
    viewBoxHeight: 360,
    chartLeft: 40,
    chartRight: 250,
    chartTop: 15,
    chartBottom: 320,
    barWidth: 34,
    barGap: 8,
    barRadius: 4,
    yAxisLabelX: 35,
    xAxisLabelY: 345,
  };

  // Get chart config based on viewport
  function getChartConfig() {
    return isMobile() ? CHART_CONFIG_MOBILE : CHART_CONFIG_DESKTOP;
  }

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

    // Use responsive chart config based on viewport
    var chartLayout = getChartConfig();

    var viewBoxWidth = chartLayout.viewBoxWidth;
    var viewBoxHeight = chartLayout.viewBoxHeight;
    var chartLeft = chartLayout.chartLeft;
    var chartRight = chartLayout.chartRight;
    var chartTop = chartLayout.chartTop;
    var chartBottom = chartLayout.chartBottom;
    var barWidth = chartLayout.barWidth;
    var barGap = chartLayout.barGap;
    var barRadius = chartLayout.barRadius;
    var yAxisLabelX = chartLayout.yAxisLabelX;
    var xAxisLabelY = chartLayout.xAxisLabelY;

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
  // 6. COMPONENTS - FundSelector.js
  // ============================================================================

  var FUND_ICONS = {
    warehouse:
      '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 10V19H3V10L11 4L19 10Z" fill="#A9DB21"/><rect x="5" y="12" width="4" height="5" fill="white"/><rect x="13" y="12" width="4" height="5" fill="white"/></svg>',
    building:
      '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3H13V19H4V3Z" fill="#9DBCE0"/><path d="M13 8H18V19H13V8Z" fill="#9DBCE0"/><rect x="6" y="5" width="2" height="2" fill="white"/><rect x="9" y="5" width="2" height="2" fill="white"/><rect x="6" y="9" width="2" height="2" fill="white"/><rect x="9" y="9" width="2" height="2" fill="white"/><rect x="6" y="13" width="2" height="2" fill="white"/><rect x="9" y="13" width="2" height="2" fill="white"/><rect x="14" y="10" width="2" height="2" fill="white"/><rect x="14" y="14" width="2" height="2" fill="white"/></svg>',
    briefcase:
      '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="16" height="11" rx="1" fill="#C7A4C0"/><path d="M8 7V5C8 4.44772 8.44772 4 9 4H13C13.5523 4 14 4.44772 14 5V7" stroke="#C7A4C0" stroke-width="2"/><rect x="10" y="10" width="2" height="4" fill="white"/></svg>',
  };

  var FUND_GROUPS = [
    { icon: "warehouse", funds: ["ЗОЛЯ", "КРАС", "ЛОГ", "НОР", "ОЗН", "СБЛ"] },
    { icon: "building", funds: ["ДВН"] },
    { icon: "briefcase", funds: ["ТРМ"] },
  ];

  function getFundIcon(fundName) {
    var iconMap = {
      ДВН: "building",
      ЗОЛЯ: "warehouse",
      КРАС: "warehouse",
      ЛОГ: "warehouse",
      НОР: "warehouse",
      ОЗН: "warehouse",
      СБЛ: "warehouse",
      ТРМ: "briefcase",
    };
    var iconType = iconMap[fundName] || "building";
    return FUND_ICONS[iconType] || FUND_ICONS.building;
  }

  var FundSelector = {
    state: {
      isOpen: false,
      selected: "ДВН",
      funds: [],
      onChange: null,
      initialized: false,
    },
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
      // Only attach events once
      if (!this.state.initialized) {
        this.attachEvents();
        this.state.initialized = true;
      }
    },

    buildDynamicGroups: function () {
      var self = this;
      var knownFunds = {};

      // Map known funds to their icons
      FUND_GROUPS.forEach(function (group) {
        group.funds.forEach(function (fund) {
          knownFunds[fund] = group.icon;
        });
      });

      // Categorize available funds
      var groups = {};
      this.state.funds.forEach(function (fund) {
        var icon = knownFunds[fund] || "building"; // default icon for unknown funds
        if (!groups[icon]) {
          groups[icon] = { icon: icon, funds: [] };
        }
        groups[icon].funds.push(fund);
      });

      // Convert to array and sort by icon type for consistent ordering
      var iconOrder = ["warehouse", "building", "briefcase"];
      return iconOrder
        .filter(function (icon) {
          return groups[icon];
        })
        .map(function (icon) {
          return groups[icon];
        });
    },

    render: function () {
      var self = this;
      if (!this.elements.grid) return;

      clearElement(this.elements.grid);

      // Build dynamic groups based on available funds
      var dynamicGroups = this.buildDynamicGroups();

      dynamicGroups.forEach(function (group) {
        var groupEl = self.createFundGroup(group);
        self.elements.grid.appendChild(groupEl);
      });

      if (this.elements.value) {
        this.elements.value.textContent = this.state.selected;
      }

      var iconContainer = $(".fund-selector__icon", this.elements.container);
      if (iconContainer) {
        iconContainer.innerHTML = getFundIcon(this.state.selected);
      }
    },

    createFundGroup: function (group) {
      var self = this;

      var groupEl = createElement("div", "fund-selector__group");

      var icon = createElement("span", "fund-selector__group-icon");
      icon.innerHTML = FUND_ICONS[group.icon];
      groupEl.appendChild(icon);

      var separator = createElement("div", "fund-selector__group-separator");
      groupEl.appendChild(separator);

      var fundsContainer = createElement("div", "fund-selector__group-funds");

      group.funds.forEach(function (fund) {
        var isActive = fund === self.state.selected;
        var fundEl = createElement(
          "span",
          "fund-selector__fund" +
            (isActive ? " fund-selector__fund--active" : ""),
          fund
        );
        fundEl.addEventListener("click", function () {
          self.select(fund);
        });
        fundsContainer.appendChild(fundEl);
      });

      groupEl.appendChild(fundsContainer);
      return groupEl;
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
  // 7. COMPONENTS - ViewToggle.js
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
      this.elements.mobileButton = $("#viewToggleMobile");

      if (!this.elements.button && !this.elements.mobileButton) {
        console.error("ViewToggle: Button elements not found");
        return;
      }

      this.render();
      this.attachEvents();
    },

    render: function () {
      if (this.elements.text) {
        this.elements.text.textContent = VIEW_LABELS[this.state.mode];
      }

      // Update mobile button text
      if (this.elements.mobileButton) {
        var mobileText = this.elements.mobileButton.querySelector("span");
        if (mobileText) {
          mobileText.textContent = VIEW_LABELS[this.state.mode];
        }
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
      // Also bind mobile button
      if (this.elements.mobileButton) {
        this.elements.mobileButton.addEventListener("click", function () {
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
  // 8. MAIN - Dashboard.js
  // ============================================================================

  var Dashboard = {
    state: {
      currentFund: "ДВН",
      viewMode: "details",
      periods: [],
      periodData: [],
      chartConfig: {},
      rawApiData: null,
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
      this.state.chartConfig = config.chartConfig || DEFAULT_CHART_CONFIG;

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

      // Get funds list from rawApiData or use defaults
      var funds = ["ДВН", "ЗОЛЯ", "КРАС", "ЛОГ", "НОР", "ОЗН", "ТРМ", "СБЛ"];
      if (this.state.rawApiData && this.state.rawApiData.data) {
        funds = Object.keys(this.state.rawApiData.data);
      }

      FundSelector.init({
        selected: this.state.currentFund,
        funds: funds,
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
      if (this.state.rawApiData) {
        // Use real API data
        this.state.periodData = transformRawApiData(
          this.state.rawApiData,
          this.state.currentFund
        );
      } else {
        // Fallback to generated test data
        var multiplier = getFundMultiplier(this.state.currentFund);
        this.state.periodData = generatePeriodData(
          this.state.periods,
          multiplier
        );
      }
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

      var headers = renderTableHeaders(
        this.state.periodData,
        this.state.viewMode
      );
      while (headers.firstChild) {
        this.elements.tableHeaders.appendChild(headers.firstChild);
      }
    },

    renderTableSections: function () {
      if (!this.elements.tableSections) return;

      clearElement(this.elements.tableSections);

      var sections = renderAllTableSections(
        this.state.periodData,
        this.state.viewMode,
        this.state.periods
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

    /**
     * Load raw API data and re-render dashboard
     * @param {Object} rawApiData - Data from API in format { data: { fundName: { period: { metric: value } } } }
     */
    loadData: function (rawApiData) {
      this.state.rawApiData = rawApiData;

      // Update funds list and current fund from new data
      if (rawApiData && rawApiData.data) {
        var funds = Object.keys(rawApiData.data);
        if (funds.length > 0) {
          // Set first fund as current if current is not in new list
          if (funds.indexOf(this.state.currentFund) === -1) {
            this.state.currentFund = funds[0];
          }
          // Re-initialize FundSelector with new funds list
          FundSelector.init({
            selected: this.state.currentFund,
            funds: funds,
            onChange: this.handleFundChange.bind(this),
          });
        }
      }

      this.generateData();
      this.render();
    },

    getState: function () {
      return Object.assign({}, this.state);
    },
  };

  // ============================================================================
  // 9. CONTAIN-FIT SCALING
  // ============================================================================

  var ContainScale = {
    viewport: null,
    dashboard: null,
    designWidth: 1280,
    designHeight: 720,
    mobileDesignWidth: 320,
    mobileDesignHeight: 1360,

    init: function () {
      this.viewport = document.querySelector(".dashboard-viewport");
      this.dashboard = document.querySelector(".dashboard");

      if (!this.viewport || !this.dashboard) {
        console.warn("ContainScale: Required elements not found");
        return;
      }

      this.applyScale();
      this.attachEvents();
    },

    applyScale: function () {
      if (!this.viewport || !this.dashboard) return;

      // Reset height to get actual viewport dimensions
      this.viewport.style.height = '';

      var viewportWidth = this.viewport.clientWidth;
      var viewportHeight = window.innerHeight;

      // Choose design dimensions based on viewport width
      var isMobileViewport = viewportWidth < 768;
      var designWidth = isMobileViewport
        ? this.mobileDesignWidth
        : this.designWidth;
      var designHeight = isMobileViewport
        ? this.mobileDesignHeight
        : this.designHeight;

      // Calculate scale to fit (contain behavior)
      var scaleX = viewportWidth / designWidth;
      var scaleY = viewportHeight / designHeight;
      var scale = Math.min(scaleX, scaleY);

      // Apply transform
      this.dashboard.style.transform = "scale(" + scale + ")";

      // Set viewport height to match scaled content
      var scaledHeight = designHeight * scale;
      this.viewport.style.height = scaledHeight + "px";
    },

    attachEvents: function () {
      var self = this;
      var resizeTimeout;

      window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
          self.applyScale();
        }, 50);
      });
    },
  };

  // ============================================================================
  // 10. INITIALIZATION
  // ============================================================================

  function initDashboard() {
    Dashboard.init();
    ContainScale.init();

    // Re-render chart on resize (debounced)
    var resizeTimeout;
    var lastIsMobile = isMobile();

    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        var currentIsMobile = isMobile();
        // Only re-render if crossing the breakpoint
        if (currentIsMobile !== lastIsMobile) {
          lastIsMobile = currentIsMobile;
          Dashboard.renderChart();
        }
      }, 150);
    });
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
    ContainScale: ContainScale,
    formatNumber: formatNumber,
    generatePeriodData: generatePeriodData,
  };
})();
