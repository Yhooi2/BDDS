# BDDS Dashboard

Финансовый дашборд для отображения бюджета движения денежных средств.

**Demo:** https://yhooi2.github.io/BDDS/

## Быстрый старт

### 1. Локальный запуск
```bash
# Откройте index.html в браузере
open index.html

# Или через локальный сервер
npx serve .
```

### 2. Загрузка данных

```javascript
// Новый формат данных
const data = {
  funds: {
    "ДВН": {
      type: "building",  // тип иконки: building | warehouse | briefcase
      periods: {
        "Факт '24": {
          "Поступления по операционной деятельности": 2200000,
          "Выплата дохода акционерам (пайщикам)": -920000,
          // ... остальные метрики
        },
        "План '26": { ... }
      }
    },
    "ЗОЛЯ": {
      type: "warehouse",
      periods: { ... }
    }
  },
  currentFund: "ДВН",  // опционально
  viewMode: "details" // опционально
};

// Загрузка в дашборд
window.BDDS.Dashboard.loadData(data);
```

### 3. Загрузка с сервера

```javascript
fetch('/api/budget-data')
  .then(res => res.json())
  .then(data => window.BDDS.Dashboard.loadData(data));
```

## Формат данных

```javascript
{
  "funds": {
    "<Название фонда>": {
      "type": "<building|warehouse|briefcase>",
      "periods": {
        "<Название периода>": {
          "<Название метрики>": <число или null>
        }
      }
    }
  },
  "currentFund": "<Название фонда>",  // опционально
  "viewMode": "<details|dynamics>"     // опционально
}
```

### Типы иконок фондов
- `building` - офисное здание (синяя иконка)
- `warehouse` - склад (зелёная иконка)
- `briefcase` - портфель (розовая иконка)

### Названия периодов
- `"Факт '23"` - факт за 2023 год
- `"Факт '24"` - факт за 2024 год
- `"План '26"` - план на 2026 год
- `"Факт (I-III кв. '25)\nПлан (IV кв. '25)"` - смешанный период

### Названия метрик

**Операционная деятельность:**
- Движение Д/С по операционной деятельности ООО
- Поступления по операционной деятельности
- Расходы по основной деятельности
- Обеспечительные платежи

**Инвестиционная деятельность:**
- Движение Д/С по инвестиционной деятельности
- Выплата дохода акционерам (пайщикам)
- Расходы на капитальный ремонт

**Финансовая деятельность:**
- Движение Д/С по финансовой деятельности
- Расчеты по кредитам
- Прочие доходы и расходы по финансовой деятельности
- Расходы на УК Парус

**Остатки и резервы:**
- Остаток по кредиту на начало периода
- Остаток по кредиту на конец периода
- Движение за период по Д/С
- Сформированные резервы (нарастающим итогом)
- Накопленные резервы на ремонт, непредвиденные расходы и вакансию
- Остаток Д/С на начало периода
- Остаток Д/С на конец периода
- Д/С на конец периода (с учетом резерва)

## API Reference

> **Доступ из консоли браузера:** все API доступны через `window.BDDS`:
> - `BDDS.Dashboard` — управление дашбордом
> - `BDDS.FundsService` — работа с фондами
> - `BDDS.getFundsData(data)` — утилита для преобразования данных

### FundsService

Централизованный сервис для работы с данными фондов. Все данные берутся из `window.DATA.funds`.

---

#### `FundsService.init(rawData)`

Инициализация сервиса с данными.

| Параметр | Тип | Описание |
|----------|-----|----------|
| `rawData` | `Object` | Объект с полем `funds` (см. формат данных) |

**Возвращает:** `FundsService` (для цепочки вызовов)

**Где вызывается:**
- `Dashboard.init()` — при загрузке страницы
- `Dashboard.loadData()` — при загрузке новых данных

```javascript
// Ручной вызов
FundsService.init(window.DATA);

// Или с новыми данными
FundsService.init({
  funds: {
    "МойФонд": { type: "building", periods: {...} }
  }
});
```

---

