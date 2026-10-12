export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Activity = { total: number; days: Day[] };

/**
 * Parses GitHub's public contribution calendar fragment (https://github.com/users/<name>/contributions).
 * Each day is a <td data-date data-level> followed by a <tool-tip> saying "N contributions on <date>".
 * Returns null if the markup is not what we expect, so callers can fall back instead of showing wrong data.
 */
export function parseContributions(html: string): Activity | null {
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
