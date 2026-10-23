import { useEffect, useRef } from "react";
import { FIELD_SRC, FINISH_SRC, VERT_SRC } from "@/lib/aurora-shaders";

/**
 * Hero background: the AuroraFlow shader (a WebGL2 field of glowing light ribbons that bends around the
 * pointer). It is fixed behind the page and fades out as you scroll, with a soft mask at its lower edge, so
 * the dot grid underneath takes over without a visible seam. It draws nothing once faded out, when the tab is
 * hidden, or when WebGL2 is missing; reduced motion gets a single still frame.
 */

const FADE_AT = 0.85; // fraction of the viewport height scrolled before the aurora has fully gone
const MAX_DPR = 1.5;
const START_DELAY = 1500; // ms after the load event
const TOUCH_FRAME_MS = 33; // phones draw at about 30fps

type Rgb = [number, number, number];

function toRgb(css: string, fallback: Rgb): Rgb {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, frag: string) {
  const make = (type: number, source: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = make(gl.VERTEX_SHADER, VERT_SRC);
  const fs = make(gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

export function AuroraBackdrop() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const init = (): (() => void) | undefined => {
    const root = wrap.current;
    const cv = canvas.current;
    if (!root || !cv) return;
    const gl = cv.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false });
    if (!gl) return;

    const field = compile(gl, FIELD_SRC);
    const finish = compile(gl, FINISH_SRC);
    if (!field || !finish) return;
    const loc = (p: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
    const uf = loc(field, ["uRes", "uTime", "uC1", "uC2", "uSize", "uAngle", "uMouse", "uOn", "uReach", "uVel"]);
    const un = loc(finish, ["uField", "uRes", "uTime", "uBg", "uPaper"]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // The field renders into a smaller half-float texture, then the finish pass scales it up with dithering.
    const fbo = gl.createFramebuffer();
    let tex: WebGLTexture | null = null;
    let tw = 0;
    let th = 0;
    let half = !!gl.getExtension("EXT_color_buffer_float");
    const resizeTarget = (w: number, h: number) => {
      if (w === tw && h === th && tex) return;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (tex) gl.deleteTexture(tex);
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (ok || !half) break;
        half = false;
      }
      tw = w;
      th = h;
    };

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const style = getComputedStyle(document.documentElement);
    let bg: Rgb = [0.05, 0.05, 0.06];
    let c1: Rgb = [0.3, 0.9, 0.7];
    let c2: Rgb = [0.6, 0.5, 1];
    const readTheme = () => {
      bg = toRgb(style.getPropertyValue("--bg"), bg);
      c1 = toRgb(style.getPropertyValue("--aurora-1"), c1);
      c2 = toRgb(style.getPropertyValue("--aurora-2"), c2);
      dirty = true;
    };

    let cw = innerWidth;
    let ch = innerHeight;
    let dirty = true;
    let fade = 1;
    let clock = 0;
    let last = -1;
    let raf = 0;
    let lost = false;
    // Pointer: smoothed position, velocity and presence, as in the original component.
    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let vx = 0;
    let vy = 0;
    let on = 0;
    let inside = false;

    const applyFade = () => {
      const f = Math.min(1, Math.max(0, 1 - scrollY / (innerHeight * FADE_AT)));
      fade = f * f * (3 - 2 * f); // smoothstep, so it starts and ends gently
      root.style.opacity = fade.toFixed(3);
      root.style.visibility = fade < 0.005 ? "hidden" : "visible";
    };
    const onScroll = () => {
      applyFade();
      dirty = true;
    };
    const onResize = () => {
      cw = innerWidth;
      ch = innerHeight;
      applyFade();
      dirty = true;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      inside = true;
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) inside = false;
    };

    const draw = (dt: number) => {
      const still = reduceMq.matches;
      if (!still) clock = (clock + dt) % 3600;
      const dpr = Math.min(devicePixelRatio || 1, coarse ? 1 : MAX_DPR);
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      if (cv.width !== bw || cv.height !== bh) {
        cv.width = bw;
        cv.height = bh;
      }
      // Lower internal resolution on phones: the field is soft, so the saving is free.
      resizeTarget(Math.max(1, Math.round(bw * (coarse ? 0.4 : 0.5))), Math.max(1, Math.round(bh * (coarse ? 0.4 : 0.5))));

      const present = inside && !still ? 1 : 0;
      if (present && on < 0.02) {
        mx = tx;
        my = ty;
      }
      on += (present - on) * (1 - Math.exp(-dt * 5));
      const k = 1 - Math.exp(-dt * 16);
      const nx = mx + (tx - mx) * k;
      const ny = my + (ty - my) * k;
      if (dt > 0) {
        const kv = 1 - Math.exp(-dt * 8);
        vx += ((nx - mx) / dt - vx) * kv;
        vy += ((ny - my) / dt - vy) * kv;
      }
      mx = nx;
      my = ny;
      const vLen = Math.hypot(vx, vy) / ch;
      const vCap = vLen > 3 ? 3 / vLen : 1;
      const lum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, tw, th);
      gl.useProgram(field);
      gl.uniform2f(uf.uRes, tw, th);
      gl.uniform1f(uf.uTime, clock);
      gl.uniform3f(uf.uC1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uf.uC2, c2[0], c2[1], c2[2]);
      gl.uniform1f(uf.uSize, 1);
      gl.uniform1f(uf.uAngle, -Math.PI);
      gl.uniform2f(uf.uMouse, (mx - cw / 2) / ch, (ch / 2 - my) / ch);
      gl.uniform1f(uf.uOn, on);
      gl.uniform1f(uf.uReach, 240 / ch);
      gl.uniform2f(uf.uVel, (vx / ch) * vCap, (-vy / ch) * vCap);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.viewport(0, 0, bw, bh);
      gl.useProgram(finish);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(un.uField, 0);
      gl.uniform2f(un.uRes, bw, bh);
      gl.uniform1f(un.uTime, clock);
      gl.uniform3f(un.uBg, bg[0], bg[1], bg[2]);
      gl.uniform1f(un.uPaper, Math.min(1, Math.max(0, (lum - 0.35) / 0.3)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (lost || fade < 0.005 || document.hidden) {
        last = -1;
        return;
      }
      if (coarse && last >= 0 && now - last < TOUCH_FRAME_MS - 2) return;
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      // Reduced motion: only redraw when something changed (scroll, resize, theme).
      if (reduceMq.matches && on < 0.01) {
        if (!dirty) return;
        dirty = false;
      }
      draw(dt);
    };

    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => window.location.reload(); // programs and textures are gone; the simplest safe rebuild

    readTheme();
    applyFade();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    cv.addEventListener("webglcontextlost", onLost);
    cv.addEventListener("webglcontextrestored", onRestored);
    cv.dataset.ready = "true";
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      cv.removeEventListener("webglcontextlost", onLost);
      cv.removeEventListener("webglcontextrestored", onRestored);
      if (tex) gl.deleteTexture(tex);
      gl.deleteFramebuffer(fbo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(field);
      gl.deleteProgram(finish);
    };
  };

  // Start only after the page has loaded and gone quiet, so the shader never competes with first paint.
  useEffect(() => {
    let stop: (() => void) | undefined;
    let timer = 0;
    const begin = () => {
      timer = window.setTimeout(() => {
        stop = init();
      }, START_DELAY);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      window.removeEventListener("load", begin);
      window.clearTimeout(timer);
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrap} aria-hidden className="aurora">
      <canvas ref={canvas} className="aurora-canvas" />
    </div>
  );
}
