/**
 * BarChart.js - SVG Bar Chart Component for BDDS Dashboard
 *
 * Renders a customizable bar chart with configurable scale,
 * custom heights, and colors based on period type (fact/plan)
 */

/**
 * Chart dimensions and layout constants
 */
const CHART_CONFIG_DEFAULTS = {
  // SVG viewBox dimensions
  viewBoxWidth: 350,
  viewBoxHeight: 500,

  // Chart area
  chartLeft: 50,      // Left margin for Y-axis labels
  chartRight: 340,    // Right edge
  chartTop: 50,       // Top margin for values
  chartBottom: 470,   // Bottom edge (above X labels)

  // Bars
  barWidth: 50,
  barGap: 12,
  barRadius: 5,

  // Y-axis
  yAxisLabelX: 40,

  // X-axis labels
  xAxisLabelY: 490
};

/**
 * Calculate bar height in pixels based on value and scale
 * @param {number} value - Data value
 * @param {Object} scale - Scale configuration { min, max }
 * @param {number} maxPixelHeight - Maximum height in pixels
 * @returns {number} Height in pixels
 */
function calculateBarHeight(value, scale, maxPixelHeight) {
  const { min, max } = scale;
  const range = max - min;

  if (range === 0) return 0;

  const normalized = (value - min) / range;
  return Math.max(0, normalized * maxPixelHeight);
}

/**
 * Calculate Y position for a bar (top of bar)
 * @param {number} height - Bar height in pixels
 * @param {number} baseY - Base Y position (bottom of chart)
 * @returns {number} Y position for rect element
 */
function calculateBarY(height, baseY) {
  return baseY - height;
}

/**
 * Generate Y-axis labels
 * @param {Object} scale - Scale { min, max, step }
 * @returns {Array} Array of { value, y } positions
 */
function generateYAxisLabels(scale, chartTop, chartBottom) {
  const labels = [];
  const { min, max, step } = scale;
  const chartHeight = chartBottom - chartTop;
  const range = max - min;

  for (let value = max; value >= min; value -= step) {
    if (value === 0) continue; // Skip zero label
    const normalized = (max - value) / range;
    const y = chartTop + normalized * chartHeight;
    labels.push({ value, y: y + 4 }); // +4 for text baseline alignment
  }

  return labels;
}

/**
 * Generate horizontal grid lines
 * @param {Object} scale - Scale { min, max, step }
 * @param {number} chartTop - Top Y position
 * @param {number} chartBottom - Bottom Y position
 * @param {number} chartLeft - Left X position
 * @param {number} chartRight - Right X position
 * @returns {Array} Array of { y, x1, x2 } positions
 */
function generateGridLines(scale, chartTop, chartBottom, chartLeft, chartRight) {
  const lines = [];
  const { min, max, step } = scale;
  const chartHeight = chartBottom - chartTop;
  const range = max - min;

  for (let value = max; value >= min; value -= step) {
    const normalized = (max - value) / range;
    const y = chartTop + normalized * chartHeight;
    lines.push({ y, x1: chartLeft, x2: chartRight });
  }

  // Add bottom line
  lines.push({ y: chartBottom, x1: chartLeft, x2: chartRight });

  return lines;
}

/**
 * Render the bar chart SVG
 * @param {Object} config - Chart configuration
 * @param {Array} data - Chart data array [{ label, value, type }]
 * @returns {SVGElement} SVG element
 */
