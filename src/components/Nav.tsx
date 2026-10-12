import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#explore", label: "Explore" },
];

export function Nav({ theme, onToggleTheme }: { theme: "dark" | "light"; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1040px] items-center justify-between px-5">
        <a href="#top" className="font-bold tracking-tight">KS</a>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-muted transition-colors hover:text-text">{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full border border-border text-muted hover:text-text"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Button asChild className="hidden sm:inline-flex">
            <a href="#contact">Get in touch</a>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full border border-border md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="border-t border-border px-5 py-3 md:hidden">
          {[...links, { href: "#contact", label: "Get in touch" }].map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-muted hover:text-text">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
