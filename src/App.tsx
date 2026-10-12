import { useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Section } from "@/components/Section";
import { FlipCard } from "@/components/FlipCard";
import { Reveal } from "@/components/Reveal";
import { ChatPanel } from "@/components/ChatPanel";
import { Hero } from "@/sections/Hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTheme } from "@/lib/use-theme";
import { about, build, contact, explore, projects, skills } from "@/content";

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
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const askRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero
          askRef={askRef}
          onAsk={(q) => {
            setQuestion(q);
            setChatOpen(true);
          }}
        />

        <Section id="about" label="About" title="About me">
          <div className="grid gap-4 md:grid-cols-3">
            {about.map((c) => (
              <Reveal key={c.title}>
                <FlipCard {...c} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <Label>What I build</Label>
            <p className="mt-3 max-w-2xl text-xl">{build.statement}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {build.chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
              <StatusBadge>{build.status}</StatusBadge>
            </div>
          </Reveal>
        </Section>

        <Section id="projects" label="Work" title="Projects">
          <ol className="flex flex-col gap-4">
            {projects.map((p) => (
              <li key={p.n}>
                <Reveal>
                  <Card className="grid gap-4 md:grid-cols-[64px_1fr]">
                    <span className="text-3xl font-bold text-accent">{p.n}</span>
                    <div>
                      <Label>{p.category}</Label>
                      <h3 className="mt-1 text-xl font-semibold">{p.title}</h3>
                      <p className="mt-2 text-muted">{p.summary}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {p.tags.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                        {p.href && (
                          <a
                            href={p.href}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                          >
                            View <ExternalLink size={14} aria-hidden />
                            <span className="sr-only">{p.title} (opens in a new tab)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="skills" label="Stack" title="Skills">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {skills.map((s) => (
              <li key={s.name}>
                <Reveal>
                  <Card className="p-5">
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-1 text-sm text-muted">{s.level}</p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="explore" label="More" title="More to explore">
          <ul className="grid gap-4 md:grid-cols-3">
            {explore.map((e) => (
              <li key={e.title}>
                <Reveal>
                  <a
                    href={e.href || undefined}
                    aria-disabled={!e.href}
                    className="block rounded-card border border-border bg-surface p-6 transition-colors duration-200 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <p className="font-semibold">{e.title}</p>
                    <p className="mt-1 text-muted">{e.text}</p>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contact" label="Contact" title="Get in touch">
          <p className="max-w-xl text-muted">
            The best way to reach me is email: <span className="text-text">{contact.email}</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
        </Section>
      </main>
      <ChatPanel
        open={chatOpen}
        initialQuestion={question}
        returnFocus={askRef}
        onClose={() => {
          setChatOpen(false);
          setQuestion("");
        }}
      />
      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} Kervin Sarmiento &middot;{" "}
        <a href={contact.github} className="hover:text-text">
          GitHub
        </a>{" "}
        &middot;{" "}
        <a href={`mailto:${contact.email}`} className="hover:text-text">
          Email
        </a>
      </footer>
    </>
  );
}
