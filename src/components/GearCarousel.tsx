import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NO_REDUCED_MOTION } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type GearItem = {
  name: string;
  category: string;
  note: string;
  image?: string;
  tag?: string;
  accent: string;
};

const CARD_W = 280;
const CARD_H = 380;
const GAP = 40;
const AUTOPLAY_MS = 4000;

function GearCard({ item, className }: { item: GearItem; className?: string }) {
  return (
    <article
      className={cn("group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-2 hover:scale-[1.02]", className)}
      style={{ ["--gear-accent" as string]: item.accent }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div
            aria-hidden
            className="grid size-full place-items-center"
            style={{ background: `linear-gradient(135deg, ${item.accent}40, ${item.accent}10 60%, transparent)` }}
          >
            <span className="grid size-14 place-items-center rounded-2xl text-2xl" style={{ background: `${item.accent}25`, color: item.accent }}>
              &#10022;
            </span>
          </div>
        )}
        {item.tag && (
          <span className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: `${item.accent}dd` }}>
            {item.tag}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: item.accent }}>
          {item.category}
        </p>
        <h3 className="mt-1 text-lg font-semibold leading-tight">{item.name}</h3>
        <p className="mt-1.5 text-sm text-muted">{item.note}</p>
      </div>
    </article>
  );
}

/**
 * Cylinder of cards that rotates in 3D. Native port of the Framer ServiceCarousel3D component:
 * auto-rotates, arrows and dots navigate, hover or focus pauses. Small screens get a plain list.
 */
export function GearCarousel({ items }: { items: GearItem[] }) {
  const n = items.length;
  const step = 360 / n;
  // Radius at which n cards of this width sit edge to edge with a gap between them.
  const radius = Math.round((CARD_W + GAP) / 2 / Math.tan(Math.PI / n));

  const [rotation, setRotation] = useState(0); // cumulative, so it never spins backwards
  const [paused, setPaused] = useState(false);
  const [canMove, setCanMove] = useState(false);
  const active = ((Math.round(-rotation / step) % n) + n) % n;

  useEffect(() => {
    const mq = window.matchMedia(NO_REDUCED_MOTION);
    const update = () => setCanMove(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || !canMove) return;
    const id = setInterval(() => setRotation((r) => r - step), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, canMove, step]);

  const goTo = (i: number) => {
    let diff = i - active;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    setRotation((r) => r - diff * step);
  };

  return (
    <>
      {/* Small screens: stacked cards, no 3D. */}
      <ul className="mx-auto grid max-w-sm gap-4 md:hidden">
        {items.map((item) => (
          <li key={item.name} className="h-[320px]">
            <GearCard item={item} />
          </li>
        ))}
      </ul>

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="My gear"
        className="relative mx-auto hidden max-w-[1100px] md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="relative overflow-hidden" style={{ height: CARD_H + 80, perspective: 1200 }}>
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: CARD_W,
              height: CARD_H,
              marginLeft: -CARD_W / 2,
              marginTop: -CARD_H / 2,
              transformStyle: "preserve-3d",
              transform: `translateZ(${-radius}px) rotateY(${rotation}deg)`,
              transition: canMove ? "transform 1s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.name}
                aria-hidden={i !== active}
                className="absolute left-0 top-0"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <GearCard item={item} className="shadow-xl" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRotation((r) => r + step)}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 backdrop-blur hover:border-accent"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setRotation((r) => r - step)}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 backdrop-blur hover:border-accent"
        >
          <ChevronRight size={18} />
        </button>

        <div className="mt-2 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${item.name}`}
              aria-current={i === active ? "true" : undefined}
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: i === active ? 24 : 8, background: i === active ? item.accent : "var(--border)" }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
