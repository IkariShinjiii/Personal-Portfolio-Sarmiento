import { useEffect, useRef, useState } from "react";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";

type Item = { label: string; image: string; position: string };

const INTERVAL = 2800;

/** Three cards in a row: the middle one sharp with its label, the sides blurred behind it. Cycles on its own. */
export function PhotoStack({ items }: { items: Item[] }) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const onScreen = useRef(false);
  const n = items.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: NO_REDUCED_MOTION }, (ctx) => {
        const animate = ctx.conditions?.motion;
        const w = root.current?.clientWidth ?? 300;
        cards.current.forEach((el, i) => {
          if (!el) return;
          const d = (i - active + n) % n; // 0 centre, 1 right, n-1 left
          const side = d === 0 ? 0 : d === 1 ? 1 : -1;
          const props = {
            x: side * w * 0.27,
            scale: d === 0 ? 1 : 0.82,
            opacity: d === 0 ? 1 : 0.55,
            filter: d === 0 ? "blur(0px)" : "blur(3px)",
            zIndex: d === 0 ? 3 : 1,
          };
          if (animate) gsap.to(el, { ...props, duration: 1, ease: "power3.inOut", overwrite: "auto", force3D: true });
          else gsap.set(el, props);
        });
      });
      return () => mm.revert();
    },
    { dependencies: [active], scope: root },
  );

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia(NO_REDUCED_MOTION).matches) return;
    const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const id = window.setInterval(() => onScreen.current && setActive((a) => (a + 1) % n), INTERVAL);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [n]);

  const roblox = BRAND_ICONS.roblox;

  return (
    <div ref={root} className="relative mx-auto mt-4 h-[196px] w-full max-w-[290px]" role="group" aria-label="Projects I am working on">
      {items.map((it, i) => (
        <div
          key={it.label}
          ref={(el) => {
            cards.current[i] = el;
          }}
          aria-hidden={i !== active}
          style={{ willChange: "transform, filter, opacity" }}
          className="absolute left-1/2 top-0 h-full w-[58%] -translate-x-1/2 overflow-hidden rounded-2xl border border-accent2/50 bg-surface"
        >
          {it.image ? (
            <img src={it.image} alt="" loading="lazy" style={{ objectPosition: it.position }} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center bg-gradient-to-br from-amber-600 to-orange-900">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" aria-hidden="true">
                <path d={roblox.path} />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-10">
            <p className="text-[13px] font-bold uppercase leading-tight tracking-wide text-white">{it.label}</p>
          </div>
        </div>
      ))}
      <p className="sr-only" aria-live="polite">
        {items[active].label}
      </p>
    </div>
  );
}
