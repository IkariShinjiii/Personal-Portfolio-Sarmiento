import { useEffect, useRef, useState } from "react";
import { gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Item = { title: string; text: string };

const INTERVAL = 3400;

/**
 * Three overlapping cards. One at a time lifts, tilts and glows; it cycles on its own while on
 * screen, and hover, focus or tap picks one. Reduced motion: no cycling, selection is instant.
 */
export function FanCards({ items }: { items: Item[] }) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(1);
  const hovering = useRef(false);
  const onScreen = useRef(false);

  // Move the cards whenever the active one changes.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: NO_REDUCED_MOTION }, (ctx) => {
        const animate = ctx.conditions?.motion;
        cards.current.forEach((el, i) => {
          if (!el) return;
          const on = i === active;
          const props = { y: on ? -20 : 0, rotate: on ? (i % 2 ? 2.4 : -2.4) : 0, scale: on ? 1.02 : 1, zIndex: on ? 5 : i === 1 ? 3 : 2 };
          if (animate) gsap.to(el, { ...props, duration: 0.9, ease: "power3.inOut", overwrite: "auto", force3D: true });
          else gsap.set(el, props);
        });
      });
      return () => mm.revert();
    },
    { dependencies: [active], scope: root },
  );

  // Autoplay: only while visible, not under the pointer, and not with reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia(NO_REDUCED_MOTION).matches) return;
    const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const id = window.setInterval(() => {
      if (onScreen.current && !hovering.current) setActive((a) => (a + 1) % items.length);
    }, INTERVAL);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [items.length]);

  return (
    <div
      ref={root}
      className="relative h-[144px] overflow-hidden"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <p className="pointer-events-none absolute inset-x-0 top-2 z-10 mx-auto w-fit rounded-full border border-accent2/30 bg-bg/60 px-3 py-1 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-accent2">
        Hover to read more
      </p>
      {items.map((it, i) => {
        const on = i === active;
        return (
          <button
            key={it.title}
            ref={(el) => {
              cards.current[i] = el;
            }}
            type="button"
            aria-pressed={on}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            style={{ left: `${i * 31}%`, willChange: "transform" }}
            className={cn(
              "absolute top-[46px] flex h-[160px] w-[38%] flex-col justify-start rounded-xl border p-3 text-left transition-[border-color,box-shadow,background-color,color] duration-500",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              on
                ? "border-accent2/70 bg-surface shadow-[0_0_44px_-6px_color-mix(in_srgb,var(--accent2)_55%,transparent)]"
                : "border-border bg-surface text-muted",
            )}
          >
            <span className={cn("block text-center text-[13px] font-bold uppercase tracking-wide", on ? "text-text" : "text-text/80")}>{it.title}</span>
            <span className={cn("mt-1.5 block text-center text-[12px] leading-snug transition-colors duration-500", on ? "text-text/90" : "text-muted/80")}>
              {it.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
