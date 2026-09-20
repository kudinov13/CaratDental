# Karat Dental

Премиальный лендинг стоматологической клиники. React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + GSAP + Lenis.

## Запуск

```bash
npm install
npm run dev
```

## Скрипты

- `npm run dev` — локальный dev-сервер
- `npm run build` — production-сборка
- `npm run preview` — просмотр production-сборки
- `npm run lint` — oxlint

## Структура

- `src/components` — переиспользуемые компоненты (курсор, лоадер, кнопки, reveal-анимации, форма записи)
- `src/components/sections` — секции лендинга
- `src/styles/index.css` — дизайн-токены и Tailwind v4 theme mapping
- `public/` — статические ассеты

## Дизайн-система

Все цвета, шрифты и отступы описаны через CSS-переменные в `src/styles/index.css`.

Основные токены:

- Фон: `--bg-primary: #FDFBF8`, `--bg-secondary: #F4F1EC`
- Текст: `--ink: #0F0F0F`, `--text-secondary: #5A5854`, `--text-muted: #8E8C86`
- Акценты: `--accent-primary: #5A8C78` (sage), `--accent-secondary: #C9A87C` (gold)
- Радиусы: `--radius-card: 2rem`, `--radius-pill: 9999px`
- Тени: `--shadow-sm/md/lg`
- Шрифты: Manrope (заголовки), Inter (тело)

## Ассеты (заглушки / на замену)

В `public/` размещены SVG-заглушки. Для production замените их на реальные файлы по путям:

### Видео

- `public/videos/hero-loop.mp4` — 5-10 сек loop, H.264, < 3 MB

### Hero

- `public/images/hero/clinic-interior.jpg` — fallback для видео
- `public/images/hero/smile-after.jpg` — базовое изображение идеальной улыбки
- `public/images/hero/smile-before.jpg` — изображение «до» для интерактивного canvas

### Врачи

- `public/images/doctors/doctor-1.jpg`
- `public/images/doctors/doctor-2.jpg`
- `public/images/doctors/doctor-3.jpg`
- `public/images/doctors/doctor-4.jpg`

### Кейсы до/после

- `public/images/cases/case-{1..3}-before.jpg`
- `public/images/cases/case-{1..3}-after.jpg`

### Оборудование

- `public/images/equipment/equipment-1.jpg`
- `public/images/equipment/equipment-2.jpg`
- `public/images/equipment/equipment-3.jpg`

### Отзывы

- `public/images/testimonials/patient-1.jpg`
- `public/images/testimonials/patient-2.jpg`
- `public/images/testimonials/patient-3.jpg`

### 3D-модель (опционально)

- `public/models/tooth.glb` — если появится, можно подключить `@react-three/fiber` в `Technology.tsx`

После замены изображений уберите `.svg`-расширения в импортах секций (сейчас используются `.svg`-заглушки).

## Особенности

- Custom cursor с spring-физикой и hover-скейлом
- Page loader с анимированным счётчиком 000 → 100
- Lenis smooth scroll
- Hero с интерактивным before/after canvas
- Hover-responsive services list
- Count-up статистика
- Аккордеон FAQ с spring-анимацией
- Booking modal с фокус-управлением и escape/backdrop закрытием
- prefers-reduced-motion уважается во всех анимациях

## Расширение на многостраничный сайт

В `App.tsx` уже используется `react-router-dom` с `BrowserRouter`. Добавьте новые `Route` и замените якорные ссылки в `Header` на `Link` из `react-router-dom`.
