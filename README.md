# expense-tracker-web

Web frontend for the Expense Tracker app, built with React, TypeScript and Vite.

## Related repositories

- [expense-tracker-backend](https://github.com/jaypatel-simform/expense-tracker-backend) - backend/API (NestJS + Prisma + PostgreSQL)

## Prerequisites

- Node.js 20+ and npm
- The backend running locally (see its README) with a seeded PostgreSQL database. The backend's `CORS_ORIGIN` must allow this app's origin (default `http://localhost:5173`).

## Setup

```bash
npm install
cp .env.example .env     # optional, the default already points at localhost:3000
npm run dev              # http://localhost:5173
```

### Environment variables

| Variable       | Default                     | Description                  |
| -------------- | --------------------------- | ---------------------------- |
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the backend API  |

## Scripts

| Command           | Purpose                            |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev server with hot reload         |
| `npm run build`   | Type-check and build to `dist/`    |
| `npm run preview` | Serve the production build         |
| `npm run lint`    | ESLint                             |
| `npm test`        | Vitest smoke tests (no backend needed) |

## Features

- Sign up, log in, log out; protected routes. The JWT is kept in `localStorage`; a 401 from the API clears it and redirects to the login page.
- Expenses: list with date-range and category filters, note search and pagination (state is kept in the URL); add, edit and delete.
- Categories: default categories (read-only) plus your own custom ones; category picker in the forms. Server errors such as "category in use" are shown.
- Income: list with pagination; add, edit and delete.
- Dashboard: spent / income / balance cards, a spending-by-category donut chart, recent transactions, and month navigation.
- Reports: monthly spending vs income trend chart (3/6/12 months ending at the selected month), month navigation and a by-category breakdown.
- Profile: set the default currency used to format amounts (no conversion).

## Verification status

`npm run build`, `npm run lint` and `npm test` pass. The app has **not** been exercised in a browser against a live PostgreSQL-backed API (no database was available where this was written). Please check this flow manually once the backend is running:

1. Sign up, confirm you land on the dashboard; log out and log back in.
2. Categories: the 8 defaults show with a "Default" badge; add, rename and delete a custom one.
3. Add an expense and an income entry; edit and delete each.
4. Expenses page: filter by date range and category, search a note, and page through results (add more than 10 to see pagination).
5. Dashboard: cards, donut and recent list update; use the month arrows.
6. Reports: trend chart and breakdown change with the month arrows.
7. Try deleting a category that has expenses (expect the server's error message), and change the currency on the Profile page.
