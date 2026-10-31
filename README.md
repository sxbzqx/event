# EventFlow

Сервис регистрации на мероприятия. Организатор создаёт событие с лимитом мест,
посетители записываются по имени и email. Лимит мест соблюдается даже при
одновременных запросах.

## Стек

- **API:** ASP.NET Core 8, EF Core, PostgreSQL
- **Клиент:** Next.js, React, TypeScript, Tailwind CSS v4
- **Инфраструктура:** Docker Compose
- **Тесты:** xUnit, Testcontainers (настоящий PostgreSQL)

## Структура

```
event/
├── api/                                # ASP.NET Core API
│   ├── Controllers/                    # HTTP-слой
│   ├── Services/                       # бизнес-логика
│   ├── Repositories/                   # доступ к БД
│   ├── Interfaces/                     # контракты сервиса и репозитория
│   ├── DTOs/                           # модели запросов и ответов
│   ├── Exceptions/                     # доменные исключения
│   ├── Models/                         # сущности БД
│   ├── Data/                           # DbContext
│   ├── Migrations/                     # миграции EF Core
│   ├── Program.cs                      # точка входа, DI, middleware
│   ├── appsettings.json                # конфигурация
│   └── Dockerfile      
├── api.Tests/                          # интеграционные тесты (Testcontainers)
├── client/                             # Next.js (App Router)
│   ├── app/        
│   │   ├── layout.tsx                  # общий каркас: шапка, подвал
│   │   ├── page.tsx                    # главная: поиск, фильтры, список событий
│   │   ├── globals.css                 # Tailwind и тема (палитра, шрифт)
│   │   └── events/     
│   │       ├── [id]/       
│   │       │   ├── page.tsx            # серверная обёртка страницы события
│   │       │   └── EventClient.tsx     # страница события: места, форма записи, участники
│   │       └── create/
│   │           └── page.tsx            # форма создания события
│   ├── components/     
│   │   ├── EventCover.tsx              # градиентная обложка события
│   │   └── Icons.tsx                   # SVG-иконки
│   ├── lib/        
│   │   ├── api.ts                      # адрес API (NEXT_PUBLIC_API_URL)
│   │   └── format.ts                   # даты, склонения, статусы мест, общие CSS-классы
│   ├── types/      
│   │   ├── eventData.ts                # тип ответа API: событие
│   │   └── registration.ts             # тип ответа API: запись
│   ├── public/                         # статические файлы
│   ├── next.config.ts                  # настройки Next (output: standalone)
│   ├── postcss.config.mjs              # подключение Tailwind
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

Слои: **контроллер → сервис → репозиторий**. Наружу отдаются только DTO.

## Быстрый старт (Docker)

Нужен установленный Docker.

```bash
cp .env.example .env        # при желании поменяйте пароль и порты
docker compose up --build
```

| Сервис     | Адрес                          |
|------------|--------------------------------|
| Клиент     | http://localhost:3000          |
| API        | http://localhost:5280          |
| Swagger    | http://localhost:5280/swagger  |
| PostgreSQL | localhost:5434                 |

Миграции применяются автоматически при старте API. Данные БД хранятся в
volume `pgdata` и переживают перезапуск контейнеров.

Остановить:

```bash
docker compose down        # данные сохранятся
docker compose down -v     # вместе с данными БД
```

> `PUBLIC_API_URL` вшивается в клиент при сборке. После его изменения:
> `docker compose up --build client`.

## Локальная разработка

Запустите только базу в Docker, остальное локально:

```bash
docker compose up -d db

# API
cd api
dotnet run

# Клиент (в другом терминале)
cd client
npm ci
npm run dev
```

Строка подключения к БД для локального API находится в `api/appsettings.json`.

## Тесты

Нужен запущенный Docker: Testcontainers сам поднимает PostgreSQL.

```bash
dotnet test api.Tests
```

Интеграционный тест создаёт мероприятие на 10 мест и отправляет 50
одновременных регистраций. Проходят ровно 10, остальные получают 409.

## API

| Метод  | Путь                                         | Описание                  |
|--------|----------------------------------------------|---------------------------|
| GET    | `/api/events`                                | Список мероприятий        |
| GET    | `/api/events/{id}`                           | Одно мероприятие          |
| POST   | `/api/events`                                | Создать мероприятие       |
| GET    | `/api/events/{id}/registrations`             | Участники                 |
| POST   | `/api/events/{id}/registrations`             | Записаться                |
| DELETE | `/api/events/{id}/registrations/{regId}`     | Отменить запись           |

Коды ответа при записи: `201` успех, `400` пустые поля или событие уже началось,
`404` события нет, `409` мест нет или этот email уже записан.

## Как соблюдается лимит мест

Запись выполняется в транзакции с блокировкой строки мероприятия
(`SELECT ... FOR UPDATE`). Параллельные запросы выстраиваются в очередь, и каждый
видит записи предыдущих. Дополнительно в БД стоит уникальный индекс
`(EventId, Email)`.

## Переменные окружения

| Переменная          | По умолчанию            | Назначение                               |
|---------------------|-------------------------|------------------------------------------|
| `POSTGRES_DB`       | `event_db`              | Имя БД                                   |
| `POSTGRES_USER`     | `postgres`              | Пользователь БД                          |
| `POSTGRES_PASSWORD` | `postgres`              | Пароль БД                                |
| `CLIENT_PORT`       | `3000`                  | Порт клиента на хосте                    |
| `API_PORT`          | `5280`                  | Порт API на хосте                        |
| `DB_PORT`           | `5434`                  | Порт PostgreSQL на хосте                 |
| `PUBLIC_API_URL`    | `http://localhost:5280` | Адрес API для браузера (при сборке)      |
| `CORS_ORIGINS`      | `http://localhost:3000` | Разрешённые origin'ы, через запятую      |
| `SWAGGER_ENABLED`   | `true`                  | Включить Swagger в контейнере            |