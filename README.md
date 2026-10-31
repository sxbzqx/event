# EventFlow

Регистрация на мероприятия: ASP.NET Core 8 (`api`) + Next.js (`client`) + PostgreSQL.

## Запуск в Docker

```bash
cp .env.example .env     # при желании поменять пароль и порты
docker compose up --build
```

- Клиент: http://localhost:3000
- API / Swagger: http://localhost:5280/swagger
- PostgreSQL: localhost:5434 (данные в volume `pgdata`)

Миграции применяются автоматически при старте API.

> `PUBLIC_API_URL` вшивается в клиент при сборке. Если меняете его — пересоберите: `docker compose up --build client`.

## Локальная разработка

```bash
# api (нужен Postgres, см. ConnectionStrings в appsettings.json)
cd api && dotnet run

# client
cd client && npm ci && npm run dev
```
