<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SelfOrder Project Rules

## Project Identity

- Project name: SelfOrder.
- Goal: Build a QR-based self-ordering web application for restaurant or cafe tables.
- Current priority: UI/UX development first, followed by backend integration.
- Development environment: Windows and Visual Studio Code.

## Technology Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- PostgreSQL.
- Node.js and npm.

## Development Principles

- Inspect the existing project structure and relevant local Next.js documentation before making changes.
- Preserve the existing UI and design unless a change is explicitly requested.
- Prefer small, maintainable, and clearly scoped changes.
- Keep components reusable and responsive across desktop and mobile devices.
- Use TypeScript types instead of unnecessary `any` types.
- Run relevant type checks and linting after implementation.

## Database and Security

- Keep PostgreSQL queries, database credentials, and database access code on the server.
- Never expose `DATABASE_URL` or other secrets to browser-side code.
- Do not use the `NEXT_PUBLIC_` prefix for database credentials.
- Validate product availability, prices, quantities, and order totals on the server.
- Never trust prices or totals submitted by the browser.
- Use database transactions when creating an order and its order items.
- Validate the QR table identifier on the server before associating an order with a table.
- Use parameterized SQL queries; never concatenate untrusted input into SQL statements.
- Never commit `.env.local` or other secret files to Git.

## UI/UX and Business Logic

- Keep the customer ordering flow simple: browse menu, search or filter products, add items to cart, review the cart, and submit an order.
- Display loading, empty, success, and error states where appropriate.
- Treat current static menu data and demo checkout behavior as temporary until the corresponding backend features are implemented.
- Do not claim an order has been created unless the server confirms success.

## Change Control

- Do not replace the existing framework, database, or project architecture without explicit approval.
- Do not run destructive database commands or force dependency upgrades without reviewing the impact first.
- Do not remove the generated Next.js agent rules above.
