# BDDS Dashboard - Project Documentation

## Overview

Financial dashboard for BDDS (БДДС - Бюджет Движения Денежных Средств) displaying fund metrics, cash flow, and financial data across multiple periods.

## Project Structure

```
BDDS/
├── react/                    # React + TypeScript version (main)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── constants/        # Configuration constants
│   │   ├── data/             # Default/mock data
│   │   ├── services/         # Business logic services
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── test/             # Test setup
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Styles (Tailwind + custom)
│   ├── dist/                 # Production build output
│   └── package.json
├── script.js                 # Original vanilla JS (legacy)
├── styles.css                # Original CSS (legacy)
└── index.html                # Original HTML (legacy)
```

## React Project (`react/`)

### Tech Stack
- **Build**: Vite 7.x
- **Framework**: React 19
- **Language**: TypeScript (strict mode)
- **Styles**: Tailwind CSS v4 + custom CSS
- **Tests**: Vitest + React Testing Library

### Key Commands
```bash
cd react
npm run dev       # Dev server at http://localhost:5173
npm run build     # Build to dist/
npm run test      # Run tests (watch mode)
npm run test:run  # Run tests once
```

---

## Components

### `App.tsx`
Main dashboard component. Manages state for:
- `currentFund` - selected fund name (string)
- `viewMode` - 'details' | 'dynamics'
- `periods` - array of Period data

### `FundSelector.tsx`
Dropdown for selecting fund. Groups funds by type (building/warehouse/briefcase).

### `ViewToggle.tsx`
Toggle button between "Детали за текущий год" and "Динамика по годам".

### `BarChart.tsx`
SVG bar chart displaying dividend payments across periods.
- Uses `calculateChartScale()` for axis scaling
- Colors: fact (#9DBCE0 blue) / plan (#D9D9D9 gray)

### `TableSection.tsx`
Table section with colored header. Uses:
- `TableHeaders.tsx` - column headers
- `TableRow.tsx` - data rows with values

### `HighlightBlock.tsx`
Highlighted block for balance rows (credit/cash balances).

### `FinanceSection.tsx`
Finance section combining TableSection + HighlightBlock for credit balances.

---

## Types (`types/index.ts`)

```typescript
interface Metrics {
  [key: string]: number | null
}

interface Period {
  id: string
  title: string           // "Факт '23", "План '26"
  type: 'fact' | 'plan' | 'mixed'
  year: number
  metrics: Metrics
}

interface Fund {
  type: 'building' | 'warehouse' | 'briefcase'
  periods: Record<string, Metrics>
}

interface DashboardData {
  funds: Record<string, Fund>
  currentFund?: string
  viewMode?: ViewMode
}

type ViewMode = 'details' | 'dynamics'

interface RowConfig {
  id: string
  key: string            // METRIC_KEYS value
  label: string
  isHeader?: boolean
  multiline?: boolean
}

interface SectionConfig {
  id: string
  title: string
  cssClass: string
  rows: RowConfig[]
}
```

---

## Services

### `FundsService.ts`
Singleton service for fund data management.

```typescript
FundsService.init(data)              // Initialize with DashboardData
FundsService.getFundsList()          // string[] of fund names
FundsService.getDefaultFund()        // First fund or currentFund
FundsService.getFundType(name)       // 'building' | 'warehouse' | 'briefcase'
FundsService.getIcon(name)           // SVG string for fund type
FundsService.getColors(name)         // { primary, sectionHeader, chartFact }
FundsService.getGroups()             // FundGroup[] for dropdown
FundsService.getDashboardData(name)  // Period[] for rendering
```

---

## Utils

### `formatNumber.ts`
```typescript
formatNumber(1234567)      // "1 234 567"
formatNumber(-1000)        // "-1 000"
formatNumber(null)         // "-"
formatWithDelta(100, 25)   // { value: "100", delta: "   25%" }
formatShort(1234.5)        // "1235"
```

### `calculateDelta.ts`
```typescript
calculateDelta(120, 100)   // 20 (percent change)
calculateDelta(-50, -100)  // 50 (going from -100 to -50 is +50%)
calculateDelta(100, null)  // null
```

### `parsePeriodInfo.ts`
```typescript
parsePeriodInfo("Факт '23")  // { type: 'fact', year: 2023 }
parsePeriodInfo("План '26")  // { type: 'plan', year: 2026 }
parsePeriodInfo("Факт...План") // { type: 'mixed', year: ... }
```

### `calculateChartScale.ts`
Calculates nice axis scale for bar charts (min, max, step, ticks).

---

## Constants

### `metricKeys.ts`
All metric key constants:
```typescript
METRIC_KEYS.OPERATION_MOVEMENT    // 'operationMovement'
METRIC_KEYS.OPERATION_INCOME      // 'operationIncome'
METRIC_KEYS.INVESTMENT_DIVIDENDS  // 'investmentDividends'
METRIC_KEYS.CASH_START            // 'cashStart'
// ... etc
```

### `sections.ts`
Section configurations for tables:
- `SECTIONS.operation` - Операционная часть
- `SECTIONS.investment` - Инвестиционная часть
- `SECTIONS.finance` - Финансовая часть
- `CREDIT_BALANCE_ROWS` - Остатки по кредиту
- `CASH_MOVEMENT_ROWS` - Движение Д/С
- `CASH_BALANCE_ROWS` - Остатки Д/С

---

## Styling

### CSS Classes (index.css)
- `.dashboard` - main container
- `.dashboard-header` - header with selector and toggle
- `.table-section` - section wrapper
- `.table-section--operation` - blue header
- `.table-section--investment` - green header
- `.table-section--finance` - pink header
- `.highlight-block` - highlighted balance block
- `.fund-selector` - dropdown component
- `.view-toggle` - toggle button
- `.bar-chart` - SVG chart container

### CSS Variables
```css
--color-primary-blue: #9dbce0
--color-primary-green: #a9db21
--color-primary-pink: #c7a4c0
--color-section-header-blue: rgba(157, 188, 224, 0.41)
--color-chart-plan: #d9d9d9
```

---

## Data Flow

```
DashboardData (JSON)
    ↓
FundsService.init()
    ↓
App.tsx (state: currentFund, viewMode)
    ↓
FundsService.getDashboardData(currentFund)
    ↓
periods: Period[]
    ↓
Components render with periods + viewMode
```

---

## View Modes

### Details Mode (`viewMode === 'details'`)
Shows all periods as columns (Факт '23, Факт '24, Факт+План '25, План '26).

### Dynamics Mode (`viewMode === 'dynamics'`)
Shows first period, last period, and delta (percent change).

---

## Testing

Tests located alongside components:
- `src/utils/*.test.ts` - utility tests
- `src/components/*.test.tsx` - component tests

Run: `npm run test:run`

---

## Build Output

```
dist/
├── index.html          # Entry HTML
├── assets/
│   ├── index-*.css     # Bundled CSS (~13KB)
│   └── index-*.js      # Bundled JS + React (~219KB)
└── vite.svg            # Favicon
```

Build is self-contained and works from `file://` protocol.
