import { useRef } from "react";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SKILL_COLORS, type SkillKind } from "@/content";
import { cn } from "@/lib/utils";

type Item = { name: string; kind: SkillKind };
type Props = {
  items: Item[];
  /** -1 scrolls left, 1 scrolls right. */
  direction?: 1 | -1;
  /** Pixels per second. */
  speed?: number;
  label: string;
};

function Group({ items, hidden }: { items: Item[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className={cn("flex shrink-0 gap-3 pr-3", hidden && "motion-reduce:hidden")}>
      {items.map((it) => (
        <li
          key={it.name}
          data-pill
          style={{ ["--c" as string]: SKILL_COLORS[it.kind] }}
          className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-surface/80 px-5 py-3 font-mono text-[15px] text-text transition-[background-color,color,transform,border-color] duration-300 data-[active=true]:scale-110 data-[active=true]:border-transparent data-[active=true]:bg-[var(--c)] data-[active=true]:text-[#0c0d10]"
        >
          <span aria-hidden className="size-2 rounded-full bg-[var(--c)] transition-colors duration-300 group-data-[active=true]:bg-[#0c0d10]" />
          {it.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Auto-scrolling row of skill pills. The pill nearest the centre lights up in its category colour.
 * With reduced motion it becomes a static, wrapped list.
 */
export function SkillMarquee({ items, direction = -1, speed = 45, label }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        const el = track.current;
        const wrap = root.current;
        if (!el || !wrap) return;
        const half = () => el.scrollWidth / 2;
        const tween = gsap.fromTo(
          el,
          { x: () => (direction < 0 ? 0 : -half()) },
          { x: () => (direction < 0 ? -half() : 0), duration: () => half() / speed, ease: "none", repeat: -1, invalidateOnRefresh: true },
        );

        // Only animate while on screen; slow down (not stop) under the pointer.
        const st = ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onToggle: (self) => tween.paused(!self.isActive) });
        const slow = () => gsap.to(tween, { timeScale: 0.2, duration: 0.4 });
        const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.4 });
        wrap.addEventListener("pointerenter", slow);
        wrap.addEventListener("pointerleave", resume);

        // Highlight the pill nearest the centre. Pill centres are measured once; each tick is arithmetic on
        // the track's current x, so the loop never forces layout. Throttled to about 15 checks a second.
        const pills = Array.from(wrap.querySelectorAll<HTMLElement>("[data-pill]"));
        let centres: number[] = [];
        let width = 0;
        const measure = () => {
          width = wrap.clientWidth;
          centres = pills.map((p) => p.offsetLeft + p.offsetWidth / 2);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(wrap);
        let current = -1;
        let lastCheck = 0;
        const tick = (time: number) => {
          if (time - lastCheck < 0.066) return;
          lastCheck = time;
          const x = gsap.getProperty(el, "x") as number;
          const mid = width / 2;
          let best = 0;
          let bestD = Infinity;
          for (let i = 0; i < centres.length; i++) {
            const d = Math.abs(centres[i] + x - mid);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best !== current) {
            if (current >= 0) pills[current].removeAttribute("data-active");
            pills[best].setAttribute("data-active", "true");
            current = best;
          }
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          ro.disconnect();
          wrap.removeEventListener("pointerenter", slow);
          wrap.removeEventListener("pointerleave", resume);
          st.kill();
          tween.kill();
          if (current >= 0) pills[current].removeAttribute("data-active");
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div ref={track} className="flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-6">
        <Group items={items} />
        <Group items={items} hidden />
      </div>
    </div>
  );
}
