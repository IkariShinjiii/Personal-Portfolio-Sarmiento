import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrbitItem = {
  n: string;
  category: string;
  title: string;
  tags: string[];
  href: string;
  tone: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
};

// Tuned for the Framer OrbitProjects component this is ported from.
const SCROLL_VH = 380; // section height in viewport heights; the sticky stage rides along it
const START_OFFSET = 0.55; // progress starts once the section top is this far up the viewport
const SMOOTHNESS = 7; // damping rate: higher settles faster
const PERSPECTIVE = 1300;
const CURVE_W = 570;
const CURVE_H = 210;
const DEPTH = 520;
const ROTATION = 310; // degrees travelled around the orbit
const ARC_CARD_W = 410;
const OFFSET_Y = -40;
const ASPECT = 1.6;
const GRID_GAP = 16;
const GRID_MAX_W = 1160;
const CAPTION_H = 88; // room under each card for its caption
const GRID_FILL = 0.84; // the settled grid, captions included, uses at most this much of the viewport height
const GRID_Y = 0.52; // vertical centre of the settled grid, as a fraction of the viewport
const DEPTH_SCALE = 0.82;
const DEPTH_OPACITY = 0.2;
const QUALITY = 2; // render cards at 2x and scale down so the front card stays sharp
const TITLE_GAP = 32;
const CENTER_TEXT_W = 220;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoother = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Cards fly in on a 3D orbit as the page scrolls, then flatten into a grid. Native port of the
 * Framer OrbitProjects component. Per-frame transforms are written straight to the DOM, not
 * through React state, so scrolling never re-renders anything.
 */