function renderBarChart(config, data) {
  const {
    scale = { min: 100, max: 1000, step: 100 },
    customValues = null,
    colors = { fact: '#9DBCE0', plan: '#D9D9D9' }
  } = config;

  const {
    viewBoxWidth,
    viewBoxHeight,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    barWidth,
    barGap,
    barRadius,
    yAxisLabelX,
    xAxisLabelY
  } = CHART_CONFIG_DEFAULTS;

  // Calculate chart dimensions
  const chartHeight = chartBottom - chartTop;
  const chartWidth = chartRight - chartLeft;

  // Calculate bar positions
  const totalBarsWidth = data.length * barWidth + (data.length - 1) * barGap;
  const barsStartX = chartLeft + (chartWidth - totalBarsWidth) / 2;

  // Create SVG
  const svg = createSVG(viewBoxWidth, viewBoxHeight, 'chart__svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Bar chart showing dividend payments by year');

  // Add title element for accessibility
  const titleEl = createSVGElement('title');
  titleEl.textContent = config.title || 'Dividend Chart';
  svg.appendChild(titleEl);

  // Y-axis labels
  const yAxisGroup = createSVGGroup('chart__y-axis');
  const yLabels = generateYAxisLabels(scale, chartTop, chartBottom);

  yLabels.forEach(label => {
    const text = createSVGText(
      formatNumber(label.value),
      yAxisLabelX,
      label.y,
      { 'text-anchor': 'end' }
    );
    yAxisGroup.appendChild(text);
  });
  svg.appendChild(yAxisGroup);

  // Grid lines
  const gridGroup = createSVGGroup('chart__grid');
  const gridLines = generateGridLines(scale, chartTop, chartBottom, chartLeft, chartRight);

  gridLines.forEach(line => {
    const lineEl = createSVGLine(line.x1, line.y, line.x2, line.y);
    gridGroup.appendChild(lineEl);
  });
  svg.appendChild(gridGroup);

  // Bars
  const barsGroup = createSVGGroup('chart__bars');

  data.forEach((item, index) => {
    // Use custom value if provided, otherwise use data value
    const value = customValues && customValues[index] !== undefined
      ? customValues[index]
      : item.value;

    const height = calculateBarHeight(value, scale, chartHeight);
    const x = barsStartX + index * (barWidth + barGap);
    const y = calculateBarY(height, chartBottom);

    // Determine color based on period type
    const fill = item.type === 'fact' || item.type === 'mixed'
      ? colors.fact
      : colors.plan;

    // For mixed type, use fact color for first two, plan for others
    const actualFill = index < 2 ? colors.fact : colors.plan;

    const rect = createSVGRect(x, y, barWidth, height, {
      rx: barRadius,
      ry: barRadius,
      fill: actualFill,
      class: `chart__bar chart__bar--${index < 2 ? 'fact' : 'plan'}`
    });

    // Add aria label for accessibility
    rect.setAttribute('aria-label', `${item.label}: ${value}`);

    barsGroup.appendChild(rect);
  });
  svg.appendChild(barsGroup);

  // Value labels above bars
  const valuesGroup = createSVGGroup('chart__values');

  data.forEach((item, index) => {
    const value = customValues && customValues[index] !== undefined
      ? customValues[index]
      : item.value;

    const height = calculateBarHeight(value, scale, chartHeight);
    const x = barsStartX + index * (barWidth + barGap) + barWidth / 2;
    const y = calculateBarY(height, chartBottom) - 8; // 8px above bar

    const text = createSVGText(formatShort(value), x, y, {
      'text-anchor': 'middle'
    });
    valuesGroup.appendChild(text);
  });
  svg.appendChild(valuesGroup);

  // X-axis labels
  const xAxisGroup = createSVGGroup('chart__x-axis');

  data.forEach((item, index) => {
    const x = barsStartX + index * (barWidth + barGap) + barWidth / 2;

    const text = createSVGText(item.label, x, xAxisLabelY, {
      'text-anchor': 'middle'
    });
    xAxisGroup.appendChild(text);
  });
  svg.appendChild(xAxisGroup);

  return svg;
}

/**
 * Generate chart data from period data
 * @param {Array} periodData - Generated period data
 * @param {string} metricKey - Metric key for values
 * @returns {Array} Chart data array
 */
function createChartData(periodData, metricKey) {
  return periodData.map(period => ({
    label: period.title.includes('\n')
      ? period.title.split('\n')[0].replace('Факт ', '').replace('План ', '')
      : period.title,
    value: Math.abs(period.metrics[metricKey] || 0),
    type: period.type
  }));
}

/**
 * Create simplified chart labels
 * @param {Array} periods - Period definitions
 * @returns {Array} Simplified labels
 */
function createChartLabels(periods) {
  return periods.map(period => {
    // Simplify multi-line labels
    if (period.label.includes('\n')) {
      return "План '25";
    }
    return period.label;
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHART_CONFIG_DEFAULTS,
    calculateBarHeight,
    calculateBarY,
    generateYAxisLabels,
    generateGridLines,
    renderBarChart,
    createChartData,
    createChartLabels
  };
}
