export const METRIC_KEYS = {
  // Operational Activity Section
  OPERATION_MOVEMENT: 'Движение Д/С по операционной деятельности ООО',
  OPERATION_INCOME: 'Поступления по операционной деятельности',
  OPERATION_EXPENSE: 'Расходы по основной деятельности',
  OPERATION_DEPOSITS: 'Обеспечительные платежи',

  // Investment Activity Section
  INVESTMENT_MOVEMENT: 'Движение Д/С по инвестиционной деятельности',
  INVESTMENT_DIVIDENDS: 'Выплата дохода акционерам (пайщикам)',
  INVESTMENT_ADDITIONAL_SHARES: 'Доходы от доп.выпуска паев',
  INVESTMENT_REPAIRS: 'Расходы на капитальный ремонт',

  // Financial Activity Section
  FINANCE_MOVEMENT: 'Движение Д/С по финансовой деятельности',
  FINANCE_CREDITS: 'Расчеты по кредитам',
  FINANCE_OTHER: 'Прочие доходы и расходы по финансовой деятельности',
  FINANCE_PARUS: 'Расходы на УК Парус',

  // Credit Balance Block
  CREDIT_START: 'Остаток по кредиту на начало периода',
  CREDIT_END: 'Остаток по кредиту на конец периода',

  // Cash Movement Section
  CASH_MOVEMENT: 'Движение за период по Д/С',
  RESERVES_FORMED: 'Сформированные резервы (нарастающим итогом)',
  RESERVES_ACCUMULATED: 'Накопленные резервы на ремонт, непредвиденные расходы и вакансию',

  // Cash Balance Block
  CASH_START: 'Остаток Д/С на начало периода',
  CASH_END: 'Остаток Д/С на конец периода',
  CASH_WITH_RESERVE: 'Д/С на конец периода (с учетом резерва)',
} as const

export type MetricKey = typeof METRIC_KEYS[keyof typeof METRIC_KEYS]
