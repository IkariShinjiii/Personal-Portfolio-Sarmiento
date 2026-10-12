import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/Section";
import { DUR, EASE, gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";
import { contact } from "@/content";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type Activity = { total: number; days: Day[] };

const LEVEL_BG = [
  "color-mix(in srgb, var(--text) 7%, transparent)",
  "color-mix(in srgb, var(--accent2) 28%, transparent)",
  "color-mix(in srgb, var(--accent2) 50%, transparent)",
  "color-mix(in srgb, var(--accent2) 75%, transparent)",
  "var(--accent2)",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const pretty = (iso: string) => utc(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function GithubMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

export function GitHubActivity() {
  const holder = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Fetch only when the section is about to be seen.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "500px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    const ctl = new AbortController();
    fetch("/api/activity", { signal: ctl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<Activity>) : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch((e) => e.name !== "AbortError" && setFailed(true));
    return () => ctl.abort();
  }, [near]);

  // Lay the days out in GitHub's shape: one column per week, Sunday on top.
  const layout = useMemo(() => {
    if (!data) return null;
    const first = utc(data.days[0].date);
    const start = first.getTime() - first.getUTCDay() * DAY_MS;
    const weeks = Math.floor((utc(data.days[data.days.length - 1].date).getTime() - start) / (7 * DAY_MS)) + 1;
    const cells = data.days.map((d) => {
      const t = utc(d.date).getTime();
      return { ...d, week: Math.floor((t - start) / (7 * DAY_MS)), dow: utc(d.date).getUTCDay() };
    });
    const months: { week: number; label: string }[] = [];
    let last = -1;
    for (const c of cells) {
      const m = utc(c.date).getUTCMonth();
      if (m !== last && c.dow <= 3) {
        if (months.length === 0 || c.week - months[months.length - 1].week >= 3) months.push({ week: c.week, label: MONTHS[m] });
        last = m;
      }
    }
    const busiest = [...data.days].sort((a, b) => b.count - a.count)[0];
    return { weeks, cells, months, busiest };
  }, [data]);

  // The grid is revealed with a left-to-right wipe.
  useGSAP(
    () => {
      if (!layout) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        // One wipe from left to right: a single tween instead of one per day.
        gsap.from(grid.current, {
          clipPath: "inset(0 100% 0 0)",
          opacity: 0.2,
          duration: DUR.slow * 1.3,
          ease: EASE.out,
          clearProps: "clipPath,opacity",
          scrollTrigger: { trigger: grid.current, start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [layout], scope: grid },
  );

  const show = (el: HTMLElement, c: Day) => {
    const host = holder.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({
      x: r.left - host.left + r.width / 2,
      y: r.top - host.top,
      text: `${c.count === 0 ? "No" : c.count} contribution${c.count === 1 ? "" : "s"} on ${pretty(c.date)}`,
    });
  };

  return (
    <Section id="activity" label="GitHub" title="Recent Activity">
      <div ref={holder} className="relative mx-auto max-w-[1280px] rounded-card border border-border bg-surface/70 p-5 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Recent activity</p>
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Open my GitHub profile (opens in a new tab)"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-bg/60 text-muted transition-colors hover:border-accent2 hover:text-text"
          >
            <GithubMark />
          </a>
        </div>

        {failed && (
          <p className="py-16 text-center text-muted">
            I could not load my GitHub activity right now.{" "}
            <a href={contact.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline">
              See it on GitHub <ExternalLink size={14} aria-hidden />
            </a>
          </p>
        )}

        {!failed && (
          <>
            <p className="sr-only">
              {data && layout
                ? `${data.total} contributions in the last 12 months. Busiest day: ${layout.busiest.count} contributions on ${pretty(layout.busiest.date)}.`
                : "Loading GitHub activity."}
            </p>
            <div className="mt-6 overflow-x-auto pb-2" aria-hidden onPointerLeave={() => setTip(null)}>
              <div className="min-w-[820px]">
                {/* Month labels */}
                <div className="relative ml-12 h-6 font-mono text-sm text-muted">
                  {layout?.months.map((m) => (
                    <span key={`${m.label}-${m.week}`} className="absolute" style={{ left: `${(m.week / layout.weeks) * 100}%` }}>
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="grid w-9 shrink-0 grid-rows-7 gap-[4px] font-mono text-sm text-muted">
                    {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                      <span key={i} className="flex items-center">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div
                    ref={grid}
                    className="grid flex-1 grid-flow-col grid-rows-7 gap-[4px]"
                    style={{ gridTemplateColumns: `repeat(${layout?.weeks ?? 53}, minmax(0, 1fr))` }}
                  >
                    {layout
                      ? layout.cells.map((c) => (
                          <span
                            key={c.date}
                            data-cell
                            onPointerEnter={(e) => show(e.currentTarget, c)}
                            style={{ gridColumn: c.week + 1, gridRow: c.dow + 1, background: LEVEL_BG[c.level] }}
                            className="aspect-square rounded-[4px] hover:ring-2 hover:ring-text/70"
                          />
                        ))
                      : Array.from({ length: 53 * 7 }, (_, i) => (
                          <span key={i} style={{ background: LEVEL_BG[0] }} className="aspect-square animate-pulse rounded-[4px]" />
                        ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <p>{data ? `${data.total.toLocaleString()} contributions in the last 12 months` : "Loading activity..."}</p>
              <div aria-hidden className="flex items-center gap-2">
                Less
                {LEVEL_BG.map((bg, i) => (
                  <span key={i} className="size-3.5 rounded-[3px]" style={{ background: bg }} />
                ))}
                More
              </div>
            </div>
          </>
        )}

        {tip && (
          <div
            role="presentation"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg border border-border bg-bg px-3 py-1.5 text-xs text-text shadow-lg"
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.text}
          </div>
        )}
      </div>
    </Section>
  );
}
