import { useEffect, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { About } from "@/sections/About";
import { SkillMarquee } from "@/components/SkillMarquee";
import { SkillsSphere } from "@/components/SkillsSphere";
import { LazyGuestbook } from "@/components/LazyGuestbook";
import { GitHubActivity } from "@/sections/GitHubActivity";
import { Hero } from "@/sections/Hero";
import { Projects } from "@/sections/Projects";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";
import { gsap, NO_REDUCED_MOTION, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { contact, explore, person, skillRowAbove, skillRowBelow, sphereIcons } from "@/content";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

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
      <Backdrop />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero />
        <About />
        <Projects />

        <Section id="skills" label="Tech stack" title="My Skills">
          <div>
            <SkillMarquee items={skillRowAbove} direction={-1} speed={45} label="Front-end and tooling skills" />
            <div className="my-6">
              <SkillsSphere items={sphereIcons} />
              <p className="mt-2 text-center text-sm text-muted">Drag to spin</p>
            </div>
            <SkillMarquee items={skillRowBelow} direction={1} speed={38} label="Back-end, platforms and games skills" />
          </div>
        </Section>

        <GitHubActivity />

        <Section id="explore" label="More" title="More to explore">
          <ul className="flex flex-col gap-4 md:flex-row md:justify-between">
            {explore.map((e) => (
              <li key={e.title} className="md:w-[min(369px,calc((100%_-_2rem)/3))]">
                <Reveal>
                  <a
                    href={e.href || undefined}
                    aria-disabled={!e.href}
                    className="block rounded-card border border-border bg-surface/70 p-6 backdrop-blur transition-colors duration-200 hover:border-accent2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
              The best way to reach me is email: <span className="text-text">{contact.email}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href={`mailto:${contact.email}`}>Email me</a>
              </Button>
              <CopyEmail />
              <Button asChild variant="outline">
                <a href={contact.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <footer className="mx-auto flex max-w-[2400px] items-center justify-between px-5 min-[1280px]:px-[clamp(1.25rem,3vw,3.5rem)] py-8 text-sm text-muted">
        <p>
          <span className="font-bold text-text">{person.initials}</span> &nbsp;&bull;&nbsp; &copy; {new Date().getFullYear()}{" "}
          {person.name}
        </p>
        <div className="flex gap-4">
          <a href={contact.github} aria-label="GitHub" className="hover:text-text">
            <GithubIcon />
          </a>
          <a href={`mailto:${contact.email}`} aria-label="Email" className="hover:text-text">
            <Mail size={20} />
          </a>
        </div>
      </footer>
    </>
  );
}
