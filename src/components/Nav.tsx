import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "explore", label: "Other" },
];

function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = [...links.map((l) => l.id), "contact"];
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id === "contact" ? "explore" : id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

export function Nav({ theme, onToggleTheme }: { theme: "dark" | "light"; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

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

        <ul className="hidden items-center gap-1 rounded-full border border-border bg-surface/80 p-1.5 backdrop-blur md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className={cn(
                  "block rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                  active === l.id ? "bg-accent2/20 text-text" : "text-muted hover:text-text",
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
            className="hidden rounded-full border border-border bg-surface/80 px-5 py-3 text-sm font-semibold backdrop-blur hover:border-accent sm:block"
          >
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
