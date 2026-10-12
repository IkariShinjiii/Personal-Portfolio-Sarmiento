# Personal Portfolio - Kervin Sarmiento

Live: https://personal-portfolio-sarmiento.vercel.app

A single-page portfolio built with React, TypeScript (Vite), Tailwind CSS and GSAP, with an AI concierge and a GitHub-signed guestbook.

## Features
- Chat hero: `/api/chat` (Vercel function) answers questions from `data/about.md` using Gemini
- Guestbook: GitHub sign-in through Supabase Auth; one message per visitor, row-level security
- Cursor-reactive dot-grid background, draggable skills globe with brand logos and two auto-scrolling skill carousels, dark and light themes
- Respects reduced motion; keyboard accessible

## Structure
- `src/` - components, sections (`About`, `Hero`, `Projects`, `Guestbook`) and `content.ts` (all page copy)
- `public/` - profile photo, favicon, robots.txt, sitemap
- `api/chat.ts` - the concierge serverless function
- `data/about.md` - the knowledge file the concierge reads (keep it in sync with `content.ts`)
- `supabase/migrations/` - guestbook table and policies

## Editing content
Edit `src/content.ts` for page copy and `data/about.md` for what the concierge knows. Push to `main`; Vercel redeploys.

## Run locally
```
npm install
npm run dev
```
Copy `.env.example` to `.env.local` for local overrides. The chat needs `vercel dev` (or a deployed preview) because `/api/chat` is a Vercel function.

## Environment variables
- `GEMINI_API_KEY` (Vercel, server only): enables the concierge. Never commit it.
- `GEMINI_MODEL` (optional): defaults to `gemini-2.5-flash`.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (optional): the public defaults are built in.

## Deploy notes
Hosted on Vercel from this repo; every push to `main` deploys. Supabase Auth Site URL and redirect URLs must include the Vercel domain and `http://localhost:5173`.
