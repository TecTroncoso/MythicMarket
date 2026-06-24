# Mythic Market

Mythic Market is a high-performance, highly secure Next.js web application designed for processing digital top-ups (e.g., Mobile Legends Diamonds). Built from the ground up with a focus on **Security**, **Speed**, and **Server-Side Authorization**.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Turso](https://turso.tech/) (LibSQL/SQLite at the Edge)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/)
- **Anti-Bot Protection**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **Validation**: [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🛡️ Security Architecture

This project implements a Zero-Trust approach on the frontend:
- **Server-Side Pricing**: Prices and products are never trusted from the client. The frontend only sends the product ID, and the server dictates the actual price before processing.
- **Strict Validations**: Every piece of data entering the Server Actions is rigorously validated using Zod schemas.
- **Bot Mitigation**: Registration and Login flows are protected by Cloudflare Turnstile to prevent automated attacks.
- **Distributed Rate Limiting**: Upstash Redis limits consecutive requests to sensitive endpoints, mitigating brute-force and DDoS attempts.
- **Role-Based Access Control (RBAC)**: An Edge-compatible Next.js Middleware blocks unauthorized access to `/admin` routes based on JWT payload roles.

## ⚡ Performance Optimizations

- **Server Components by Default**: Heavy static UI elements (Hero banners, FAQs, Layouts) are rendered entirely on the server.
- **Islands of Interactivity**: Client Components (`'use client'`) are strictly isolated to areas requiring user interaction (like the Checkout Form and Reviews).

## 🛠️ Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/TecTroncoso/MythicMarket.git
cd MythicMarket
npm install
```

### 2. Environment Variables
Copy the `.env.example` file to `.env` and fill in your actual credentials:
```bash
cp .env.example .env
```

**Required Keys:**
- `TURSO_DATABASE_URL` & `TURSO_AUTH_TOKEN`: From your Turso dashboard.
- `BETTER_AUTH_SECRET`: Generate a random 32-byte string (e.g., `npx auth secret`).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For OAuth login.
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: For rate limiting.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY`: For bot protection.

### 3. Database Setup
Push the Drizzle schema directly to your Turso remote database:
```bash
npm run db:push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (Navbar, Checkout, Reviews).
- `/lib/db`: Drizzle ORM schemas and database client initialization.
- `/lib/actions`: Secure Server Actions for Auth and Checkout.
- `/lib/validations`: Zod schemas for strict payload validation.
- `/middleware.ts` & `/auth.config.ts`: Edge-safe middleware and NextAuth configurations.

---
*Architected and built for the modern web.*
