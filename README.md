# Flowers Shop Backend

REST API для онлайн-магазина цветов. Приложение предоставляет полный функционал управления каталогом товаров, пользователями, корзиной и заказами с поддержкой аутентификации и ролевого доступа.

## Возможности

- Аутентификация и авторизация пользователей с JWT токенами.
- Управление пользовательскими профилями и специальными правами доступа (USER, ADMIN).
- Верификация email-адреса и восстановление пароля через отправку токенов.
- Каталог товаров с категориями и операциями поиска/фильтрации.
- Управление корзиной товаров с добавлением/удалением товаров.
- Создание и управление заказами с отслеживанием статуса (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED).
- Загрузка и хранение изображений товаров.
- Полная документация API с Swagger UI.
- Модульная архитектура с разделением на сервисы, контроллеры и маршруты.
- Комплексное тестирование с Jest и интеграционные тесты с Supertest.
- Обработка ошибок и валидация данных на основе Zod.

## Стек

- Node.js & Express 5
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- Bcrypt для хеширования паролей
- Nodemailer для отправки писем
- Zod для валидации
- Swagger/OpenAPI для документации
- Jest & Supertest для тестирования
- Docker & Docker Compose

## Запуск проекта

1. Клонируйте репозиторий:

```bash
git clone https://github.com/your-username/flowers-shop-backend.git
cd flowers-shop-backend
```

2. Убедитесь, что установлены Node.js и Docker:

```bash
node --version
docker --version
docker-compose --version
```

3. Установите зависимости:

```bash
npm install
```

4. Создайте файл `.env` в корне проекта и добавьте необходимые переменные окружения:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=flowers_shop
POSTGRES_URL=postgresql://postgres:your_password@localhost:5433/flowers_shop

# Server
APPLICATION_PORT=4000

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email (для отправки писем)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL (для CORS)
FRONTEND_URL=http://localhost:5173
```

5. Запустите PostgreSQL в Docker:

```bash
docker-compose up -d
```

6. Выполните миграции базы данных:

```bash
npm run migrate:dev
```

7. Сгенерируйте Prisma Client:

```bash
npm run generate
```

8. Запустите приложение:

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:4000/`.
Документация API доступна по адресу `http://localhost:4000/docs`.

## Структура проекта

```
src/
├── auth/               - Аутентификация и авторизация
├── user/               - Управление пользователями
├── product/            - Управление товарами
├── category/           - Управление категориями
├── cart/               - Управление корзиной
├── order/              - Управление заказами
├── routes/             - Определение маршрутов API
├── schemas/            - Zod-схемы для валидации
├── middlewares/        - Express middleware (аутентификация, обработка ошибок)
├── lib/                - Вспомогательные библиотеки (JWT, логирование, email)
├── shared/
│   ├── constants/      - Константы приложения
│   └── utils/          - Вспомогательные функции
├── types/              - TypeScript типы (расширения Express)
├── config/             - Конфигурация приложения
├── database/           - Инициализация Prisma Client
├── docs/               - Swagger/OpenAPI документация
└── main.ts             - Точка входа приложения

test/
├── auth/               - Тесты аутентификации
├── cart/               - Тесты корзины
├── orders/             - Тесты заказов
├── helpers/            - Вспомогательные функции для тестирования
└── __mocks__/          - Mock-объекты для тестирования

prisma/
├── schema.prisma       - Определение схемы БД
└── migrations/         - История миграций
```

## Доступные команды

- `npm run dev` - Запуск приложения в режиме разработки с hot-reload
- `npm run start` - Запуск приложения в продакшене
- `npm run build` - Компиляция TypeScript в JavaScript
- `npm run migrate:dev` - Создание и применение миграций в разработке
- `npm run migrate:deploy` - Применение миграций в продакшене
- `npm test` - Запуск всех тестов
- `npm run test:coverage` - Запуск тестов с отчетом о покрытии

## API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `POST /auth/verify-email` - Верификация email
- `POST /auth/reset-password` - Восстановление пароля

### Пользователи

- `GET /users/profile` - Получение профиля текущего пользователя
- `PUT /users/profile` - Обновление профиля
- `PUT /users/password` - Изменение пароля

### Товары

- `GET /products` - Получение списка товаров
- `GET /products/:id` - Получение товара по ID
- `POST /products` - Создание товара (ADMIN)
- `PUT /products/:id` - Обновление товара (ADMIN)
- `DELETE /products/:id` - Удаление товара (ADMIN)

### Категории

- `GET /categories` - Получение всех категорий
- `POST /categories` - Создание категории (ADMIN)
- `PUT /categories/:id` - Обновление категории (ADMIN)
- `DELETE /categories/:id` - Удаление категории (ADMIN)

### Корзина

- `GET /cart` - Получение корзины пользователя
- `POST /cart/items` - Добавление товара в корзину
- `DELETE /cart/items/:id` - Удаление товара из корзины
- `PUT /cart/items/:id` - Обновление количества товара

### Заказы

- `GET /orders` - Получение заказов пользователя
- `POST /orders` - Создание нового заказа
- `GET /orders/:id` - Получение заказа по ID
- `PUT /orders/:id/status` - Обновление статуса заказа (ADMIN)

Полная документация API доступна в Swagger UI по адресу `/docs`.

## Аутентификация

Приложение использует JWT токены для аутентификации. Токен передается в заголовке `Authorization`:

```
Authorization: Bearer <your_jwt_token>
```

Токены хранятся в HTTP-only cookies для защиты от XSS атак.

## Тестирование

Проект использует Jest и Supertest для модульного и интеграционного тестирования:

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage
```

Тесты включают проверку:

- Аутентификации и авторизации
- CRUD операций для товаров и категорий
- Управления корзиной и заказами
- Обработки ошибок и валидации данных