#### `FundsService.getFundsList()`

Получить список всех доступных фондов.

| Параметры | нет |
|-----------|-----|

**Возвращает:** `Array<string>` — массив названий фондов

**Где вызывается:**
- `FundSelector.init()` — для построения выпадающего списка
- `Dashboard.loadData()` — для проверки текущего фонда

```javascript
FundsService.getFundsList();
// → ["ДВН", "ЗОЛЯ", "КРАС", "ЛОГ", "НОР", "ОЗН", "СБЛ", "ТРМ"]
```

---

#### `FundsService.getDefaultFund()`

Получить фонд по умолчанию.

| Параметры | нет |
|-----------|-----|

**Возвращает:** `string | null` — название фонда или `null` если фондов нет

**Логика:**
1. Если в данных есть `currentFund` → возвращает его
2. Иначе → возвращает первый фонд из списка

**Где вызывается:**
- `Dashboard.init()` — для установки начального фонда
- `Dashboard.loadData()` — если текущий фонд не найден в новых данных

```javascript
FundsService.getDefaultFund();
// → "ДВН"
```

---

#### `FundsService.getFundType(fundName)`

Получить тип иконки для фонда.

| Параметр | Тип | Описание |
|----------|-----|----------|
| `fundName` | `string` | Название фонда |

**Возвращает:** `string` — тип иконки (`"building"`, `"warehouse"`, `"briefcase"`)

**Где вызывается:**
- `FundsService.getIcon()` — для получения SVG
- `FundsService.getGroups()` — для группировки фондов

```javascript
FundsService.getFundType("ДВН");
// → "building"

FundsService.getFundType("ЗОЛЯ");
// → "warehouse"
```

---

#### `FundsService.getIcon(fundName)`

Получить SVG-иконку для фонда.

| Параметр | Тип | Описание |
|----------|-----|----------|
| `fundName` | `string` | Название фонда |

**Возвращает:** `string` — SVG-код иконки

**Где вызывается:**
- `FundSelector.render()` — для отображения иконки в селекторе

```javascript
FundsService.getIcon("ДВН");
// → '<svg viewBox="0 0 22 22">...</svg>'
```

---

#### `FundsService.getGroups()`

Получить фонды, сгруппированные по типам иконок (для меню).

| Параметры | нет |
|-----------|-----|

**Возвращает:** `Array<{icon: string, funds: Array<string>}>` — массив групп

**Где вызывается:**
- `FundSelector.render()` — для построения выпадающего меню с группами

```javascript
FundsService.getGroups();
// → [
//     { icon: "warehouse", funds: ["ЗОЛЯ", "КРАС", "ЛОГ", "НОР", "ОЗН", "СБЛ"] },
//     { icon: "building", funds: ["ДВН"] },
//     { icon: "briefcase", funds: ["ТРМ"] }
//   ]
```

---

#### `FundsService.getPeriods(fundName)`

Получить все периоды фонда с данными метрик.

| Параметр | Тип | Описание |
|----------|-----|----------|
| `fundName` | `string` | Название фонда |

**Возвращает:** `Object` — объект `{ "название периода": { метрика: значение } }`

```javascript
FundsService.getPeriods("ДВН");
// → {
//     "Факт '23": {
//       "Движение Д/С по операционной деятельности ООО": 1366339,
//       "Поступления по операционной деятельности": 1820000,
//       ...
//     },
//     "Факт '24": {...},
//     "План '26": {...}
//   }
```

---

#### `FundsService.getPeriodsList(fundName)`

Получить список названий периодов для фонда.

| Параметр | Тип | Описание |
|----------|-----|----------|
| `fundName` | `string` | Название фонда |

**Возвращает:** `Array<string>` — массив названий периодов

```javascript
FundsService.getPeriodsList("ДВН");
// → ["Факт '23", "Факт '24", "Факт (I-III кв. '25)\nПлан (IV кв. '25)", "План '26"]
```

---

#### `FundsService.getAllFundsWithPeriods()`

Получить все фонды с их списками периодов.