export function OrbitProjects({ items }: { items: OrbitItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const n = items.length;

    let vw = 0;
    let vh = 0;
    const measure = () => {
      const b = stage.getBoundingClientRect();
      vw = Math.max(Math.round(b.width), 1);
      vh = Math.max(Math.round(b.height), 1);
    };

    const render = (progress: number) => {
      const cols = Math.min(3, n);
      const rows = Math.ceil(n / cols);
      const maxW = Math.min(GRID_MAX_W, Math.max(vw - 96, 200));
      const maxH = (vh * GRID_FILL - rows * CAPTION_H - (rows - 1) * GRID_GAP) / rows;
      const cardW = Math.max(90, Math.min((maxW - GRID_GAP * (cols - 1)) / cols, maxH * ASPECT));
      const cardH = cardW / ASPECT;
      const gridW = cols * cardW + (cols - 1) * GRID_GAP;
      const gridH = rows * (cardH + CAPTION_H) + (rows - 1) * GRID_GAP;
      const arcW = Math.min(ARC_CARD_W, vw * 0.28);
      const arcH = arcW / ASPECT;
      const curveW = Math.min(CURVE_W, vw * 0.44);
      const curveH = Math.min(CURVE_H, vh * 0.3);
      const depth = Math.min(DEPTH, vw * 0.42);

      const titleIn = smoother(0, 0.2, progress);
      const titleOut = smoother(0.74, 0.94, progress);
      const titleOpacity = titleIn * (1 - titleOut);
      const shift = lerp(28, 0, titleIn);
      const away = vw * 0.7;
      const centerW = Math.min(CENTER_TEXT_W, vw * 0.5);
      const settled = (centerW + TITLE_GAP) / 2;
      const offset = lerp(away, settled, titleIn);
      if (leftRef.current) {
        leftRef.current.style.opacity = String(titleOpacity);
        leftRef.current.style.transform = `translate3d(calc(-100% - ${offset}px), calc(-50% + ${shift}px), 0)`;
      }
      if (rightRef.current) {
        rightRef.current.style.opacity = String(titleOpacity);
        rightRef.current.style.transform = `translate3d(${offset}px, calc(-50% - ${shift}px), 0)`;
      }
      if (centerRef.current) {
        centerRef.current.style.width = `${centerW}px`;
        centerRef.current.style.opacity = String(smoother(0.12, 0.25, progress) * (1 - smoother(0.58, 0.82, progress)));
      }

      const revealAll = smoother(0, 0.17, progress);
      const orbit = smoother(0.05, 0.7, progress);

      for (let i = 0; i < n; i++) {
        const card = cardRefs.current[i];
        const caption = captionRefs.current[i];
        if (!card) continue;
        const reveal = smoother(0.025 + i * 0.01, 0.18 + i * 0.012, progress);
        const flat = smoother(0.56 + i * 0.009, Math.min(0.91 + i * 0.009, 0.99), progress);

        const angle = (i / n) * 360 - 125 + orbit * ROTATION;
        const r = (angle * Math.PI) / 180;
        const arcX = Math.sin(r) * curveW;
        const arcY = Math.cos(r + 0.65) * curveH - vh * 0.025 + OFFSET_Y;
        const arcZ = Math.cos(r) * depth;
        const nd = clamp((arcZ + depth) / Math.max(depth * 2, 1));
        const arcScale = lerp(DEPTH_SCALE, 1, nd);
        const arcOpacity = lerp(DEPTH_OPACITY, 1, nd);
        const arcLeft = arcX - arcW / 2;
        const arcTop = arcY - arcH / 2 + (1 - reveal) * vh * 0.48;

        const col = i % cols;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, n - row * cols);
        const gridLeft = -gridW / 2 + col * (cardW + GRID_GAP) + ((cols - inRow) * (cardW + GRID_GAP)) / 2; // a short last row sits centred
        const gridTop = vh * GRID_Y - vh / 2 - gridH / 2 + row * (cardH + CAPTION_H + GRID_GAP);

        const w = lerp(arcW, cardW, flat);
        const h = lerp(arcH, cardH, flat);
        const x = lerp(arcLeft, gridLeft, flat);
        const y = lerp(arcTop, gridTop, flat);
        const z = lerp(arcZ, 0, flat);
        const rotY = lerp(-Math.sin(r) * 62, 0, flat);
        const rotZ = lerp(-Math.sin(r) * 8, 0, flat);
        const scale = lerp(arcScale, 1, flat);
        const opacity = clamp(lerp(arcOpacity * reveal * revealAll, 1, flat));

        const rw = w * QUALITY;
        const rh = h * QUALITY;
        card.style.width = `${rw}px`;
        card.style.height = `${rh}px`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(flat > 0.86 ? 100 + i : Math.round(100 + nd * 800));
        card.style.transform = `translate3d(${x - (rw - w) / 2}px, ${y - (rh - h) / 2}px, ${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale / QUALITY})`;

        if (caption) {
          const show = smoother(0.93, 1, progress);
          caption.style.width = `${cardW}px`;
          caption.style.opacity = String(show);
          caption.style.visibility = show < 0.02 ? "hidden" : "visible";
          caption.style.transform = `translate3d(${gridLeft}px, ${gridTop + cardH + 10}px, 0)`;
        }
      }
    };

    // Smoothed scroll progress: scroll sets a target, a short rAF loop eases toward it.
    let target = 0;
    let current = 0;
    let raf = 0;
    let last = 0;
    let near = false;

    const frame = (time: number) => {
      raf = 0;
      const dt = clamp((time - (last || time)) / 1000, 0, 0.064);
      last = time;
      const next = current + (target - current) * (1 - Math.exp(-SMOOTHNESS * dt));
      current = Math.abs(target - next) < 1e-4 ? target : next;
      render(current);
      if (current !== target) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const update = () => {
      const b = root.getBoundingClientRect();
      const dist = Math.max(b.height - window.innerHeight, 1);
      target = clamp((window.innerHeight * START_OFFSET - b.top) / dist);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      update();
      render(current);
    };

    measure();
    render(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) {
          window.addEventListener("scroll", update, { passive: true });
          update();
        } else {
          window.removeEventListener("scroll", update);
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(root);
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const titleClass = "font-bold leading-[0.86] tracking-[-0.05em] whitespace-nowrap text-[clamp(56px,8vw,120px)]";

  return (
    <section ref={rootRef} id="projects" aria-labelledby="projects-heading" className="relative w-full" style={{ height: `${SCROLL_VH}vh` }}>
      <h2 id="projects-heading" className="sr-only">
        Featured Projects
      </h2>
      <div
        ref={stageRef}
        className="sticky top-0 h-svh min-h-[600px] w-full overflow-hidden"
        style={{ perspective: PERSPECTIVE, transformStyle: "preserve-3d", isolation: "isolate" }}
      >
        <div
          ref={leftRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[56%] z-0 w-max opacity-0 will-change-transform"
        >
          <div className={cn(titleClass, "text-text")}>FEATURED</div>
        </div>
        <div
          ref={rightRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[39%] z-0 w-max opacity-0 will-change-transform"
        >
          <div className={cn(titleClass, "text-gradient")}>PROJECTS</div>
        </div>
        <p
          ref={centerRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 p-4 text-center text-xs font-medium leading-tight text-muted opacity-0"
        >
          Things I have built, and am still building.
        </p>

        <div className="absolute inset-0 z-10" style={{ transformStyle: "preserve-3d" }}>
          {items.map((p, i) => (
            <div
              key={p.n}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 opacity-0"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden", transformOrigin: "50% 50%" }}
            >
              <div
                className={cn("relative size-full overflow-hidden border border-border bg-gradient-to-br shadow-2xl", p.tone)}
                style={{ borderRadius: 8 * QUALITY, backfaceVisibility: "hidden" }}
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    draggable={false}
                    loading="eager"
                    style={{ objectPosition: p.imagePosition }}
                    className="pointer-events-none block size-full select-none object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center p-6 text-center text-xl font-semibold text-white">{p.title}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-[200]">
          {items.map((p, i) => (
            <div
              key={p.n}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 opacity-0"
              style={{ visibility: "hidden" }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {p.n} &middot; {p.category}
              </p>
              <h3 className="mt-1 text-lg font-bold tracking-tight">{p.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                    {t}
                  </span>
                ))}
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                  >
                    View <ExternalLink size={14} aria-hidden />
                    <span className="sr-only">{p.title} (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
