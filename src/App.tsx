import { lazy, useEffect, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Backdrop } from "@/components/Backdrop";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Nav } from "@/components/Nav";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { About } from "@/sections/About";
import { Deferred } from "@/components/Deferred";
import { LazyGuestbook } from "@/components/LazyGuestbook";
import { Hero } from "@/sections/Hero";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";
import { watchOffscreen } from "@/lib/pause-offscreen";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { contact, explore, gear, person } from "@/content";

// Below-the-fold sections load on demand (see Deferred), keeping startup work small.
const Skills = lazy(() => import("@/sections/Skills").then((m) => ({ default: m.Skills })));
const Projects = lazy(() => import("@/sections/Projects").then((m) => ({ default: m.Projects })));
const GitHubActivity = lazy(() => import("@/sections/GitHubActivity").then((m) => ({ default: m.GitHubActivity })));
const Gear = lazy(() => import("@/sections/Gear").then((m) => ({ default: m.Gear })));

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

// A mailto: link does nothing on a desktop without a mail app, so open Gmail compose instead.
const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`;

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; the address is visible on the page */
    }
  };
  return (
    <Button variant="outline" onClick={copy} aria-live="polite">
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy email"}
    </Button>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();

  // Smooth, eased scrolling for in-page links (native jump when reduced motion is requested).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      if (!a || !id || !window.matchMedia(NO_REDUCED_MOTION).matches) return;
      const target = id === "top" ? 0 : document.getElementById(id);
      if (target === null) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 0.9,
        ease: "power3.inOut",
        scrollTo: { y: target, offsetY: id === "top" ? 0 : 72, autoKill: true },
        onComplete: () => history.replaceState(null, "", `#${id}`),
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => watchOffscreen(), []);

  // The page renders on the client, so the browser's own jump to /#section finds nothing. Do it once the
  // sections have mounted, and stop the moment the visitor scrolls on their own.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || id === "top") return;
    let live = true;
    const stop = () => (live = false);
    const go = () => live && document.getElementById(id)?.scrollIntoView();
    const timers = [200, 900, 1800].map((ms) => window.setTimeout(go, ms));
    for (const ev of ["wheel", "touchstart", "keydown"]) window.addEventListener(ev, stop, { once: true, passive: true });
    return () => {
      stop();
      timers.forEach(clearTimeout);
      for (const ev of ["wheel", "touchstart", "keydown"]) window.removeEventListener(ev, stop);
    };
  }, []);

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
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Backdrop />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero />
        <About />
        <Deferred id="skills" minHeight={900}>
          <Skills />
        </Deferred>

        <Deferred id="projects" minHeight={900}>
          <Projects />
        </Deferred>

        <Deferred id="activity" minHeight={520}>
          <GitHubActivity />
        </Deferred>

        {gear.length > 0 && (
          <Deferred id="gear" minHeight={640}>
            <Gear />
          </Deferred>
        )}

        <Section id="explore" label="More" title="More to explore">
          <ul className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-3">
            {explore.map((e) => (
              <li key={e.title}>
                <Reveal>
                  <a
                    href={e.href || undefined}
                    target={e.newTab ? "_blank" : undefined}
                    rel={e.newTab ? "noreferrer" : undefined}
                    aria-disabled={!e.href}
                    className="block rounded-card border border-border bg-surface/70 p-6 transition-colors duration-200 hover:border-accent2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <p className="text-xl font-semibold">{e.title}</p>
                    <p className="mt-1 text-muted">{e.text}</p>
                    <p className={cn("mt-6 text-sm font-semibold", e.tone)}>Explore &rarr;</p>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        <LazyGuestbook />

        <Section id="contact" label="Contact" title="Get in touch">
          <div className="text-center">
            <p className="mx-auto max-w-xl text-muted">
              The best way to reach me is email, <span className="text-text">{contact.email}</span>, or send me a message on Instagram.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href={gmailCompose} target="_blank" rel="noreferrer">
                  Email me
                </a>
              </Button>
              <CopyEmail />
              <Button asChild variant="outline">
                <a href={contact.instagram} target="_blank" rel="noreferrer">
                  <InstagramIcon size={16} />
                  Instagram
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={contact.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <footer className="mx-auto flex max-w-[1760px] items-center justify-between px-5 min-[1280px]:px-[clamp(1.25rem,3vw,3.5rem)] py-8 text-sm text-muted">
        <p>
          <span className="font-bold text-text">{person.initials}</span> &nbsp;&bull;&nbsp; &copy; {new Date().getFullYear()}{" "}
          {person.name}
        </p>
        <div className="flex gap-4">
          <a href={contact.github} aria-label="GitHub" className="hover:text-text">
            <GithubIcon />
          </a>
          <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram (opens in a new tab)" className="hover:text-text">
            <InstagramIcon />
          </a>
          <a href={gmailCompose} target="_blank" rel="noreferrer" aria-label="Email (opens in a new tab)" className="hover:text-text">
            <Mail size={20} />
          </a>
        </div>
      </footer>
    </>
  );
}
