import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger } from "@/lib/gsap";

const links = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "explore", label: "Other" },
];

/** Scroll-linked: ScrollTrigger calls this on every scroll tick; it reads the live DOM so lazy sections are fine. */
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = ["top", "about", "projects", "skills", "explore", "guestbook", "contact"];
    const compute = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let current = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id === "guestbook" || id === "contact" ? "explore" : id;
      }
      setActive(current);
    };
    compute();
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: compute, onRefresh: compute });
    return () => st.kill();
  }, []);
  return active;
}

export function Nav({ theme, onToggleTheme }: { theme: "dark" | "light"; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  // Slide one indicator under the active link instead of swapping backgrounds.
  useLayoutEffect(() => {
    const move = (animate: boolean) => {
      const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
      const pill = pillRef.current;
      if (!link || !pill) return;
      const props = { x: link.offsetLeft, width: link.offsetWidth, opacity: 1 };
      if (animate && window.matchMedia(NO_REDUCED_MOTION).matches) gsap.to(pill, { ...props, duration: 0.45, ease: "power3.out" });
      else gsap.set(pill, props);
    };
    move(true);
    const onResize = () => move(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav aria-label="Primary" className="mx-auto flex max-w-[1180px] items-center justify-between">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="grid size-11 place-items-center rounded-full border border-border bg-surface/80 text-text backdrop-blur"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <ul
          ref={listRef}
          className="relative hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1.5 backdrop-blur md:flex"
        >
          <span
            ref={pillRef}
            aria-hidden
            className="absolute left-0 top-1.5 bottom-1.5 rounded-full bg-accent2/20 opacity-0"
          />
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                data-id={l.id}
                aria-current={active === l.id ? "true" : undefined}
                className={cn(
                  "relative block rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                  active === l.id ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-semibold backdrop-blur hover:border-accent sm:flex"
          >
            <CalendarDays size={16} aria-hidden />
            Book a call
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full border border-border bg-surface/80 backdrop-blur md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="mx-auto mt-2 max-w-[1180px] rounded-card border border-border bg-surface/95 p-2 backdrop-blur md:hidden"
        >
          {[...links, { id: "contact", label: "Get in touch" }].map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-muted hover:text-text">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
