import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseContributions } from "./_contributions";

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
