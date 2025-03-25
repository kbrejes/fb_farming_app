# Facebook Farming App

Приложение для автоматизации создания и прогрева Facebook аккаунтов.

## Требования

- Node.js 18+
- PostgreSQL 14+
- Android Studio с настроенным эмулятором Android

## Разработка

### Git Flow

При работе с репозиторием следуем следующим правилам:

1. Основная ветка - `main`
2. Для новых функций создаем ветки `feature/*`
3. Для исправлений создаем ветки `fix/*`
4. Используем понятные сообщения коммитов:
   - `feat:` для новых функций
   - `fix:` для исправлений
   - `docs:` для документации
   - `refactor:` для рефакторинга
   - `test:` для тестов

## Установка

1. Клонируйте репозиторий:
```bash
git clone git@github.com:kbrejes/fb_farming_app.git
cd fb_farming_app
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте базу данных PostgreSQL:
```bash
createdb fb_farming
```

4. Настройте переменные окружения:
```bash
cp .env.example .env
```
Отредактируйте `.env` файл, указав корректные значения для вашей среды.

5. Примените миграции базы данных:
```bash
npx prisma migrate dev
```

## Запуск

1. Запустите сервер разработки:
```bash
npm run dev
```

2. Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Архитектура

Приложение построено с использованием следующих технологий:

- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- PostgreSQL
- Puppeteer (автоматизация браузера)
- Appium (автоматизация Android)

### Структура проекта

```
fb_farming_app/
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React компоненты
│   ├── lib/           # Общие утилиты
│   ├── services/      # Сервисы для работы с API
│   ├── store/         # Redux store
│   ├── types/         # TypeScript типы
│   └── utils/         # Вспомогательные функции
├── prisma/
│   └── schema.prisma  # Схема базы данных
└── public/            # Статические файлы
```

## Функциональность

1. Автоматическое создание эмулятора Android
2. Регистрация Facebook аккаунтов через SMS-активацию
3. 28-дневный процесс прогрева аккаунтов
4. Мониторинг статуса и прогресса аккаунтов
5. Автоматизация действий в Facebook

## Безопасность

- Все чувствительные данные хранятся в зашифрованном виде
- Используются прокси для каждого аккаунта
- Реализована ротация User-Agent и других параметров
- Соблюдаются задержки между действиями для имитации человеческого поведения

## Лицензия

MIT 