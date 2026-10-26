# expense-tracker-web

Web frontend for the Expense Tracker app. Built with **React + Vite + TypeScript + Tailwind CSS**, TanStack Query and React Router.

Backend: [expense-tracker-backend](https://github.com/jaypatel-simform/expense-tracker-backend)

## Features (MVP)

- Register / log in (JWT stored in `localStorage`), protected routes
- Dashboard: total for a date range (default: current month), breakdown by category, last 6 months
- Expenses: list with date / category filters and pagination, add / edit / delete
- Categories: list, add, delete

## Getting started

Start the backend first (see its README), then:

```bash
cp .env.example .env     # VITE_API_URL, default http://localhost:3000/api
npm install
npm run dev              # http://localhost:5173
```

`npm run build` type-checks and produces a production bundle in `dist/`.

Currency is fixed to USD for the MVP - change it in `src/lib/format.ts`.
