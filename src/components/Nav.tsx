import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Briefcase, ChevronDown, ExternalLink, FileText, Mail, Menu, MessageSquare, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger } from "@/lib/gsap";
import { contact } from "@/content";

const links = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "explore", label: "Other" },
];

// What the "Other" menu opens: the parts of the page that sit after Projects.
const otherMenu = [
  { label: "Work with me", hint: "Websites, web apps, desktop apps", href: "#services", icon: Briefcase },
  { label: "Resume", hint: "Download my CV (PDF)", href: "/Kervin_Sarmiento_Resume.pdf", icon: FileText, external: true },
  { label: "Guestbook", hint: "Leave your mark", href: "#guestbook", icon: MessageSquare },
  { label: "Contact", hint: "Say hello", href: "#contact", icon: Mail },
  { label: "GitHub", hint: "IkariShinjiii", href: contact.github, icon: ExternalLink, external: true },
  { label: "Instagram", hint: "@__oddyseus__", href: contact.instagram, icon: ExternalLink, external: true },
];

/**
 * Scroll-linked highlight. Section positions are measured once (and again whenever ScrollTrigger
 * refreshes, e.g. after fonts, images or lazy sections change the layout), so a scroll tick does
 * no layout reads at all.
 */
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = ["top", "about", "education", "skills", "projects", "activity", "gear", "services", "explore", "guestbook", "contact"];
    let tops: [string, number][] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = ids.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [[id, el.getBoundingClientRect().top + y] as [string, number]] : [];
      });
    };
    const compute = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let current = "top";
      for (const [id, top] of tops) {
        if (top <= y) current = id === "guestbook" || id === "contact" ? "explore" : id === "activity" || id === "gear" ? "projects" : id === "services" ? "explore" : id === "education" ? "about" : id;
      }
      setActive(current);
    };
    measure();
    compute();
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: compute,
      onRefresh: () => {
        measure();
        compute();
      },
    });
    return () => st.kill();
  }, []);
  return active;
}

export function Nav({ theme, onToggleTheme }: { theme: "dark" | "light"; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false);
  const [other, setOther] = useState(false);
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
    <header className="sticky top-0 z-40 px-4 min-[1280px]:px-[clamp(1rem,3vw,3.5rem)] pt-4">
      <nav aria-label="Primary" className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="grid size-11 place-items-center justify-self-start rounded-full border border-border bg-surface/80 text-text backdrop-blur"
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
            <li
              key={l.id}
              onMouseEnter={l.id === "explore" ? () => setOther(true) : undefined}
              onMouseLeave={l.id === "explore" ? () => setOther(false) : undefined}
              onFocus={l.id === "explore" ? () => setOther(true) : undefined}
              onBlur={l.id === "explore" ? (e) => !e.currentTarget.contains(e.relatedTarget) && setOther(false) : undefined}
              onKeyDown={l.id === "explore" ? (e) => e.key === "Escape" && setOther(false) : undefined}
            >
              <a
                href={`#${l.id}`}
                data-id={l.id}
                aria-current={active === l.id ? "true" : undefined}
                aria-haspopup={l.id === "explore" ? "true" : undefined}
                aria-expanded={l.id === "explore" ? other : undefined}
                className={cn(
                  "relative flex items-center gap-1 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                  active === l.id ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {l.label}
                {l.id === "explore" && (
                  <ChevronDown size={14} aria-hidden className={cn("transition-transform duration-200", other && "rotate-180")} />
                )}
              </a>
              {l.id === "explore" && (
                <div
                  className={cn(
                    "absolute right-0 top-full z-50 w-72 pt-3 transition duration-150",
                    other ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                  )}
                >
                  <ul className="rounded-card border border-border bg-surface p-2 shadow-2xl">
                    {otherMenu.map((m) => (
                      <li key={m.label}>
                        <a
                          href={m.href}
                          onClick={() => setOther(false)}
                          {...(m.external ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-text hover:bg-accent2/15 focus-visible:bg-accent2/15"
                        >
                          <m.icon size={16} aria-hidden className="shrink-0 text-accent" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">
                              {m.label}
                              {m.external && <span className="sr-only"> (opens in a new tab)</span>}
                            </span>
                            <span className="block truncate text-xs text-muted">{m.hint}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-semibold backdrop-blur hover:border-accent sm:flex"
          >
            <Mail size={16} aria-hidden />
            Get in touch
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
          className="menu-in mx-auto mt-2 max-w-[1760px] rounded-card border border-border bg-surface/95 p-2 backdrop-blur md:hidden"
        >
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-muted hover:text-text">
                {l.label}
              </a>
              {l.id === "explore" && (
                <ul className="mb-1 ml-4 border-l border-border pl-2">
                  {otherMenu.map((m) => (
                    <li key={m.label}>
                      <a
                        href={m.href}
                        onClick={() => setOpen(false)}
                        {...(m.external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="block rounded-xl px-3 py-2 text-sm text-muted hover:text-text"
                      >
                        {m.label}
                        {m.external && <span className="sr-only"> (opens in a new tab)</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