| Параметры | нет |
|-----------|-----|

**Возвращает:** `Object` — объект `{ fundName: [period1, period2, ...] }`

```javascript
FundsService.getAllFundsWithPeriods();
// → {
//     "ДВН": ["Факт '23", "Факт '24", "Факт (I-III кв. '25)\nПлан (IV кв. '25)", "План '26"],
//     "ЗОЛЯ": ["Факт '23", "Факт '24", "Факт (I-III кв. '25)\nПлан (IV кв. '25)", "План '26"],
//     "КРАС": [...],
//     ...
//   }
```

---

#### `FundsService.getDashboardData(fundName)`

Получить данные в формате для Dashboard (массив периодов).

| Параметр | Тип | Описание |
|----------|-----|----------|
| `fundName` | `string` | Название фонда |

**Возвращает:** `Array<Object>` — массив объектов периодов, отсортированных по году

**Структура элемента массива:**
```javascript
{
  id: "period-0",           // уникальный ID
  title: "Факт '23",        // название периода
  type: "fact",             // тип: "fact" | "plan" | "mixed"
  year: 2023,               // год (для сортировки)
  metrics: {                // данные метрик
    "Движение Д/С по операционной деятельности ООО": 1366339,
    ...
  }
}
```

**Где вызывается:**
- `Dashboard.generateData()` — основной метод генерации данных для UI

```javascript
FundsService.getDashboardData("ДВН");
// → [
//     { id: "period-0", title: "Факт '23", type: "fact", year: 2023, metrics: {...} },
//     { id: "period-1", title: "Факт '24", type: "fact", year: 2024, metrics: {...} },
//     { id: "period-2", title: "Факт (I-III кв. '25)\nПлан (IV кв. '25)", type: "mixed", year: 2025, metrics: {...} },
//     { id: "period-3", title: "План '26", type: "plan", year: 2026, metrics: {...} }
//   ]
```

---

### Функция getFundsData()

Вспомогательная функция для получения данных в упрощённом формате.

```javascript
getFundsData(rawData)
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `rawData` | `Object` | Объект с полем `funds` |

**Возвращает:** `Object` — `{ fundName: { period: { metric: value } } }`

```javascript
const fundsData = getFundsData(window.DATA);
// → {
//     "ДВН": {
//       "Факт '23": { "Движение Д/С...": 1366339, ... },
//       "Факт '24": { ... }
//     },
//     "ЗОЛЯ": { ... }
//   }
```

---

### Data Flow

Полная схема потока данных:

```
window.DATA.funds → FundsService.init()
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
    getFundsList()           getDashboardData(fund)
    getDefaultFund()                  ↓
    getIcon(fund)             parsePeriodInfo()
    getGroups()                       ↓
              ↓                 periodData[]
              ↓                       ↓
        FundSelector            Dashboard.render()
```

### Где и когда вызывается генерация данных

```javascript
// 1. При загрузке страницы (script.js)
Dashboard.init()
  → FundsService.init(window.DATA)    // инициализация сервиса
  → this.state.currentFund = FundsService.getDefaultFund()
  → Dashboard.generateData()
    → this.state.periodData = FundsService.getDashboardData(currentFund)
  → Dashboard.render()

// 2. При смене фонда (выбор в dropdown)
FundSelector.onChange(fundName)
  → Dashboard.setFund(fundName)
    → this.state.currentFund = fundName
    → Dashboard.generateData()
      → this.state.periodData = FundsService.getDashboardData(fundName)
    → Dashboard.render()

// 3. При загрузке новых данных
Dashboard.loadData(newData)
  → FundsService.init(newData)        // переинициализация с новыми данными
  → проверка currentFund
  → Dashboard.generateData()
    → this.state.periodData = FundsService.getDashboardData(currentFund)
  → переинициализация FundSelector
  → Dashboard.render()
```

### Ручной вызов генерации данных

```javascript
// Получить данные без обновления UI
const periodData = FundsService.getDashboardData("ЗОЛЯ");
console.log(periodData);

