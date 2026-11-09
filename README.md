# Personal Portfolio - Kervin Sarmiento

Live: https://personal-portfolio-sarmiento.vercel.app

A single-page portfolio for a Full Stacked Developer open to freelance work, built with React 19, TypeScript (Vite), Tailwind CSS v4 and GSAP, with an AI concierge and a GitHub-signed guestbook.

## Features
- Chat hero: `/api/chat` (Vercel function) answers questions from `data/about.md` using Gemini
- Hero background: a WebGL2 aurora shader (`src/components/AuroraBackdrop.tsx`, shaders in `src/lib/aurora-shaders.ts`) that fades out as you scroll into the dot grid. It starts after the page has loaded, runs at about 30fps on touch devices, draws one still frame with reduced motion, and re-reads the theme colors on dark/light toggle
- About, Education and Work with me (freelance services) sections, all copy in `src/content.ts`
- Projects: a scroll-driven 3D orbit that settles into a grid on desktop (a plain grid on tablets, phones and reduced motion); the project list lives in `src/content.ts`
- Nav: the Other pill opens a menu on hover or focus (Work with me, Resume, Guestbook, Contact, GitHub, Instagram)
- Recent activity: GitHub contribution heatmap plus total, current streak, longest streak and peak-day tiles, from `api/activity.ts` (public data, no token, cached an hour)
- Guestbook: GitHub sign-in through Supabase Auth; one message per visitor, row-level security
- Cursor-reactive dot-grid background, draggable skills globe with brand logos and two auto-scrolling skill carousels, dark and light themes
- Respects reduced motion; keyboard accessible

## Featured projects
Shown in the Projects section (order and copy in `src/content.ts`):
1. Mind Bridge - capstone
2. ACUA website - storefront
3. Gabay - desktop app
4. Kape Lokal - web app
5. UTM Esports website - team project with Cascade Development Group (CDG), in development
6. Anime Pet Simulator - side hobby, live on Roblox (a View link is added once the game URL is set in `content.ts`)

Each card uses a screenshot in `public/projects/`.

## Structure
- `src/` - `components/` (including `Nav`, `OrbitProjects`, `AuroraBackdrop`, `SkillsSphere`), sections (`Hero`, `About`, `Education`, `Skills`, `Projects`, `GitHubActivity`, `Gear`, `Services`, `Guestbook`) and `content.ts` (all page copy)
- `public/` - profile photo, favicon, project screenshots, resume PDF, intro-screen script (`preloader.js`), `llms.txt`, robots.txt, sitemap
- `api/chat.ts` - the concierge serverless function
- `data/about.md` - the knowledge file the concierge reads (keep it in sync with `content.ts`)
- `supabase/migrations/` - guestbook table and policies

## Editing content
Edit `src/content.ts` for page copy and `data/about.md` for what the concierge knows. Keep `public/llms.txt`, the static hero shell in `index.html` and the intro text in `public/preloader.js` in sync when the role or summary changes. The resume is `public/Kervin_Sarmiento_Resume.pdf`; replace the file to update it. Push to `main`; Vercel redeploys.

## Performance and security notes
- The CSP in `vercel.json` allows scripts only from `'self'`, so the aurora shaders are vendored in the repo instead of loaded from Framer.
- The aurora is the heaviest thing on the page. Headless Lighthouse renders WebGL in software, which inflates blocking time, so check mobile scores on a real device too.
- The intro screen plays once per browser session (skipped with reduced motion) and is a deliberate design choice, but it is what Lighthouse sees as the first paint on mobile.

## Working method
One issue, one branch and one pull request per change; merge to `main` only after testing it in a real browser. Vercel deploys `main` automatically.

## Run locally
```
npm install
npm run dev      # dev server
npm run build    # type-check and production build
```
Copy `.env.example` to `.env.local` for local overrides. The chat needs `vercel dev` (or a deployed preview) because `/api/chat` is a Vercel function.

## Environment variables
- `GEMINI_API_KEY` (Vercel, server only): enables the concierge. Never commit it.
- `GEMINI_MODEL` (optional): defaults to `gemini-2.5-flash`.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (optional): the public defaults are built in.

## Deploy notes
Hosted on Vercel from this repo; every push to `main` deploys. Supabase Auth Site URL and redirect URLs must include the Vercel domain and `http://localhost:5173`.
