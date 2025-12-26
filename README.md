# BDDS Dashboard

Финансовый дашборд для отображения бюджета движения денежных средств.

**Demo:** https://yhooi2.github.io/BDDS/

## Использование generateData.js

Модуль для генерации тестовых данных дашборда.

### Быстрый старт

Откройте консоль браузера (F12) на странице дашборда и используйте:

```javascript
// Генерация данных для периодов
const periods = [
  { year: 2023, type: 'fact', label: "Факт '23" },
  { year: 2024, type: 'fact', label: "Факт '24" },
  { year: 2025, type: 'plan', label: "План '25" }
];

const data = generatePeriodData(periods, 1.0);
console.log(data);
```

### Основные функции

| Функция | Описание |
|---------|----------|
| `generatePeriodData(periods, multiplier)` | Генерирует данные для массива периодов |
| `getMetricValue(data, metricKey, index)` | Получает значение метрики по индексу периода |
| `calculateDelta(current, previous)` | Вычисляет дельту в процентах |
| `generateChartData(data, metricKey)` | Генерирует данные для графика |
| `getFundMultiplier(fundName)` | Возвращает множитель для фонда |

### Множители фондов

```javascript
FUND_MULTIPLIERS = {
  'ДВН': 1.0,
  'ЗОЛЯ': 0.8,
  'КРАС': 1.2,
  'ЛОГ': 0.9,
  'НОР': 1.1,
  'ОЗН': 0.7,
  'ТРМ': 1.3,
  'СБЛ': 0.95
}
```

### Доступные метрики (METRIC_KEYS)

**Операционная деятельность:**
- `OPERATION_MOVEMENT` — Движение Д/С по операционной деятельности
- `OPERATION_INCOME` — Поступления по операционной деятельности
- `OPERATION_EXPENSE` — Расходы по основной деятельности
- `OPERATION_DEPOSITS` — Обеспечительные платежи

**Инвестиционная деятельность:**
- `INVESTMENT_MOVEMENT` — Движение Д/С по инвестиционной деятельности
- `INVESTMENT_DIVIDENDS` — Выплата дохода акционерам
- `INVESTMENT_REPAIRS` — Расходы на капитальный ремонт

**Финансовая деятельность:**
- `FINANCE_MOVEMENT` — Движение Д/С по финансовой деятельности
- `FINANCE_CREDITS` — Расчеты по кредитам
- `FINANCE_OTHER` — Прочие доходы и расходы
- `FINANCE_PARUS` — Расходы на УК Парус

**Остатки:**
- `CREDIT_START` / `CREDIT_END` — Остаток по кредиту
- `CASH_START` / `CASH_END` — Остаток Д/С
- `CASH_WITH_RESERVE` — Д/С с учетом резерва

### Примеры использования

```javascript
// 1. Сгенерировать данные с множителем фонда КРАС
const data = generatePeriodData(DEFAULT_PERIODS, getFundMultiplier('КРАС'));

// 2. Получить значение конкретной метрики
const income = getMetricValue(data, METRIC_KEYS.OPERATION_INCOME, 0);
console.log('Поступления за 2023:', income);

// 3. Рассчитать изменение между периодами
const val2023 = getMetricValue(data, METRIC_KEYS.CASH_END, 0);
const val2024 = getMetricValue(data, METRIC_KEYS.CASH_END, 1);
const delta = calculateDelta(val2024, val2023);
console.log('Изменение:', delta + '%');

// 4. Данные для графика дивидендов
const chartData = generateChartData(data, METRIC_KEYS.INVESTMENT_DIVIDENDS);
console.table(chartData);
```

### Настройка графика

```javascript
DEFAULT_CHART_CONFIG = {
  title: 'Выплата дохода акционерам (пайщикам), тыс. ₽',
  metric: METRIC_KEYS.INVESTMENT_DIVIDENDS,
  scale: {
    min: 100,
    max: 1000,
    step: 100
  },
  customValues: [390, 670, 860, 980],
  colors: {
    fact: '#9DBCE0',
    plan: '#D9D9D9'
  }
}
```

## Структура проекта

```
BDDS/
├── index.html      # Главная страница
├── styles.css      # Стили
├── script.js       # Основной скрипт дашборда
└── generateData.js # Модуль генерации данных
```
