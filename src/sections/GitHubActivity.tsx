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
const COMPACT_WEEKS = 18; // about four months

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const pretty = (iso: string) => utc(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function GithubMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

/** Totals for the stat tiles. A streak is a run of days with at least one contribution; an empty today does not break it yet. */
function summarize(days: Day[]) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].count > 0) {
    current++;
    i--;
  }
  const peak = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);
  return { current, longest, peak };
}

function Stat({ label, value, unit, dim }: { label: string; value: string; unit: string; dim?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg/50 px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted min-[380px]:text-[11px]">{label}</p>
      <p className={dim ? "mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-muted" : "mt-1.5 flex flex-wrap items-baseline gap-x-1.5"}>
        <span className="text-2xl font-extrabold tabular-nums leading-none">{value}</span>
        <span className="font-mono text-xs text-muted">{unit}</span>
      </p>
    </div>
  );
}

export function GitHubActivity() {
  const holder = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Activity | null>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  // On phones the full year is too small to read, so show the last four months at a usable size.
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

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
    const totalWeeks = Math.floor((utc(data.days[data.days.length - 1].date).getTime() - start) / (7 * DAY_MS)) + 1;
    const skip = compact ? Math.max(0, totalWeeks - COMPACT_WEEKS) : 0;
    const weeks = totalWeeks - skip;
    const cells = data.days
      .map((d) => {
        const t = utc(d.date).getTime();
        return { ...d, week: Math.floor((t - start) / (7 * DAY_MS)) - skip, dow: utc(d.date).getUTCDay() };
      })
      .filter((c) => c.week >= 0);
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
    // If the first months are empty, say so instead of leaving a wall of blank squares unexplained.
    const firstActive = data.days.find((d) => d.count > 0);
    const startsLate = !!firstActive && (utc(firstActive.date).getTime() - utc(data.days[0].date).getTime()) / DAY_MS > 60;
    return { weeks, cells, months, busiest, since: startsLate && firstActive ? firstActive.date : null };
  }, [data, compact]);

  const stats = useMemo(() => (data ? summarize(data.days) : null), [data]);

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
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Contributions" value={data ? data.total.toLocaleString() : "-"} unit="/ yr" />
              <Stat label="Current_streak" value={stats ? String(stats.current) : "-"} unit={stats?.current === 1 ? "day" : "days"} dim={stats?.current === 0} />
              <Stat label="Longest_streak" value={stats ? String(stats.longest) : "-"} unit={stats?.longest === 1 ? "day" : "days"} />
              <Stat label="Peak_day" value={stats ? String(stats.peak.count) : "-"} unit={stats?.peak.count === 1 ? "contribution" : "contributions"} />
            </div>
            <div className="mt-6 pb-2 md:overflow-x-auto" aria-hidden onPointerLeave={() => setTip(null)}>
              <div className="md:min-w-[820px]">
                {/* Month labels */}
                <div className="relative h-6 font-mono text-xs text-muted md:ml-12 md:text-sm">
                  {layout?.months.map((m) => (
                    <span key={`${m.label}-${m.week}`} className="absolute" style={{ left: `${(m.week / layout.weeks) * 100}%` }}>
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 md:gap-3">
                  <div className="hidden w-9 shrink-0 md:grid grid-rows-7 gap-[4px] font-mono text-sm text-muted">
                    {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                      <span key={i} className="flex items-center">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div
                    ref={grid}
                    className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px] md:gap-[4px]"
                    style={{ gridTemplateColumns: `repeat(${layout?.weeks ?? (compact ? COMPACT_WEEKS : 53)}, minmax(0, 1fr))` }}
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
                      : Array.from({ length: (compact ? COMPACT_WEEKS : 53) * 7 }, (_, i) => (
                          <span key={i} style={{ background: LEVEL_BG[0] }} className="aspect-square animate-pulse rounded-[4px]" />
                        ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <p>
                {data ? `${data.total.toLocaleString()} contributions in the last 12 months` : "Loading activity..."}
                {compact && data && <span className="mt-1 block text-xs">Showing the last 4 months</span>}
                {layout?.since && (
                  <span className="mt-1 block text-xs">
                    Public activity starts {utc(layout.since).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
                  </span>
                )}
              </p>
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
