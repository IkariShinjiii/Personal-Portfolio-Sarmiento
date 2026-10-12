import { useEffect, useRef } from "react";

/**
 * Fixed background: a faint dot grid that lights up around the cursor, plus a glow that eases toward
 * the pointer. Only two small layers move, and they move with transforms, so a pointer move never
 * repaints the full screen. Static on touch devices and when reduced motion is requested.
 */
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const lit = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const g = glow.current;
    const l = lit.current;
    if (!root || !g || !l) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const GLOW = 1040; // px, matches the CSS size
    const LIT = 560;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.25;
    let x = tx;
    let y = ty;
    let raf = 0;
    let last = 0;

    const place = () => {
      g.style.transform = `translate3d(${(x - GLOW / 2).toFixed(1)}px, ${(y - GLOW / 2).toFixed(1)}px, 0)`;
      l.style.transform = `translate3d(${(x - LIT / 2).toFixed(1)}px, ${(y - LIT / 2).toFixed(1)}px, 0)`;
      // Keep the lit dots registered to the page-wide grid (28px) while the layer moves.
      l.style.backgroundPosition = `${(-(x - LIT / 2)).toFixed(1)}px ${(-(y - LIT / 2)).toFixed(1)}px`;
    };
    place();
    if (reduce || !fine) return;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * 9); // time-based ease, same feel at any frame rate
      x += (tx - x) * k;
      y += (ty - y) * k;
      place();
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.4 ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      root.dataset.live = "true";
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      root.dataset.live = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="backdrop">
      <div ref={glow} className="backdrop-glow" />
      <div className="backdrop-dots backdrop-dots-faint" />
      <div ref={lit} className="backdrop-lit" />
    </div>
  );
}
