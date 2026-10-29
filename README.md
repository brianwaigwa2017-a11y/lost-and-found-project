# School Lost & Found Management System

MERN-stack web platform for reporting, searching, verifying, and recovering lost property.

## Quick Start

1. Install MongoDB locally or set `MONGO_URI` in `server/.env`.
2. Backend:
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run seed
   npm run dev
   ```
3. Frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173.

## Claim confirmation emails

Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD` in `server/.env` to your SMTP provider's settings. Optionally set `MAIL_FROM_NAME` and `MAIL_FROM_ADDRESS` to customize the sender. The claim form lets students enter the address that should receive the confirmation; the server reports when a claim is saved but the email could not be sent.

## Verification checklist

- Run backend syntax checks with `node --check` on all files under `server/src`.
- Run `cd client && npm run build` to catch frontend JSX/import issues.
- Smoke test via the API endpoints at http://localhost:5000/api/*.

## Admin account

Seed user:

- email: `admin@school.ac.ke`
- password: `Admin123!`
