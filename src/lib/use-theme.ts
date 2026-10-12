import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light";

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => {
    const next = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    // Crossfade the whole page instead of snapping between themes (not when reduced motion is requested).
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (vt && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) vt.call(document, () => flushSync(next));
    else next();
  };

  return { theme, toggle };
}
