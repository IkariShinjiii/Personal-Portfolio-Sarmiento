import { lazy, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { About } from "@/sections/About";
import { Education } from "@/sections/Education";
import { Deferred } from "@/components/Deferred";
import { LazyGuestbook } from "@/components/LazyGuestbook";
import { Hero } from "@/sections/Hero";
import { Services } from "@/sections/Services";
import { Button } from "@/components/ui/button";
import { gmailCompose } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { contact, explore, gear } from "@/content";

// Below-the-fold sections load on demand (see Deferred), keeping startup work small.
const Skills = lazy(() => import("@/sections/Skills").then((m) => ({ default: m.Skills })));
const Projects = lazy(() => import("@/sections/Projects").then((m) => ({ default: m.Projects })));
const GitHubActivity = lazy(() => import("@/sections/GitHubActivity").then((m) => ({ default: m.GitHubActivity })));
const Gear = lazy(() => import("@/sections/Gear").then((m) => ({ default: m.Gear })));

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={BRAND_ICONS.instagram.path} />
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

export default function Home() {
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

  return (
    <main id="main">
      <Hero />
      <About />
      <Education />
      <Deferred id="skills" minHeight={900}>
        <Skills />
      </Deferred>

      <Deferred id="projects" minHeight={900}>
        <Projects />
      </Deferred>

      <Deferred id="activity" minHeight={520}>
        <GitHubActivity />
      </Deferred>

      <Services hireHref={`${gmailCompose}&su=${encodeURIComponent("Project inquiry")}`} />

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

      <Section id="contact" label="Contact" title="Let's work together">
        <div className="text-center">
          <p className="mx-auto max-w-xl text-muted">
            Need a website or app, or have a project in mind? I take on freelance work. The best way to reach me is email, <span className="text-text">{contact.email}</span>, or send me a message on Instagram.
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
  );
}
