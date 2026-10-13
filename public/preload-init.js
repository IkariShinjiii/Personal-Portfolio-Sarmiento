// Decides, before first paint, whether the intro screen plays: once per browser session, and never when the
// visitor prefers reduced motion. The overlay is hidden in CSS unless <html> gets the "preloading" class.
(function () {
  var skip = false;
  try {
    skip = sessionStorage.getItem("preloaded") === "1";
  } catch (e) {}
  if (!skip && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.classList.add("preloading");
})();
