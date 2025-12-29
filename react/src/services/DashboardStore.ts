import type { DashboardData, ViewMode, Period } from '../types'
import { FundsService } from './FundsService'
import { processRawData } from '../utils/processRawData'

type Listener = () => void

interface DashboardState {
  currentFund: string
  viewMode: ViewMode
  periodData: Period[]
}

/**
 * Глобальное хранилище для управления данными дашборда.
 * Позволяет загружать данные извне React и уведомлять компоненты об изменениях.
 */
class DashboardStoreClass {
  private listeners: Set<Listener> = new Set()
  private state: DashboardState = {
    currentFund: '',
    viewMode: 'dynamics',
    periodData: [],
  }

  /**
   * Подписаться на изменения данных
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Уведомить всех подписчиков об изменении
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * Загрузить новые данные и обновить дашборд
   */
  loadData(rawData: unknown): void {
    const data = processRawData(rawData)
    FundsService.init(data)

    const currentFund = data.currentFund || FundsService.getDefaultFund() || ''
    const viewMode = data.viewMode || 'dynamics'
    const periodData = FundsService.getDashboardData(currentFund)

    this.state = { currentFund, viewMode, periodData }
    this.notify()
  }

  /**
   * Обновить текущий фонд
   */
  setCurrentFund(fund: string): void {
    this.state = {
      ...this.state,
      currentFund: fund,
      periodData: FundsService.getDashboardData(fund),
    }
    this.notify()
  }

  /**
   * Обновить режим просмотра
   */
  setViewMode(mode: ViewMode): void {
    this.state = { ...this.state, viewMode: mode }
    this.notify()
  }

  /**
   * Получить текущее состояние
   */
  getState(): DashboardState {
    return { ...this.state }
  }

  /**
   * Инициализировать хранилище с начальными данными
   */
  init(data: DashboardData): void {
    const currentFund = data.currentFund || FundsService.getDefaultFund() || ''
    const viewMode = data.viewMode || 'dynamics'
    const periodData = FundsService.getDashboardData(currentFund)
    this.state = { currentFund, viewMode, periodData }
  }
}

export const DashboardStore = new DashboardStoreClass()
