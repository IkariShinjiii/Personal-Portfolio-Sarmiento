// Runs before first paint (loaded from <head>) so the page never flashes the wrong theme.
// Mirrors initialTheme() in src/lib/use-theme.ts.
(function () {
  var t = null;
  try {
    t = localStorage.getItem("theme");
  } catch (e) {}
  if (t !== "dark" && t !== "light") t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  if (t === "dark") document.documentElement.classList.add("dark");
})();
