# KARAT TITAN — сайт стоматологической клиники

Премиальный многостраничный сайт стоматологической клиники KARAT TITAN в Тобольске. Включает лендинг, отдельные страницы услуг, врачей, цен, кейсов, отзывов и контактов, а также админ-панель и API для онлайн-записи.

## Стек

- **Фронтенд:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, GSAP, Lenis, React Router
- **Бэкенд:** Node.js, Express 5, SQLite (`node:sqlite`)
- **Интеграции:** SQNS / 1Denta CRM Exchange API (опционально, для синхронизации слотов)
- **Линтер:** oxlint

## Установка и запуск

```bash
npm install
```

Скопируйте `.env.example` в `.env` и задайте секреты:

```bash
cp .env.example .env
```

Запустите фронтенд и API вместе:

```bash
npm run dev:all
```

- Фронтенд: `http://localhost:5173`
- API: `http://localhost:3001`
- API клиники: `http://localhost:3001/api/clinic`

## Скрипты

- `npm run dev` — Vite dev-сервер
- `npm run server` — API-сервер Node.js
- `npm run dev:all` — фронтенд и API одновременно
- `npm run build` — production-сборка
- `npm run preview` — просмотр production-сборки
- `npm run lint` — oxlint

## Структура

- `src/components` — переиспользуемые компоненты (кнопки, анимации, форма записи, чат-бот)
- `src/components/sections` — секции лендинга
- `src/pages` — отдельные страницы (`/uslugi`, `/vrachi`, `/tseny`, `/kejsy`, `/otzyvy`, `/kontakty`, `/admin`)
- `src/data` — клиентские данные (филиалы, врачи, прайс)
- `server/` — Express API, сидирование SQLite и интеграция SQNS
- `public/` — статические ассеты: фото врачей, оборудования, иконки

## Филиалы

Сайт отображает два филиала в Тобольске:

- **7а микрорайон** — `+7 (912) 388-78-12`
- **15-й микрорайон (детская стоматология)** — `+7 (922) 268-80-09`

## Админка

Админ-панель доступна по адресу `/admin`. Доступ по логину и паролю из `.env`. Администратор создаётся только если задан `ADMIN_PASSWORD`.

## Переменные окружения

```env
PORT=3001
KARAT_SECRET=           # обязателен — без него сервер не запустится
ADMIN_LOGIN=admin
ADMIN_PASSWORD=         # если не задан, администратор не создаётся
```

Для интеграции с SQNS:

```env
SQNS_ENABLED=1
SQNS_BASE=https://crmexchange.1denta.ru
SQNS_EMAIL=
SQNS_PASSWORD=
```

## Примечания

- Врачи и цены берутся из SQLite-базы; начальные данные задаются в `server/seedData.js`.
- Фото врачей находятся в `public/images/doctors/`.
- Актуальный прайс-лист ведётся в `src/data/prices.ts`.
- Для production замените стандартные `.env`-credentials на надёжные и включите HTTPS.
