import { useEffect, useRef } from "react";

/**
 * Fixed background: a faint dot grid that lights up around the cursor, plus a glow that
 * eases toward the pointer. Static on touch devices and when reduced motion is requested.
 */
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.25;
    let x = tx;
    let y = ty;
    let raf = 0;

    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.setProperty("--mx", `${x.toFixed(1)}px`);
      el.style.setProperty("--my", `${y.toFixed(1)}px`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.live = "true";
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      el.dataset.live = "false";
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
      <div className="backdrop-glow" />
      <div className="backdrop-dots backdrop-dots-faint" />
      <div className="backdrop-dots backdrop-dots-lit" />
    </div>
  );
}
