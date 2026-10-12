import { useEffect, useRef } from "react";

type Props = { items: string[] };

/**
 * Interactive tag-cloud sphere drawn on a 2D canvas. Drag to spin; it drifts on its own
 * unless reduced motion is requested. The skills are also listed for screen readers.
 */
export function SkillsSphere({ items }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = items.length;
    // Even spread of points on a sphere (Fibonacci lattice).
    const pts = items.map((label, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      return { label, x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
    });

    let size = 0;
    let angleY = 0.4;
    let angleX = -0.2;
    let vy = reduce ? 0 : 0.004;
    let vx = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const w = canvas.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = w;
      canvas.width = w * dpr;
      canvas.height = w * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const cs = getComputedStyle(document.documentElement);
      const text = cs.getPropertyValue("--text").trim();
      const accent = cs.getPropertyValue("--accent").trim();
      const accent2 = cs.getPropertyValue("--accent2").trim();
      const border = cs.getPropertyValue("--border").trim();
      const R = size * 0.28;
      const c = size / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, R * 1.08, 0, Math.PI * 2);
      ctx.stroke();

      const cy = Math.cos(angleY);
      const sy = Math.sin(angleY);
      const cx = Math.cos(angleX);
      const sx = Math.sin(angleX);
      const proj = pts
        .map((p) => {
          const x1 = p.x * cy + p.z * sy;
          const z1 = -p.x * sy + p.z * cy;
          const y2 = p.y * cx - z1 * sx;
          const z2 = p.y * sx + z1 * cx;
          return { label: p.label, x: x1, y: y2, z: z2 };
        })
        .sort((a, b) => a.z - b.z);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of proj) {
        const depth = (p.z + 1) / 2; // 0 far, 1 near
        ctx.globalAlpha = 0.35 + depth * 0.65;
        ctx.font = `600 ${Math.round(size * (0.032 + depth * 0.026))}px Inter, sans-serif`;
        ctx.fillStyle = depth > 0.7 ? accent : depth > 0.4 ? text : accent2;
        ctx.fillText(p.label, c + p.x * R, c + p.y * R);
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (!dragging) {
        angleY += vy;
        angleX += vx;
        vx *= 0.95;
        if (!reduce) vy += ((0.004 - vy) * 0.03);
      }
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      angleY += dx * 0.008;
      angleX = Math.max(-1.2, Math.min(1.2, angleX + dy * 0.008));
      vy = dx * 0.008;
      vx = dy * 0.004;
      if (reduce) draw();
    };
    const onUp = () => {
      dragging = false;
    };

    resize();
    draw();
    if (!reduce) raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [items]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="mx-auto block aspect-square w-full max-w-[460px] cursor-grab touch-pan-y active:cursor-grabbing"
      />
      <ul className="sr-only">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </>
  );
}
