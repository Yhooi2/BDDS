import { METRIC_KEYS } from './metricKeys'
import type { RowConfig, SectionConfig } from '../types'

export const SECTIONS: Record<string, SectionConfig> = {
  operation: {
    id: 'operation',
    title: 'Операционная часть',
    cssClass: 'table-section--operation',
    rows: [
      { id: 'op-movement', key: METRIC_KEYS.OPERATION_MOVEMENT, label: 'Движение Д/С по операционной деятельности ООО', isHeader: true },
      { id: 'op-income', key: METRIC_KEYS.OPERATION_INCOME, label: 'Поступления по операционной деятельности' },
      { id: 'op-expense', key: METRIC_KEYS.OPERATION_EXPENSE, label: 'Расходы по основной деятельности' },
      { id: 'op-deposits', key: METRIC_KEYS.OPERATION_DEPOSITS, label: 'Обеспечительные платежи' },
    ],
  },
  investment: {
    id: 'investment',
    title: 'Инвестиционная часть',
    cssClass: 'table-section--investment',
    rows: [
      { id: 'inv-movement', key: METRIC_KEYS.INVESTMENT_MOVEMENT, label: 'Движение Д/С по инвестиционной деятельности', isHeader: true },
      { id: 'inv-dividends', key: METRIC_KEYS.INVESTMENT_DIVIDENDS, label: 'Выплата дохода акционерам (пайщикам)' },
      { id: 'inv-repairs', key: METRIC_KEYS.INVESTMENT_REPAIRS, label: 'Расходы на капитальный ремонт' },
    ],
  },
  finance: {
    id: 'finance',
    title: 'Финансовая часть',
    cssClass: 'table-section--finance',
    rows: [
      { id: 'fin-movement', key: METRIC_KEYS.FINANCE_MOVEMENT, label: 'Движение Д/С по финансовой деятельности', isHeader: true },
      { id: 'fin-credits', key: METRIC_KEYS.FINANCE_CREDITS, label: 'Расчеты по кредитам' },
      { id: 'fin-other', key: METRIC_KEYS.FINANCE_OTHER, label: 'Прочие доходы и расходы\nпо финансовой деятельности', multiline: true },
      { id: 'fin-parus', key: METRIC_KEYS.FINANCE_PARUS, label: 'Расходы на УК Парус' },
    ],
  },
}

export const CREDIT_BALANCE_ROWS: RowConfig[] = [
  { id: 'credit-start', key: METRIC_KEYS.CREDIT_START, label: 'Остаток по кредиту на начало периода', isHeader: true },
  { id: 'credit-end', key: METRIC_KEYS.CREDIT_END, label: 'Остаток по кредиту на конец периода', isHeader: true },
]

export const CASH_MOVEMENT_ROWS: RowConfig[] = [
  { id: 'cash-movement', key: METRIC_KEYS.CASH_MOVEMENT, label: 'Движение за период по Д/С', isHeader: true },
  { id: 'reserves-formed', key: METRIC_KEYS.RESERVES_FORMED, label: 'Сформированные резервы (нарастающим итогом)' },
  { id: 'reserves-accumulated', key: METRIC_KEYS.RESERVES_ACCUMULATED, label: 'Накопленные резервы на ремонт,\nнепредвиденные расходы и вакансию', multiline: true },
]

export const CASH_BALANCE_ROWS: RowConfig[] = [
  { id: 'cash-start', key: METRIC_KEYS.CASH_START, label: 'Остаток Д/С на начало периода', isHeader: true },
  { id: 'cash-end', key: METRIC_KEYS.CASH_END, label: 'Остаток Д/С на конец периода', isHeader: true },
  { id: 'cash-reserve', key: METRIC_KEYS.CASH_WITH_RESERVE, label: 'Д/С на конец периода (с учетом резерва)', isHeader: true },
]

export const DEFAULT_CHART_CONFIG = {
  title: 'Выплата дохода акционерам (пайщикам), млн ₽',
  metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
  unit: 'млн ₽',
  colors: {
    fact: '#9DBCE0',
    plan: '#D9D9D9',
  },
}
