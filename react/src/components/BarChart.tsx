import { useMemo } from 'react'
import type { Period } from '../types'
import { formatNumber, formatShort, calculateChartScale } from '../utils'
import { METRIC_KEYS } from '../constants/metricKeys'

interface BarChartProps {
  periods: Period[]
  metric?: string
  title?: string
  colors?: { fact: string; plan: string }
}

const CHART_CONFIG = {
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
}

export function BarChart({
  periods,
  metric = METRIC_KEYS.INVESTMENT_DIVIDENDS,
  title = 'Выплата дохода акционерам (пайщикам), млн ₽',
  colors = { fact: '#9DBCE0', plan: '#D9D9D9' },
}: BarChartProps) {
  const data = useMemo(() => {
    return periods.map((p) => ({
      label: p.title.split('\n')[0].replace(/Факт |План /g, ''),
      value: Math.abs(p.metrics[metric] ?? 0),
      type: p.type,
    }))
  }, [periods, metric])

  const maxValue = Math.max(...data.map((d) => d.value), 0)
  const scale = calculateChartScale(maxValue)

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
    xAxisLabelY,
  } = CHART_CONFIG

  const chartHeight = chartBottom - chartTop
  const chartWidth = chartRight - chartLeft
  const totalBarsWidth = data.length * barWidth + (data.length - 1) * barGap
  const barsStartX = chartLeft + (chartWidth - totalBarsWidth) / 2

  const yLabels = useMemo(() => {
    const labels = []
    for (let value = scale.max; value >= scale.min; value -= scale.step) {
      if (value === 0) continue
      const normalized = (scale.max - value) / (scale.max - scale.min)
      const y = chartTop + normalized * chartHeight
      labels.push({ value, y: y + 4 })
    }
    return labels
  }, [scale, chartHeight])

  const gridLines = useMemo(() => {
    const lines = []
    for (let value = scale.max; value >= scale.min; value -= scale.step) {
      const normalized = (scale.max - value) / (scale.max - scale.min)
      const y = chartTop + normalized * chartHeight
      lines.push({ y, x1: chartLeft, x2: chartRight })
    }
    lines.push({ y: chartBottom, x1: chartLeft, x2: chartRight })
    return lines
  }, [scale, chartHeight])

  const getBarHeight = (value: number) => {
    const range = scale.max - scale.min
    if (range === 0) return 0
    const normalized = (value - scale.min) / range
    return Math.max(0, normalized * chartHeight)
  }

  const createRoundedTopPath = (x: number, y: number, width: number, height: number, radius: number) => {
    const r = Math.min(radius, height / 2, width / 2)
    return `M${x},${y + height} L${x},${y + r} A${r},${r} 0 0,1 ${x + r},${y} L${x + width - r},${y} A${r},${r} 0 0,1 ${x + width},${y + r} L${x + width},${y + height} Z`
  }

  return (
    <div className="chart">
      <div id="chartContainer">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="chart__svg"
          role="img"
          aria-label="Bar chart showing dividend payments by year"
        >
          <title>{title}</title>

          {/* Y-axis labels */}
          <g className="chart__y-axis">
            {yLabels.map((label, i) => (
              <text key={i} x={yAxisLabelX} y={label.y} textAnchor="end">
                {formatNumber(label.value)}
              </text>
            ))}
          </g>

          {/* Grid lines */}
          <g className="chart__grid">
            {gridLines.map((line, i) => (
              <line key={i} x1={line.x1} y1={line.y} x2={line.x2} y2={line.y} />
            ))}
          </g>

          {/* Bars */}
          <g className="chart__bars">
            {data.map((item, index) => {
              const height = getBarHeight(item.value)
              const x = barsStartX + index * (barWidth + barGap)
              const y = chartBottom - height
              const fill = item.type === 'plan' ? colors.plan : colors.fact
              const barClass = `chart__bar chart__bar--${item.type === 'plan' ? 'plan' : 'fact'}`

              return (
                <path
                  key={index}
                  d={createRoundedTopPath(x, y, barWidth, height, barRadius)}
                  fill={fill}
                  className={barClass}
                  aria-label={`${item.label}: ${item.value}`}
                />
              )
            })}
          </g>

          {/* Value labels */}
          <g className="chart__values">
            {data.map((item, index) => {
              const height = getBarHeight(item.value)
              const x = barsStartX + index * (barWidth + barGap) + barWidth / 2
              const y = chartBottom - height - 8

              return (
                <text key={index} x={x} y={y} textAnchor="middle">
                  {formatShort(item.value)}
                </text>
              )
            })}
          </g>

          {/* X-axis labels */}
          <g className="chart__x-axis">
            {data.map((item, index) => {
              const x = barsStartX + index * (barWidth + barGap) + barWidth / 2

              return (
                <text key={index} x={x} y={xAxisLabelY} textAnchor="middle">
                  {item.label}
                </text>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}
