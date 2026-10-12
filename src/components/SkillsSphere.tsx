import { useEffect, useRef } from "react";
import { BRAND_ICONS } from "@/lib/brand-icons";

type Item = { slug: string; name: string };

const lum = (hex: string) => {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Interactive globe: a wireframe sphere with brand logos on its surface. Logos fade with depth,
 * the ones facing you show their name, and you can drag to spin. Drifts on its own unless
 * reduced motion is requested. The skills are also listed for screen readers.
 */
export function SkillsSphere({ items }: { items: Item[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = items.length;
    const pts = items.map((it, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      const icon = BRAND_ICONS[it.slug];
      return { name: it.name, hex: `#${icon.hex}`, path: new Path2D(icon.path), x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
    });

    let size = 0;
    let angleY = 0.6;
    let angleX = -0.28;
    let targetY = angleY;
    let targetX = angleX;
    const IDLE = reduce ? 0 : 0.21; // rad/s auto-spin
    let vy = IDLE; // rad/s, used for inertia after release
    let vx = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let hover = -1;
    const amt = pts.map(() => 0); // eased hover amount per logo, 0..1
    let raf = 0;
    let visible = true;
    let prev = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rot = (x: number, y: number, z: number) => {
      const cy = Math.cos(angleY);
      const sy = Math.sin(angleY);
      const cx = Math.cos(angleX);
      const sx = Math.sin(angleX);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      return { x: x1, y: y * cx - z1 * sx, z: y * sx + z1 * cx };
    };

    // Theme colours are read once and again only when the theme class changes, not on every frame.
    let text = "";
    let muted = "";
    let accent2 = "";
    let bg = "";
    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      text = cs.getPropertyValue("--text").trim();
      muted = cs.getPropertyValue("--muted").trim();
      accent2 = cs.getPropertyValue("--accent2").trim();
      bg = cs.getPropertyValue("--bg").trim();
    };
    readColours();
    const themeObserver = new MutationObserver(() => {
      readColours();
      if (reduce) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const draw = () => {
      const R = size * 0.34;
      const c = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Soft body so the globe reads as a sphere, not just lines.
      const body = ctx.createRadialGradient(c - R * 0.3, c - R * 0.35, R * 0.1, c, c, R);
      body.addColorStop(0, `${accent2}22`);
      body.addColorStop(1, `${accent2}05`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();

      // Wireframe: latitude rings and meridians, brighter on the near side. Segments are bucketed by
      // depth and stroked in three batches instead of one stroke per segment.
      ctx.lineWidth = 1;
      ctx.strokeStyle = accent2;
      const buckets = [new Path2D(), new Path2D(), new Path2D()];
      const ALPHA = [0.08, 0.17, 0.3];
      const seg = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => {
        const depth = (a.z + b.z) / 2;
        const path = buckets[depth < -0.25 ? 0 : depth < 0.35 ? 1 : 2];
        path.moveTo(c + a.x * R, c + a.y * R);
        path.lineTo(c + b.x * R, c + b.y * R);
      };
      const STEPS = 40;
      for (const lat of [-60, -30, 0, 30, 60]) {
        const la = (lat * Math.PI) / 180;
        const rr = Math.cos(la);
        const yy = Math.sin(la);
        let prev = rot(rr, yy, 0);
        for (let i = 1; i <= STEPS; i++) {
          const t = (i / STEPS) * Math.PI * 2;
          const next = rot(Math.cos(t) * rr, yy, Math.sin(t) * rr);
          seg(prev, next);
          prev = next;
        }
      }
      for (let m = 0; m < 8; m++) {
        const lo = (m / 8) * Math.PI;
        let prev = rot(0, -1, 0);
        for (let i = 1; i <= STEPS; i++) {
          const t = -Math.PI / 2 + (i / STEPS) * Math.PI * 2;
          const next = rot(Math.cos(lo) * Math.cos(t), Math.sin(t), Math.sin(lo) * Math.cos(t));
          seg(prev, next);
          prev = next;
        }
      }
      buckets.forEach((path, i) => {
        ctx.globalAlpha = ALPHA[i];
        ctx.stroke(path);
      });

      // Logos, far to near.
      const proj = pts.map((p, i) => ({ i, p, ...rot(p.x, p.y, p.z) })).sort((a, b) => a.z - b.z);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const q of proj) {
        const depth = (q.z + 1) / 2; // 0 far, 1 near
        const h = amt[q.i];
        const px = c + q.x * R * 1.12;
        const py = c + q.y * R * 1.12;
        const s = size * (0.04 + depth * 0.04) * (1 + 0.25 * h);
        // Near-black or near-white brand colours vanish on one theme: fall back to the text colour.
        const fill = contrast(q.p.hex, bg) < 2.2 ? text : q.p.hex;
        ctx.globalAlpha = Math.min(1, 0.1 + depth ** 1.6 * 0.95 + 0.4 * h);
        ctx.fillStyle = fill;
        ctx.save();
        ctx.translate(px - s / 2, py - s / 2);
        ctx.scale(s / 24, s / 24);
        ctx.fill(q.p.path);
        ctx.restore();
        const near = Math.min(1, Math.max(0, (depth - 0.82) / 0.12));
        if (near > 0 || h > 0.01) {
          ctx.globalAlpha = Math.max(near, h);
          ctx.fillStyle = muted;
          ctx.font = `700 ${Math.max(10, Math.round(size * 0.02))}px "JetBrains Mono", ui-monospace, monospace`;
          ctx.fillText(q.p.name.toUpperCase(), px, py + s / 2 + 6);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (prev || now)) / 1000); // seconds, clamped for tab switches
      prev = now;
      if (dragging) {
        // Chase the pointer with an ease instead of snapping to it.
        const k = 1 - Math.exp(-dt * 22);
        angleY += (targetY - angleY) * k;
        angleX += (targetX - angleX) * k;
      } else {
        angleY += vy * dt;
        angleX += vx * dt;
        angleX = Math.max(-1.2, Math.min(1.2, angleX));
        // Inertia fades out, then settles into the slow idle spin.
        vx *= Math.exp(-dt * 3.2);
        vy += (IDLE - vy) * (1 - Math.exp(-dt * 1.6));
      }
      // Hover emphasis eases in and out.
      const he = 1 - Math.exp(-dt * 12);
      for (let i = 0; i < amt.length; i++) amt[i] += ((i === hover ? 1 : 0) - amt[i]) * he;
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const nearest = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const R = size * 0.34;
      const c = size / 2;
      let best = -1;
      let bestD = size * 0.05;
      pts.forEach((p, i) => {
        const q = rot(p.x, p.y, p.z);
        if (q.z < -0.1) return; // only the near half is hoverable
        const d = Math.hypot(c + q.x * R * 1.12 - mx, c + q.y * R * 1.12 - my);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      targetY = angleY;
      targetX = angleX;
      vy = 0;
      vx = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const now = performance.now();
        const dt = Math.max(0.001, (now - lastT) / 1000);
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        lastT = now;
        // Dragging right turns the front of the globe right; dragging down turns it down.
        targetY += dx * 0.009;
        targetX = Math.max(-1.2, Math.min(1.2, targetX - dy * 0.009));
        // Smoothed release velocity (rad/s).
        const m = 0.35;
        vy += ((dx * 0.009) / dt - vy) * m;
        vx += ((-dy * 0.009) / dt - vx) * m;
      } else {
        hover = nearest(e);
      }
      if (reduce) {
        angleY = targetY;
        angleX = targetX;
        draw();
      }
    };
    const onUp = () => {
      dragging = false;
      vy = Math.max(-6, Math.min(6, vy));
      vx = Math.max(-6, Math.min(6, vx));
    };
    const onLeave = () => {
      hover = -1;
      if (reduce) {
        amt.fill(0);
        draw();
      }
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
      if (visible && !reduce && !raf) {
        prev = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(canvas);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [items]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="mx-auto block aspect-square w-full max-w-[640px] cursor-grab touch-pan-y active:cursor-grabbing"
      />
      <ul className="sr-only">
        {items.map((i) => (
          <li key={i.slug}>{i.name}</li>
        ))}
      </ul>
    </>
  );
}