// Обновить UI с другим фондом
Dashboard.setFund("ЗОЛЯ"); // вызовет generateData() и render()

// Загрузить полностью новые данные
Dashboard.loadData({
  funds: {
    "НовыйФонд": { type: "briefcase", periods: {...} }
  }
});
```

## Пример полных данных

```javascript
window.DATA = {
  currentFund: "ДВН",
  viewMode: "details",
  funds: {
    "ДВН": {
      type: "building",
      periods: {
        "Факт '24": {
          "Движение Д/С по операционной деятельности ООО": 1650000,
          "Поступления по операционной деятельности": 2200000,
          "Расходы по основной деятельности": 1900000,
          "Обеспечительные платежи": 120000,
          "Движение Д/С по инвестиционной деятельности": 550000,
          "Выплата дохода акционерам (пайщикам)": -920000,
          "Расходы на капитальный ремонт": 180000,
          "Движение Д/С по финансовой деятельности": 350000,
          "Расчеты по кредитам": 220000,
          "Прочие доходы и расходы по финансовой деятельности": 60000,
          "Расходы на УК Парус": 130000,
          "Остаток по кредиту на начало периода": 4800000,
          "Остаток по кредиту на конец периода": 4500000,
          "Движение за период по Д/С": 300000,
          "Сформированные резервы (нарастающим итогом)": 350000,
          "Накопленные резервы на ремонт, непредвиденные расходы и вакансию": 320000,
          "Остаток Д/С на начало периода": 1250000,
          "Остаток Д/С на конец периода": 1550000,
          "Д/С на конец периода (с учетом резерва)": 1870000
        }
      }
    },
    "ЗОЛЯ": {
      type: "warehouse",
      periods: { ... }
    }
  }
};
```

## Тестирование

### Тестирование в консоли браузера

```javascript
// Загрузить данные с новыми фондами
BDDS.Dashboard.loadData({
  funds: {
    "Фонд1": {
      type: "building",
      periods: {
        "Факт '23": { "Движение Д/С по операционной деятельности ООО": 111111 },
        "План '26": { "Движение Д/С по операционной деятельности ООО": 222222 }
      }
    },
    "Фонд2": {
      type: "warehouse",
      periods: {
        "Факт '23": { "Движение Д/С по операционной деятельности ООО": 333333 },
        "План '26": { "Движение Д/С по операционной деятельности ООО": 444444 }
      }
    }
  }
});

// Проверить состояние
console.log(BDDS.Dashboard.state.periodData);
console.log(BDDS.Dashboard.state.currentFund); // "Фонд1"

// Проверить FundsService (через BDDS namespace)
console.log(BDDS.FundsService.getFundsList()); // ["Фонд1", "Фонд2"]
console.log(BDDS.FundsService.getGroups());    // группы по типам
```

Если в таблице появились числа `111 111` и в выпадающем списке "Фонд1", "Фонд2" — данные загружены успешно.

### Добавление нового фонда

```javascript
// Просто добавьте фонд в данные:
const newData = {
  funds: {
    ...window.DATA.funds,
    "НовыйФонд": {
      type: "briefcase",
      periods: {
        "Факт '24": { "Движение Д/С по операционной деятельности ООО": 500000 }
      }
    }
  }
};

BDDS.Dashboard.loadData(newData);
// Новый фонд появится в меню автоматически!
```

## API Dashboard

```javascript
// Загрузить данные
window.BDDS.Dashboard.loadData(data);

// Получить текущее состояние
window.BDDS.Dashboard.getState();

// Обновить конфигурацию
window.BDDS.Dashboard.updateData({
  currentFund: "ЗОЛЯ",
  chartConfig: { customValues: [400, 700, 900, 1000] }
});
```

## Структура проекта

```
BDDS/
├── index.html       # Главная страница дашборда
├── styles.css       # Стили
├── script.js        # Логика UI, FundsService, компоненты
├── generateData.js  # Утилиты (METRIC_KEYS, parsePeriodInfo)
├── test-api.html    # Тестовая страница для API
└── README.md        # Документация
```
