import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

// index.html ships the top of the hero as static markup. Mount React only after the browser has painted that
// markup and reported it as the largest contentful paint: React replaces those elements, and an element removed
// before it is reported never counts, so the later React copy would become the LCP and wait on all the JavaScript.
// A hidden tab never paints, and the timeout covers a browser that reports nothing, so the app always mounts.
function whenFirstPainted(go: () => void) {
  let done = false;
  const once = () => {
    if (!done) {
      done = true;
      go();
    }
  };
  if (document.hidden || !("PerformanceObserver" in window)) return once();
  try {
    new PerformanceObserver((list, obs) => {
      if (list.getEntries().length === 0) return;
      obs.disconnect();
      setTimeout(once, 0);
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    return once();
  }
  setTimeout(once, 1500);
}
whenFirstPainted(mount);

// The font stylesheet loads without blocking render (media="print"); switch it on once it has arrived.
// Done here instead of an inline onload so the Content-Security-Policy can forbid inline scripts.
const fonts = document.querySelector<HTMLLinkElement>("link[data-fonts]");
if (fonts) {
  const on = () => (fonts.media = "all");
  if (fonts.sheet) on();
  else fonts.addEventListener("load", on, { once: true });
}
