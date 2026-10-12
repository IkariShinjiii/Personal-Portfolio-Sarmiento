import type { VercelRequest, VercelResponse } from "@vercel/node";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type Activity = { total: number; days: Day[] };

/**
 * Parses GitHub's public contribution calendar fragment (https://github.com/users/<name>/contributions).
 * Each day is a <td data-date data-level> followed by a <tool-tip> saying "N contributions on <date>".
 * Returns null if the markup is not what we expect, so callers can fall back instead of showing wrong data.
 */
function parseContributions(html: string): Activity | null {
  const cells = [...html.matchAll(/<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="([0-4])"[^>]*>/g)];
  const tips = [...html.matchAll(/<tool-tip[^>]*>\s*([^<]*?)\s*<\/tool-tip>/g)].map((m) => m[1]);
  if (cells.length < 300 || tips.length !== cells.length) return null;

  const days: Day[] = cells.map((c, i) => {
    const m = /^(\d[\d,]*) contributions?/.exec(tips[i]);
    return { date: c[1], count: m ? Number(m[1].replace(/,/g, "")) : 0, level: Number(c[2]) as Day["level"] };
  });
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  return { total: days.reduce((s, d) => s + d.count, 0), days };
}

const USER = "IkariShinjiii";

// Public data only, no token. The username is fixed, so there is no user input to validate.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const r = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { "User-Agent": "portfolio-activity", Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`github ${r.status}`);
    const data = parseContributions(await r.text());
    if (!data) throw new Error("unexpected markup");
    // An hour fresh, a day stale-while-revalidate: GitHub is hit rarely, visitors get instant answers.
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch (err) {
    console.error("activity failed", err instanceof Error ? err.message : err);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Could not load GitHub activity right now." });
  }
}
