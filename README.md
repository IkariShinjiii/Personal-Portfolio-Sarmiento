# Personal Portfolio - Kervin Sarmiento

A static portfolio site (HTML, CSS, vanilla JS) with a small AI concierge that answers visitor questions from a knowledge file.

## Structure

- `index.html` - all sections and their content
- `styles.css` - tokens, layout, dark and light themes, responsive rules
- `script.js` - scroll reveal, flip cards, menu, concierge panel
- `assets/` - profile photo, project screenshots, CV PDF, favicon
- `api/chat.js` - the concierge serverless function (POST /api/chat)
- `data/about.md` - the knowledge file the concierge reads

## Editing content

Edit `index.html` for page content and `data/about.md` for what the concierge knows. Commit and push; Vercel redeploys automatically.

## Deploy notes

- Hosted on Vercel, connected to this GitHub repo. Every push to `main` deploys.
- Set `GEMINI_API_KEY` in Vercel under Project Settings > Environment Variables. It is read only by `api/chat.js` on the server.
- For local work, put secrets in `.env.local`. It is git-ignored along with `.env`, `node_modules` and `.vercel`. Never commit keys.
