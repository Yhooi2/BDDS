import type { DashboardData, Fund } from '../types'

type FundType = Fund['type']

interface RawFundItem {
  name?: string
  fund_name?: string
  fund?: string
  category?: string
  type?: string
  periods?: Record<string, Record<string, number | null>>
  data?: Record<string, Record<string, number | null>>
}

/**
 * Адаптер для преобразования сырых данных бэкенда в формат дашборда.
 * Вызывается автоматически в Dashboard.loadData()
 *
 * @param rawData - Сырые данные от бэкенда
 * @returns Данные в формате DashboardData
 */
export function processRawData(rawData: unknown): DashboardData {
  // Если данные уже в формате дашборда — возвращаем как есть
  if (rawData && typeof rawData === 'object' && 'funds' in rawData) {
    return rawData as DashboardData
  }

  // Если бэкенд отдаёт массив объектов
  if (Array.isArray(rawData)) {
    const funds: DashboardData['funds'] = {}

    rawData.forEach((item: RawFundItem) => {
      const fundName = item.name || item.fund_name || item.fund || 'Unknown'

      let type: FundType = 'building'
      if (item.category === 'warehouse' || item.type === 'warehouse') {
        type = 'warehouse'
      } else if (item.category === 'briefcase' || item.type === 'briefcase') {
        type = 'briefcase'
      }

      const periods: Record<string, Record<string, number | null>> = {}
      const periodsData = item.periods || item.data || {}
      Object.keys(periodsData).forEach((periodKey) => {
        periods[periodKey] = periodsData[periodKey]
      })

      funds[fundName] = { type, periods }
    })

    return { funds }
  }

  // Если формат не распознан — возвращаем пустой объект
  console.warn('processRawData: неизвестный формат данных', rawData)
  return { funds: {} }
}
