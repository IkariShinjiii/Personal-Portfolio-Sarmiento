import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router";
import { Briefcase, ChevronRight, ExternalLink, FileText, Keyboard, LayoutGrid, Mail, Menu, Moon, Sun, X, type LucideIcon } from "lucide-react";
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
          "group flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-200",
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

const OTHER_ICON: Record<string, LucideIcon> = { services: Briefcase, gear: Keyboard, explore: LayoutGrid, contact: Mail };

/**
 * One button for everything that is not in the main index. Hover (or click, or Enter) opens a small menu beside
 * the sidebar: the other sections, then Resume, GitHub and Instagram. It is rendered in a portal because the
 * sidebar itself is a scroll container with a blurred backdrop, which would clip or re-anchor a floating menu.
 */
function OtherMenu({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const inOther = otherSections.some((s) => s.id === active);

  const show = () => {
    window.clearTimeout(timer.current);
    const r = btn.current?.getBoundingClientRect();
    if (r) setTop(Math.max(12, Math.min(r.top, window.innerHeight - 380)));
    setOpen(true);
  };
  // A short delay lets the pointer cross the gap between the button and the menu without it closing.
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 140);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text hover:bg-accent2/15 focus-visible:bg-accent2/15";
  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={btn}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="other-menu"
        onClick={(e) => {
          if (open && e.detail !== 0) return setOpen(false);
          show();
          // Opened from the keyboard: move into the menu so it can be used without a mouse.
          if (e.detail === 0) window.setTimeout(() => menu.current?.querySelector<HTMLElement>("a")?.focus(), 0);
        }}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-200",
          inOther ? "text-text" : "text-muted hover:text-text",
        )}
      >
        <span aria-hidden className={cn("w-5 shrink-0 text-center text-xs", inOther ? "text-accent" : "text-muted/70")}>
          ···
        </span>
        <span className={cn("flex-1 text-left", inOther && "-mx-1.5 rounded bg-accent2/20 px-1.5 py-0.5")}>Other</span>
        <ChevronRight size={14} aria-hidden className={cn("transition-transform duration-200", open && "translate-x-0.5")} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menu}
            id="other-menu"
            onMouseEnter={show}
            onMouseLeave={hide}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                btn.current?.focus();
              }
            }}
            style={{ top }}
            className="menu-in fixed left-[264px] z-50 w-64 pl-3"
          >
            <ul className="rounded-card border border-border bg-surface p-2 shadow-2xl">
              {otherSections.map((s) => {
                const Icon = OTHER_ICON[s.id] ?? LayoutGrid;
                return (
                  <li key={s.id}>
                    <SectionLink id={s.id} onClick={() => setOpen(false)} current={active === s.id} className={item}>
                      <Icon size={16} aria-hidden className="shrink-0 text-accent" />
                      {s.label}
                    </SectionLink>
                  </li>
                );
              })}
              <li role="separator" className="my-1 border-t border-border" />
              {external.map((e) => (
                <li key={e.label}>
                  <a href={e.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className={item}>
                    <e.icon size={16} aria-hidden className="shrink-0 text-accent" />
                    {e.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
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
      className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col justify-between overflow-y-auto panel-scroll border-r border-border bg-bg/70 px-6 py-7 backdrop-blur md:flex"
    >
      <div>
        <Link to="/" className="block">
          <p className="text-lg font-bold tracking-tight">{person.name}</p>
          <p className="mt-0.5 text-sm text-muted">{person.role}</p>
        </Link>

        <nav aria-label="Sections" className="mt-7 border-t border-border pt-5">
          <ul className="flex flex-col gap-0.5">
            {mainSections.map((s) => (
              <IndexItem key={s.id} s={s} active={active} />
            ))}
          </ul>
          <div className="mt-0.5">
            <OtherMenu active={active} />
          </div>
        </nav>
      </div>

      <div className="mt-8 space-y-4 border-t border-border pt-5">
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
        <a href="https://cdgsolutions.dev/team" target="_blank" rel="noreferrer" className="block text-center text-xs text-muted hover:text-text">
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
      <div className="flex h-11 items-center justify-between rounded-full border border-border bg-surface/80 pl-5 pr-1.5 backdrop-blur">
        <Link to="/" className="text-sm font-bold tracking-tight">
          {person.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full text-text"
          >
            <ThemeIcon size={17} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full text-text"
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

/** Right rail (wide screens): what the section you are reading is about, plus back to top. */
export function RightRail() {
  const { pathname } = useLocation();
  const active = useActiveSection(pathname === "/");
  const current = allSections.find((s) => s.id === active);
  return (
    <aside aria-hidden={!current?.rail} className="fixed inset-y-0 right-0 z-30 hidden w-[232px] flex-col justify-between border-l border-border px-6 py-7 2xl:flex">
      <div className="space-y-5">
        {pathname === "/" && current?.rail?.map((r) => (
          <div key={r.label}>
            <p className="text-xs font-semibold text-muted">{r.label}</p>
            <p className="mt-1 text-sm font-medium">{r.value}</p>
          </div>
        ))}
      </div>
      <a href="#top" className="text-sm font-medium text-muted hover:text-text">
        &uarr; Back to top
      </a>
    </aside>
  );
}
