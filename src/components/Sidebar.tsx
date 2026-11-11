import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ExternalLink, FileText, Mail, Menu, Moon, Sun, X } from "lucide-react";
import { ScrollTrigger } from "@/lib/gsap";
import { allSections, mainSections, otherSections, type SectionEntry } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { contact, person } from "@/content";

// A mailto: link does nothing on a desktop without a mail app, so open Gmail compose instead.
export const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`;

/**
 * Scroll-linked highlight. Section positions are measured once (and again whenever ScrollTrigger refreshes,
 * e.g. after fonts, images or lazy sections change the layout), so a scroll tick does no layout reads.
 */
export function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState("top");
  useEffect(() => {
    if (!enabled) return;
    let tops: [string, number][] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = allSections.flatMap(({ id }) => {
        const el = document.getElementById(id);
        return el ? [[id, el.getBoundingClientRect().top + y] as [string, number]] : [];
      });
      tops.sort((a, b) => a[1] - b[1]);
    };
    const compute = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let current = "top";
      for (const [id, top] of tops) if (top <= y) current = id;
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
  }, [enabled]);
  // Off the home page no section is "current", so nothing in the index is highlighted.
  return enabled ? active : "";
}

/** A link to a section of the home page: a plain in-page anchor on the home page, a router link elsewhere. */
function SectionLink({ id, onClick, className, children, current }: { id: string; onClick?: () => void; className?: string; children: React.ReactNode; current?: boolean }) {
  const { pathname } = useLocation();
  const aria = current ? ({ "aria-current": "true" } as const) : {};
  if (pathname === "/") {
    return (
      <a href={`#${id}`} onClick={onClick} className={className} {...aria}>
        {children}
      </a>
    );
  }
  return (
    <Link to={{ pathname: "/", hash: id === "top" ? "" : `#${id}` }} onClick={onClick} className={className} {...aria}>
      {children}
    </Link>
  );
}

function IloiloClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" }).format(now);
  return (
    <p className="text-xs text-muted">
      Iloilo <span className="font-semibold text-text">{time}</span> PHT
    </p>
  );
}

const external = [
  { label: "GitHub", href: contact.github, icon: ExternalLink },
  { label: "Instagram", href: contact.instagram, icon: ExternalLink },
  { label: "Resume", href: "/Kervin_Sarmiento_Resume.pdf", icon: FileText },
];

function IndexItem({ s, active, onClick }: { s: SectionEntry; active: string; onClick?: () => void }) {
  const on = active === s.id;
  return (
    <li>
      <SectionLink
        id={s.id}
        onClick={onClick}
        current={on}
        className={cn(
          "group flex items-center gap-3 rounded-md px-2 py-1 text-sm font-medium transition-colors duration-200",
          on ? "text-text" : "text-muted hover:text-text",
        )}
      >
        <span aria-hidden className={cn("w-5 shrink-0 text-xs tabular-nums", on ? "text-accent" : "text-muted/70")}>
          {s.num || "·"}
        </span>
        <span className={cn(on && "rounded bg-accent2/20 px-1.5 py-0.5 -mx-1.5")}>{s.label}</span>
      </SectionLink>
    </li>
  );
}

type Props = { theme: "dark" | "light"; onToggleTheme: () => void };

/** Fixed left sidebar (tablet and wider) with the numbered section index. */
export function Sidebar({ theme, onToggleTheme }: Props) {
  const { pathname } = useLocation();
  const active = useActiveSection(pathname === "/");
  const ThemeIcon = theme === "dark" ? Moon : Sun;
  return (
    <aside
      aria-label="Site navigation"
      className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col justify-between overflow-y-auto panel-scroll border-r border-border bg-bg/70 px-6 py-7 backdrop-blur md:flex [@media(max-height:760px)]:py-4"
    >
      <div>
        <Link to="/" className="block">
          <p className="text-lg font-bold tracking-tight">{person.name}</p>
          <p className="mt-0.5 text-sm text-muted">{person.role}</p>
        </Link>

        <ul className="mt-4 flex flex-col gap-0 border-b border-border pb-3 [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:pb-2">
          {external.map((e) => (
            <li key={e.label}>
              <a
                href={e.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
              >
                <e.icon size={14} aria-hidden className="w-5 shrink-0" />
                {e.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <nav aria-label="Sections" className="mt-3">
          <ul className="flex flex-col gap-0.5">
            {allSections.map((s) => (
              <IndexItem key={s.id} s={s} active={active} />
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-3 space-y-3 border-t border-border pt-4 [@media(max-height:700px)]:space-y-2 [@media(max-height:700px)]:pt-3">
        <div className="flex items-center justify-between">
          <IloiloClock />
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface/80 text-text"
          >
            <ThemeIcon size={16} />
          </button>
        </div>
        <a
          href={gmailCompose}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2.5 text-sm font-semibold hover:border-accent"
        >
          <Mail size={15} aria-hidden />
          Email me<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href="https://cdgsolutions.dev/team" target="_blank" rel="noreferrer" className="block text-center text-xs text-muted hover:text-text [@media(max-height:740px)]:hidden">
          Building at Cascade Development Group<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </aside>
  );
}

/** Slim top bar on phones: name, theme toggle and a menu with the same index. */
export function MobileBar({ theme, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = useActiveSection(pathname === "/");
  const ThemeIcon = theme === "dark" ? Moon : Sun;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 md:hidden">
      <div className="flex h-12 items-center justify-between rounded-full border border-border bg-surface/80 pl-5 pr-0.5 backdrop-blur">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm font-bold tracking-tight">
          {person.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-11 place-items-center rounded-full text-text"
          >
            <ThemeIcon size={17} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full text-text"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="menu-in mt-2 max-h-[calc(100svh-5rem)] overflow-y-auto panel-scroll rounded-card border border-border bg-surface/95 p-2 backdrop-blur">
          <ul>
            {mainSections.map((s) => (
              <IndexItemMobile key={s.id} s={s} active={active} onClick={() => setOpen(false)} />
            ))}
          </ul>
          <p className="px-4 pb-1 pt-3 text-xs font-semibold text-muted">Other</p>
          <ul>
            {otherSections.map((s) => (
              <IndexItemMobile key={s.id} s={s} active={active} onClick={() => setOpen(false)} />
            ))}
            {external.map((e) => (
              <li key={e.label}>
                <a href={e.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-muted hover:text-text">
                  {e.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

function IndexItemMobile({ s, active, onClick }: { s: SectionEntry; active: string; onClick: () => void }) {
  return (
    <li>
      <SectionLink id={s.id} onClick={onClick} current={active === s.id} className={cn("block rounded-xl px-4 py-3", active === s.id ? "bg-accent2/15 text-text" : "text-muted hover:text-text")}>
        {s.label}
      </SectionLink>
    </li>
  );
}

