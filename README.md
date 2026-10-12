# Personal Portfolio - Kervin Sarmiento

A portfolio site built with React, TypeScript (Vite), Tailwind CSS, shadcn/ui and Framer Motion, with a small AI concierge that answers visitor questions from a knowledge file.

## Structure

- `src/` - React components, sections and styles (added in later phases)
- `public/` - static files: profile photo, project screenshots, CV PDF, favicon
- `api/chat.ts` - the concierge serverless function, POST /api/chat (added in a later phase)
- `data/about.md` - the knowledge file the concierge reads
- `.env.example` - names of the environment variables the project needs

## Editing content

Edit the section components in `src/` for page content and `data/about.md` for what the concierge knows. Commit and push; Vercel redeploys automatically.

## Deploy notes

- Hosted on Vercel, connected to this GitHub repo. Every push to `main` deploys.
- Set `GEMINI_API_KEY` in Vercel under Project Settings > Environment Variables. It is read only by `api/chat.ts` on the server.
- For local work, copy `.env.example` to `.env.local` and fill in the values. `.env`, `.env.local`, `node_modules` and `.vercel` are git-ignored. Never commit keys.
