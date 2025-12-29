# BDDS Dashboard

Финансовый дашборд для отображения бюджета движения денежных средств (БДДС).

**Demo:** https://yhooi2.github.io/BDDS/

---

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Формат данных](#формат-данных)
3. [API Reference](#api-reference)
4. [Архитектура](#архитектура)
5. [Проверка в консоли](#проверка-в-консоли)
6. [Примеры использования](#примеры-использования)

---

## Быстрый старт

### Запуск

```bash
# Вариант 1: просто открыть файл
open index.html

# Вариант 2: через локальный сервер
npx serve .
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
        }
      }
    }
  }
});
```

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
BDDS.FundSelector     // селектор фондов
BDDS.ViewToggle       // переключатель режимов
BDDS.processRawData   // адаптер сырых данных бэкенда
BDDS.formatNumber     // форматирование чисел
BDDS.calculateDelta   // расчёт дельты
BDDS.parsePeriodInfo  // парсинг периодов
BDDS.METRIC_KEYS      // константы метрик
```

---

### Dashboard

Главный компонент управления дашбордом.

#### `BDDS.Dashboard.loadData(data)`

Загружает новые данные и перерисовывает дашборд.

```javascript
// Параметр: data - объект с полем funds
BDDS.Dashboard.loadData({
  funds: {
    "Фонд1": { type: "building", periods: {...} }
  },
  currentFund: "Фонд1"  // опционально
});

// Что происходит внутри:
// 1. FundsService.init(data) - инициализация сервиса
// 2. Проверка currentFund (если нет - берётся первый фонд)
// 3. generateData() - генерация periodData
// 4. Переинициализация FundSelector
// 5. render() - перерисовка UI
```

#### `BDDS.Dashboard.getState()`

Возвращает текущее состояние дашборда.

```javascript
const state = BDDS.Dashboard.getState();
// {
//   currentFund: "ДВН",
//   viewMode: "details",
//   periodData: [...],
//   chartConfig: {...}
// }
```

#### `BDDS.Dashboard.updateData(options)`

Обновляет конфигурацию без полной перезагрузки.

```javascript
// Сменить фонд
BDDS.Dashboard.updateData({ currentFund: "ЗОЛЯ" });

// Обновить конфиг графика
BDDS.Dashboard.updateData({
  chartConfig: { customValues: [400, 700, 900, 1000] }
});
```

#### `BDDS.Dashboard.handleFundChange(fundName)`

Переключает текущий фонд.

```javascript
BDDS.Dashboard.handleFundChange("ЗОЛЯ");
// Перегенерирует данные и перерисует UI
```

#### `BDDS.Dashboard.handleViewModeChange(mode)`

Переключает режим отображения.

```javascript
BDDS.Dashboard.handleViewModeChange("dynamics"); // или "details"
```

---

### FundsService

Централизованный сервис для работы с данными фондов.

#### `BDDS.FundsService.init(rawData)`

Инициализирует сервис с данными.

```javascript
BDDS.FundsService.init({
  funds: { "Фонд": { type: "building", periods: {...} } }
});
// Возвращает: FundsService (для цепочки)

// Вызывается автоматически в Dashboard.loadData()
```

#### `BDDS.FundsService.getFundsList()`

Список всех фондов.

```javascript
BDDS.FundsService.getFundsList();
// ["ДВН", "ЗОЛЯ", "КРАС", "ЛОГ", "НОР", "ОЗН", "СБЛ", "ТРМ"]
```

#### `BDDS.FundsService.getDefaultFund()`

Фонд по умолчанию.

```javascript
BDDS.FundsService.getDefaultFund();
// "ДВН" (или currentFund из данных, или первый в списке)
```

#### `BDDS.FundsService.getFundType(fundName)`

Тип иконки фонда.

```javascript
BDDS.FundsService.getFundType("ДВН");      // "building"
BDDS.FundsService.getFundType("ЗОЛЯ");     // "warehouse"
BDDS.FundsService.getFundType("Неизвестный"); // "building" (по умолчанию)
```

#### `BDDS.FundsService.getIcon(fundName)`

SVG-иконка фонда.

```javascript
BDDS.FundsService.getIcon("ДВН");
// '<svg viewBox="0 0 22 22">...</svg>'
```

#### `BDDS.FundsService.getGroups()`

Фонды сгруппированные по типам.

```javascript
BDDS.FundsService.getGroups();
// [
//   { icon: "warehouse", funds: ["ЗОЛЯ", "КРАС", "ЛОГ"] },
//   { icon: "building", funds: ["ДВН"] },
//   { icon: "briefcase", funds: ["ТРМ"] }
// ]
```

#### `BDDS.FundsService.getPeriods(fundName)`

Все периоды фонда с метриками.

```javascript
BDDS.FundsService.getPeriods("ДВН");
// {
//   "Факт '23": { "Движение Д/С...": 567, ... },
//   "Факт '24": { ... },
//   "План '26": { ... }
// }
```

#### `BDDS.FundsService.getPeriodsList(fundName)`

Список названий периодов.

```javascript
BDDS.FundsService.getPeriodsList("ДВН");
// ["Факт '23", "Факт '24", "План '26"]
```

#### `BDDS.FundsService.getAllFundsWithPeriods()`

Все фонды со списками периодов.

```javascript
BDDS.FundsService.getAllFundsWithPeriods();
// {
//   "ДВН": ["Факт '23", "Факт '24", "План '26"],
//   "ЗОЛЯ": ["Факт '23", "План '26"]
// }
```

#### `BDDS.FundsService.getDashboardData(fundName)`

Данные для рендеринга дашборда.

```javascript
BDDS.FundsService.getDashboardData("ДВН");
// [
//   { id: "period-0", title: "Факт '23", type: "fact", year: 2023, metrics: {...} },
//   { id: "period-1", title: "Факт '24", type: "fact", year: 2024, metrics: {...} },
//   { id: "period-2", title: "План '26", type: "plan", year: 2026, metrics: {...} }
// ]
// Отсортировано по году!
```

---

### processRawData

Функция-адаптер для преобразования сырых данных бэкенда в формат дашборда.

#### `BDDS.processRawData(rawData)`

Преобразует данные из формата бэкенда в формат дашборда.

```javascript
// Вызывается автоматически в Dashboard.init() и Dashboard.loadData()
// Можно вызвать вручную:
const dashboardData = BDDS.processRawData(myBackendData);
```

**Как использовать:**

1. Откройте `script.js` и найдите функцию `processRawData`
2. Замените логику внутри под формат вашего бэкенда
3. Функция должна вернуть объект:

```javascript
{
  funds: {
    "НазваниеФонда": {
      type: "building" | "warehouse" | "briefcase",
      periods: {
        "Факт '24": {
          "Название метрики": числовое_значение
        }
      }
    }
  },
  currentFund: "НазваниеФонда",  // опционально
  viewMode: "details"            // опционально
}
```

**Пример адаптера:**

```javascript
function processRawData(rawData) {
  // Если бэкенд отдаёт массив:
  // [{ fund: "ДВН", year: 2024, income: 100 }, ...]

  if (Array.isArray(rawData)) {
    var funds = {};
    rawData.forEach(function(item) {
      if (!funds[item.fund]) {
        funds[item.fund] = { type: "building", periods: {} };
      }
      var periodName = "Факт '" + String(item.year).slice(-2);
      funds[item.fund].periods[periodName] = {
        "Поступления по операционной деятельности": item.income
      };
    });
    return { funds: funds };
  }

  return rawData; // если уже в нужном формате
}
```

---

### Утилиты

#### `BDDS.formatNumber(value)`

Форматирует число с разделителями.

```javascript
BDDS.formatNumber(4567);       // "4 567"
BDDS.formatNumber(-890);       // "-890"
BDDS.formatNumber(null);       // "-"
BDDS.formatNumber(0);          // "0"
```

#### `BDDS.calculateDelta(current, previous)`

Вычисляет процент изменения.

```javascript
BDDS.calculateDelta(110, 100);  // 10 (рост 10%)
BDDS.calculateDelta(50, 100);   // -50 (падение 50%)
BDDS.calculateDelta(100, 0);    // 100
BDDS.calculateDelta(null, 100); // null
```

#### `BDDS.parsePeriodInfo(periodString)`

Парсит название периода.

```javascript
BDDS.parsePeriodInfo("Факт '24");
// { type: "fact", year: 2024 }

BDDS.parsePeriodInfo("План '26");
// { type: "plan", year: 2026 }

BDDS.parsePeriodInfo("Факт (I-III кв. '25)\nПлан (IV кв. '25)");
// { type: "mixed", year: 2025 }
```

#### `BDDS.METRIC_KEYS`

Константы названий метрик.

```javascript
BDDS.METRIC_KEYS.OPERATION_MOVEMENT  // "Движение Д/С по операционной деятельности ООО"
BDDS.METRIC_KEYS.INVESTMENT_DIVIDENDS // "Выплата дохода акционерам (пайщикам)"
BDDS.METRIC_KEYS.CASH_END            // "Остаток Д/С на конец периода"
// ... и другие
```

---

## Архитектура

### Структура проекта

```
BDDS/
├── index.html    # HTML разметка
├── styles.css    # Стили (включая print)
├── script.js     # Вся логика + дефолтные данные (DEFAULT_DATA)
└── README.md     # Документация
```

### Поток данных

```
window.DATA || DEFAULT_DATA
       ↓
processRawData(rawData)     ← адаптер для данных бэкенда
       ↓
FundsService.init(data)
       ↓
   ┌───┴───┐
   ↓       ↓
getFundsList()   getDashboardData(fund)
getGroups()            ↓
   ↓            parsePeriodInfo()
   ↓                   ↓
FundSelector      periodData[]
                       ↓
                Dashboard.render()
```

### Жизненный цикл

```javascript
// 1. Загрузка страницы
DOMContentLoaded
  → Dashboard.init()
    → rawData = window.DATA || DEFAULT_DATA
    → config = processRawData(rawData)  // ← адаптер
    → FundsService.init(config)
    → currentFund = FundsService.getDefaultFund()
    → generateData()
    → initComponents() (FundSelector, ViewToggle)
    → render()

// 2. Смена фонда (клик в dropdown)
FundSelector.onClick(fund)
  → Dashboard.handleFundChange(fund)
    → currentFund = fund
    → generateData()
    → render()

// 3. Загрузка новых данных (API)
fetch('/api/data').then(rawData => BDDS.Dashboard.loadData(rawData))
  → data = processRawData(rawData)  // ← адаптер
  → FundsService.init(data)
  → проверка currentFund
  → generateData()
  → переинициализация компонентов
  → render()
```

---

## Проверка в консоли

### Базовая проверка

```javascript
// 1. Проверить что BDDS загружен
typeof BDDS  // "object"

// 2. Проверить текущее состояние
BDDS.Dashboard.getState()

// 3. Проверить список фондов
BDDS.FundsService.getFundsList()

// 4. Проверить данные текущего фонда
BDDS.Dashboard.state.periodData
```

### Проверка загрузки данных

```javascript
// Загрузить тестовые данные
BDDS.Dashboard.loadData({
  funds: {
    "Тест1": {
      type: "building",
      periods: {
        "Факт '24": { "Поступления по операционной деятельности": 5678 }
      }
    }
  }
});

// Проверить результат:
BDDS.FundsService.getFundsList()     // ["Тест1"]
BDDS.Dashboard.state.currentFund     // "Тест1"
BDDS.Dashboard.state.periodData[0]   // { metrics: {...} }

// Визуально: в таблице должно появиться "5 678"
```

### Проверка переключения фондов

```javascript
// Загрузить несколько фондов
BDDS.Dashboard.loadData({
  funds: {
    "Фонд1": { type: "building", periods: { "Факт '24": { "Поступления по операционной деятельности": 45 } } },
    "Фонд2": { type: "warehouse", periods: { "Факт '24": { "Поступления по операционной деятельности": -789 } } }
  }
});

// Переключить
BDDS.Dashboard.handleFundChange("Фонд2");
BDDS.Dashboard.state.currentFund  // "Фонд2"

// Визуально: в таблице должно быть "-789"
```

### Проверка форматирования

```javascript
BDDS.formatNumber(5)           // "5"
BDDS.formatNumber(67)          // "67"
BDDS.formatNumber(890)         // "890"
BDDS.formatNumber(1234)        // "1 234"
BDDS.formatNumber(-78)         // "-78"
BDDS.formatNumber(-4567)       // "-4 567"
BDDS.calculateDelta(150, 100)  // 50
BDDS.parsePeriodInfo("Факт '25") // {type: "fact", year: 2025}
```

---

## Примеры использования

### 1. Загрузка с сервера

```javascript
async function loadDashboardData() {
  const response = await fetch('/api/budget-data');
  const data = await response.json();
  BDDS.Dashboard.loadData(data);
}

loadDashboardData();
```

### 2. Полный пример данных

```javascript
const data = {
  currentFund: "ДВН",
  viewMode: "details",
  funds: {
    "ДВН": {
      type: "building",
      periods: {
        "Факт '23": {
          "Движение Д/С по операционной деятельности ООО": 5,
          "Поступления по операционной деятельности": 67,
          "Расходы по основной деятельности": -23,
          "Обеспечительные платежи": -456,
          "Движение Д/С по инвестиционной деятельности": 89,
          "Выплата дохода акционерам (пайщикам)": -34,
          "Расходы на капитальный ремонт": 567,
          "Движение Д/С по финансовой деятельности": -78,
          "Расчеты по кредитам": 1234,
          "Прочие доходы и расходы по финансовой деятельности": -45,
          "Расходы на УК Парус": 234,
          "Остаток по кредиту на начало периода": -89,
          "Остаток по кредиту на конец периода": 345,
          "Движение за период по Д/С": -12,
          "Сформированные резервы (нарастающим итогом)": 56,
          "Накопленные резервы на ремонт, непредвиденные расходы и вакансию": -678,
          "Остаток Д/С на начало периода": 123,
          "Остаток Д/С на конец периода": -34,
          "Д/С на конец периода (с учетом резерва)": 789
        },
        "Факт '24": { /* ... */ },
        "План '26": { /* ... */ }
      }
    },
    "ЗОЛЯ": {
      type: "warehouse",
      periods: { /* ... */ }
    },
    "ТРМ": {
      type: "briefcase",
      periods: { /* ... */ }
    }
  }
};

BDDS.Dashboard.loadData(data);
```

### 3. Добавление нового фонда

```javascript
// Получить текущие данные
const currentData = { funds: { ...window.DATA.funds } };

// Добавить новый фонд
currentData.funds["НовыйФонд"] = {
  type: "briefcase",
  periods: {
    "Факт '24": {
      "Поступления по операционной деятельности": 567,
      "Выплата дохода акционерам (пайщикам)": -234
    }
  }
};

// Загрузить обновлённые данные
BDDS.Dashboard.loadData(currentData);

// Фонд появится в выпадающем меню автоматически
```

### 4. Программное переключение

```javascript
// Сменить фонд
BDDS.Dashboard.handleFundChange("ЗОЛЯ");

// Сменить режим отображения
BDDS.Dashboard.handleViewModeChange("dynamics");

// Обновить конфиг графика
BDDS.Dashboard.updateData({
  chartConfig: {
    customValues: [7, 89, 456, 2345],
    scale: { min: 0, max: 3000, step: 500 }
  }
});
```

### 5. Получение данных для экспорта

```javascript
// Все фонды с периодами
const allData = BDDS.FundsService.getAllFundsWithPeriods();
console.log(JSON.stringify(allData, null, 2));

// Данные конкретного фонда
const dvnData = BDDS.FundsService.getPeriods("ДВН");

// Форматированные данные для UI
const periodData = BDDS.FundsService.getDashboardData("ДВН");
```

---

## Отладка

### Частые проблемы

| Проблема | Решение |
|----------|---------|
| `BDDS is undefined` | script.js не загружен или ошибка в нём |
| Пустой дашборд | Проверьте `window.DATA` или вызовите `loadData()` |
| Фонд не появляется | Проверьте структуру `funds` в данных |
| Неверные числа | Проверьте названия метрик (должны совпадать точно) |

### Диагностика

```javascript
// Проверить загрузку
console.log("BDDS:", typeof BDDS);
console.log("DATA:", typeof window.DATA);

// Проверить состояние
console.log("State:", BDDS.Dashboard.state);
console.log("Funds:", BDDS.FundsService.getFundsList());

// Проверить данные
console.log("periodData:", BDDS.Dashboard.state.periodData);
```
