import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { Mail } from "lucide-react";
import { Backdrop } from "@/components/Backdrop";
import { AuroraBackdrop } from "@/components/AuroraBackdrop";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MobileBar, Sidebar, gmailCompose } from "@/components/Sidebar";
import Home from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { useTheme } from "@/lib/use-theme";
import { watchOffscreen } from "@/lib/pause-offscreen";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger } from "@/lib/gsap";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { contact, person } from "@/content";

// A single work opens on its own page; keep it out of the home page's bundle.
const WorkPage = lazy(() => import("@/pages/WorkPage"));

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={BRAND_ICONS.instagram.path} />
    </svg>
  );
}

/** A new page starts at the top; links with a #section hash are scrolled to by the home page itself. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { theme, toggle } = useTheme();

  // Smooth, eased scrolling for in-page links (native jump when reduced motion is requested).
  useEffect(() => {
    let cancelPrevious: (() => void) | undefined;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      if (!a || !id || !window.matchMedia(NO_REDUCED_MOTION).matches) return;
      if (id !== "top" && !document.getElementById(id)) return;
      e.preventDefault();
      const offsetY = id === "top" ? 0 : 72;
      // Sections below the fold mount as they come near, which changes the page height mid-scroll, and a section
      // replaces its placeholder element when it mounts. So look the target up again on every try: when a scroll
      // ends, wait for the layout to settle, and if the target moved, scroll to it again (a few tries at most).
      // GSAP's own autoKill would also cancel the scroll when the browser adjusts the position because the layout
      // shifted, so it is off: the scroll stops only when the visitor takes over (wheel, touch or keys) or clicks
      // another link.
      cancelPrevious?.();
      let live = true;
      let tween: gsap.core.Tween | undefined;
      let timer: number | undefined;
      const events = ["wheel", "touchstart", "keydown"];
      const stop = () => {
        live = false;
        tween?.kill();
        window.clearTimeout(timer);
        for (const ev of events) window.removeEventListener(ev, stop);
      };
      cancelPrevious = stop;
      for (const ev of events) window.addEventListener(ev, stop, { passive: true });

      const go = (tries: number, duration: number) => {
        const target = id === "top" ? 0 : document.getElementById(id);
        if (!live || target === null) return;
        tween = gsap.to(window, {
          duration,
          ease: "power3.inOut",
          scrollTo: { y: target, offsetY, autoKill: false },
          onComplete: () => {
            timer = window.setTimeout(() => {
              if (!live) return;
              const now = id === "top" ? null : document.getElementById(id);
              const off = now ? now.getBoundingClientRect().top - offsetY : window.scrollY;
              if (tries > 0 && Math.abs(off) > 6) go(tries - 1, 0.5);
              else {
                history.replaceState(null, "", `#${id}`);
                stop();
              }
            }, 750);
          },
        });
      };
      // Mount the lazy sections now and give them a moment, so the first scroll already aims at the final position.
      window.dispatchEvent(new Event("sections:load"));
      timer = window.setTimeout(() => go(5, 0.9), 450);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelPrevious?.();
    };
  }, []);

  useEffect(() => watchOffscreen(), []);

  // Late layout changes (fonts, lazy sections, images) move trigger positions; re-measure.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Backdrop />
      <AuroraBackdrop />
      <ScrollToTop />
      <Sidebar theme={theme} onToggleTheme={toggle} />
      <MobileBar theme={theme} onToggleTheme={toggle} />

      <div className="md:pl-[272px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/multimedia/:slug"
            element={
              <Suspense fallback={<div className="min-h-[70svh]" aria-hidden />}>
                <WorkPage />
              </Suspense>
            }
          />
          <Route path="/multimedia" element={<Navigate to={{ pathname: "/", hash: "#multimedia" }} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="flex items-center justify-between px-5 py-8 text-sm text-muted md:px-10">
          <p>
            <span className="font-bold text-text">{person.initials}</span> &nbsp;&bull;&nbsp; &copy; {new Date().getFullYear()} {person.name}
          </p>
          <div className="flex items-center gap-6">
            <a href="https://cdgsolutions.dev/team" target="_blank" rel="noreferrer" className="-my-3 py-3 hover:text-text">
              Developer at CDG<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={contact.github} aria-label="GitHub" className="-m-3 p-3 hover:text-text">
              <GithubIcon />
            </a>
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram (opens in a new tab)" className="-m-3 p-3 hover:text-text">
              <InstagramIcon />
            </a>
            <a href={gmailCompose} target="_blank" rel="noreferrer" aria-label="Email (opens in a new tab)" className="-m-3 p-3 hover:text-text">
              <Mail size={20} />
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
