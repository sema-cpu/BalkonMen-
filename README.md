# Balkon Café Web Experience

Dark-themed promotional website + QR menu + admin panel built with Next.js, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## Features

- Promotional homepage (`/`) with modern dark visual design
- Dedicated About Us (`/about`) and Contact (`/contact`) pages aligned with the same visual system
- Bilingual public experience with locale-based routes (`/tr`, `/en`)
- QR-first menu page (`/menu`) with category navigation and item cards
- Private admin management panel for menu + full website content CMS
- Editable homepage/about/contact text blocks from admin
- Editable published articles from admin (rendered dynamically on public pages)
- Dynamic bilingual content editing from admin (switch between Turkish and English)
- Supabase schema + RLS policy migration included
- Shared menu data flow used by homepage and menu page

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui + Radix primitives
- Supabase (Auth + PostgreSQL)

## Setup

1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `cp .env.example .env.local` (or create `.env.local` manually on Windows)
3. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Run migrations in Supabase SQL editor:
    - `supabase/migrations/001_initial_schema.sql`
    - `supabase/migrations/002_site_content_management.sql`
    - `supabase/migrations/003_bilingual_content_support.sql`
5. Sign in through your private admin URL shared only with authorized staff. If no admin exists yet, initialize the signed-in account as the first admin from the page.
6. Run development server:
   - `npm run dev`

## Admin Panel Notes

- Admin routes are protected by middleware
- Admin entry points are intentionally not linked from public pages
- If Supabase env values are missing, admin access is redirected to login with setup guidance
- Destructive actions require typing `DELETE` for confirmation
- Public pages use cached DB-driven content with tag-based revalidation for performance
- Legacy non-localized routes redirect to default locale (`/tr`)

## Project Structure

- `src/app` → routes
- `src/components` → reusable UI
- `src/data/menu.ts` → local fallback menu data
- `src/lib/supabase` → clients, middleware, repositories
- `supabase/migrations` → SQL schema and policies
