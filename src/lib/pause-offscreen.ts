/** Marks sections that are far off screen so their CSS colour animations pause and cost nothing. */
export function watchOffscreen() {
  if (!("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("offscreen", !e.isIntersecting)),
    { rootMargin: "200px" },
  );
  document.querySelectorAll("main > section, footer").forEach((el) => io.observe(el));
  return () => io.disconnect();
}
