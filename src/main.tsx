import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// The font stylesheet loads without blocking render (media="print"); switch it on once it has arrived.
// Done here instead of an inline onload so the Content-Security-Policy can forbid inline scripts.
const fonts = document.querySelector<HTMLLinkElement>("link[data-fonts]");
if (fonts) {
  const on = () => (fonts.media = "all");
  if (fonts.sheet) on();
  else fonts.addEventListener("load", on, { once: true });
}
