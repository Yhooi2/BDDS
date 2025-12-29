# BDDS Dashboard

Финансовый дашборд для отображения бюджета движения денежных средств (БДДС).

**Demo:** https://yhooi2.github.io/BDDS/

---

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Разработка](#разработка)
3. [Формат данных](#формат-данных)
4. [API Reference](#api-reference)
5. [Проверка в консоли](#проверка-в-консоли)

---

## Быстрый старт

### Использование готовой сборки

```bash
# Открыть дашборд
open dist/index.html

# Или через локальный сервер
npx serve dist
```

### Загрузка своих данных

```javascript
BDDS.Dashboard.loadData({
  funds: {
    "МойФонд": {
      type: "building",
      periods: {
        "Факт '24": {
          "Поступления по операционной деятельности": 456,
          "Выплата дохода акционерам (пайщикам)": -89
        },
        "План '25": {
          "Поступления по операционной деятельности": 500,
          "Выплата дохода акционерам (пайщикам)": -120
        }
      }
    }
  }
});
```

---

## Разработка

### Структура проекта

```
BDDS/
├── dist/                 # Готовая сборка (открывать index.html)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── react/                # Исходники (React + TypeScript)
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── services/     # Бизнес-логика
│   │   ├── utils/        # Утилиты (processRawData, formatNumber, etc.)
│   │   └── types/        # TypeScript типы
│   └── package.json
└── README.md
```

### Команды

```bash
cd react

npm install           # Установить зависимости
npm run dev           # Dev-сервер http://localhost:5173
npm run build         # Сборка в dist/
npm run test:run      # Запуск тестов
```

### Изменение адаптера данных

Адаптер `processRawData` преобразует данные бэкенда в формат дашборда.

Файл: `react/src/utils/processRawData.ts`

```typescript
export function processRawData(rawData: unknown): DashboardData {
  // Если данные уже в формате дашборда
  if (rawData && typeof rawData === 'object' && 'funds' in rawData) {
    return rawData as DashboardData
  }

  // Если бэкенд отдаёт массив - преобразовать
  if (Array.isArray(rawData)) {
    const funds: DashboardData['funds'] = {}
    // ... ваша логика преобразования
    return { funds }
  }

  return { funds: {} }
}
```

После изменений запустите `npm run build` для обновления `dist/`.

---

## Формат данных

### Структура

```javascript
{
  funds: {
    "<Название фонда>": {
      type: "<тип иконки>",
      periods: {
        "<Название периода>": {
          "<Название метрики>": <число>
        }
      }
    }
  },
  currentFund: "<Название фонда>",  // опционально
  viewMode: "details"               // опционально: "details" | "dynamics"
}
```

### Типы иконок

| Тип | Описание |
|-----|----------|
| `building` | Офисное здание (по умолчанию) |
| `warehouse` | Склад |
| `briefcase` | Портфель |

### Названия периодов

| Формат | Тип | Пример |
|--------|-----|--------|
| `Факт 'XX` | fact | `"Факт '24"` |
| `План 'XX` | plan | `"План '26"` |
| `Факт (...)\nПлан (...)` | mixed | `"Факт (I-III кв. '25)\nПлан (IV кв. '25)"` |

### Названия метрик

```javascript
// Операционная деятельность
"Движение Д/С по операционной деятельности ООО"
"Поступления по операционной деятельности"
"Расходы по основной деятельности"
"Обеспечительные платежи"

// Инвестиционная деятельность
"Движение Д/С по инвестиционной деятельности"
"Выплата дохода акционерам (пайщикам)"
"Доходы от доп.выпуска паев"
"Расходы на капитальный ремонт"

// Финансовая деятельность
"Движение Д/С по финансовой деятельности"
"Расчеты по кредитам"
"Прочие доходы и расходы по финансовой деятельности"
"Расходы на УК Парус"

// Остатки
"Остаток по кредиту на начало периода"
"Остаток по кредиту на конец периода"
"Движение за период по Д/С"
"Сформированные резервы (нарастающим итогом)"
"Накопленные резервы на ремонт, непредвиденные расходы и вакансию"
"Остаток Д/С на начало периода"
"Остаток Д/С на конец периода"
"Д/С на конец периода (с учетом резерва)"
```

---

## API Reference

Все функции доступны через глобальный объект `window.BDDS`:

```javascript
BDDS.Dashboard        // управление дашбордом
BDDS.FundsService     // работа с данными фондов
BDDS.processRawData   // адаптер сырых данных бэкенда
```

### Dashboard

#### `BDDS.Dashboard.loadData(data)`

Загружает новые данные и перерисовывает дашборд.

```javascript
BDDS.Dashboard.loadData({
  funds: {
    "Фонд1": { type: "building", periods: {...} }
  },
  currentFund: "Фонд1",  // опционально
  viewMode: "dynamics"   // опционально
});
```

#### `BDDS.Dashboard.getState()`

Возвращает текущее состояние.

```javascript
const state = BDDS.Dashboard.getState();
// { currentFund: "ДВН", viewMode: "details", periodData: [...] }
```

#### `BDDS.Dashboard.handleFundChange(fundName)`

Переключает текущий фонд.

```javascript
BDDS.Dashboard.handleFundChange("ЗОЛЯ");
```

#### `BDDS.Dashboard.handleViewModeChange(mode)`

Переключает режим отображения.

```javascript
BDDS.Dashboard.handleViewModeChange("dynamics"); // или "details"
```

### FundsService

#### `BDDS.FundsService.getFundsList()`

```javascript
BDDS.FundsService.getFundsList();
// ["ДВН", "ЗОЛЯ", "КРАС", ...]
```

#### `BDDS.FundsService.getDashboardData(fundName)`

```javascript
BDDS.FundsService.getDashboardData("ДВН");
// [
//   { id: "period-0", title: "Факт '23", type: "fact", year: 2023, metrics: {...} },
//   { id: "period-1", title: "Факт '24", type: "fact", year: 2024, metrics: {...} },
//   ...
// ]
```

### processRawData

```javascript
// Проверить преобразование данных
BDDS.processRawData({
  funds: { "Фонд": { type: "building", periods: {...} } }
});

// Преобразование массива
BDDS.processRawData([
  { name: "Фонд", type: "building", periods: {...} }
]);
```

---

## Проверка в консоли

### Базовая проверка

```javascript
// Проверить что BDDS загружен
typeof BDDS  // "object"

// Текущее состояние
BDDS.Dashboard.getState()

// Список фондов
BDDS.FundsService.getFundsList()
```

### Тестовые данные

```javascript
// Загрузить тестовые данные
BDDS.Dashboard.loadData({
  funds: {
    "Тест": {
      type: "building",
      periods: {
        "Факт '23": { "Поступления по операционной деятельности": 100 },
        "Факт '24": { "Поступления по операционной деятельности": 200 },
        "План '25": { "Поступления по операционной деятельности": 300 }
      }
    }
  },
  viewMode: "dynamics"
});

// Ожидаемый результат в режиме dynamics:
// Факт '23 | Факт '24 | Дельта
// 100      | 200      | 200 (100%)
```

### Тест с одним фактом (прочерки)

```javascript
BDDS.Dashboard.loadData({
  funds: {
    "Тест": {
      type: "building",
      periods: {
        "Факт '24": { "Поступления по операционной деятельности": 456 },
        "План '25": { "Поступления по операционной деятельности": 500 }
      }
    }
  },
  viewMode: "dynamics"
});

// Ожидаемый результат:
// Факт '24 | -   | Дельта
// 456      | -   | -
```

---

## Отладка

| Проблема | Решение |
|----------|---------|
| `BDDS is undefined` | script.js не загружен |
| Пустой дашборд | Вызовите `BDDS.Dashboard.loadData()` |
| Фонд не появляется | Проверьте структуру `funds` |
| Неверные числа | Проверьте названия метрик |

```javascript
// Диагностика
console.log("BDDS:", typeof BDDS);
console.log("State:", BDDS.Dashboard.getState());
console.log("Funds:", BDDS.FundsService.getFundsList());
```
