export interface Metrics {
  [key: string]: number | null
}

export interface Period {
  id: string
  title: string
  type: 'fact' | 'plan' | 'mixed'
  year: number
  metrics: Metrics
}

export interface Fund {
  type: 'building' | 'warehouse' | 'briefcase'
  periods: Record<string, Metrics>
}

export interface DashboardData {
  funds: Record<string, Fund>
  currentFund?: string
  viewMode?: ViewMode
}

export type ViewMode = 'details' | 'dynamics'

export interface DashboardState {
  currentFund: string
  viewMode: ViewMode
  periodData: Period[]
}

export interface RowConfig {
  id: string
  key: string
  label: string
  isHeader?: boolean
  multiline?: boolean
}

export interface SectionConfig {
  id: string
  title: string
  cssClass: string
  rows: RowConfig[]
}

export interface ChartConfig {
  title: string
  metric: string
  unit: string
  scale: {
    min: number
    max: number
    step: number
  }
  colors: {
    fact: string
    plan: string
  }
}

export interface FundGroup {
  icon: 'building' | 'warehouse' | 'briefcase'
  funds: string[]
}
