import { useState } from "react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Chip } from "@/components/ui/chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { about, craft, mindset, person } from "@/content";

/** Three panels; the hovered, focused or tapped one expands. */
function HoverPanels() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex h-full min-h-48 flex-col gap-2 md:flex-row">
      {about.map((a, i) => {
        const on = open === i;
        return (
          <button
            key={a.title}
            type="button"
            aria-expanded={on}
            onClick={() => setOpen(on ? null : i)}
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
            className={cn(
              "rounded-xl border border-border bg-bg/60 p-4 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              on ? "border-accent md:flex-[2]" : "md:flex-1",
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{a.title}</span>
            <span className={cn("mt-2 block text-sm text-muted", on ? "block" : "hidden md:line-clamp-4")}>{a.text}</span>
          </button>
        );
      })}
    </div>
  );
}

const card = "rounded-card border border-border bg-surface/70 p-6 backdrop-blur";
// Fixed card widths (369px, and 755px for the wide one); extra page width becomes the gap between cards.
export const COL = "md:w-[min(369px,calc((100%_-_2rem)/3))] md:shrink-0";
const SPAN = "md:w-[min(755px,calc((100%_-_2rem)/3*2_+_1rem))] md:shrink-0";

export function About() {
  return (
    <Section id="about" label="About" title="About me">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <Reveal className={cn(card, COL, "grid place-items-center text-center")}>
          <p className="text-3xl font-extrabold uppercase leading-tight tracking-tight">{person.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">{person.role}</p>
        </Reveal>

        <Reveal className={cn(card, SPAN)}>
          <p className="mb-3 text-center text-[11px] uppercase tracking-[0.25em] text-accent2">Hover to read more</p>
          <HoverPanels />
        </Reveal>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:justify-between">

        <Reveal className={cn(card, COL)}>
          <h3 className="text-2xl font-bold">{mindset.heading}</h3>
          <div className="mt-2 h-0.5 w-8 bg-accent2" />
          <p className="mt-4 text-muted">{mindset.text.replace(/\*\*/g, "")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mindset.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </Reveal>

        <Reveal className={cn(card, COL, "grid min-h-64 place-items-center overflow-hidden p-0")}>
          <img
            src="/profile.jpg"
            alt="Portrait of Kervin Sarmiento"
            width={480}
            height={480}
            loading="lazy"
            className="size-full object-cover"
          />
        </Reveal>

        <Reveal className={cn(card, COL, "flex flex-col overflow-hidden")}>
          <h3 className="text-2xl font-bold">{craft.heading}</h3>
          <div className="mt-2 h-0.5 w-8 bg-accent2" />
          <p className="mt-4 text-muted">{craft.text}</p>
          <StatusBadge className="mt-4 self-start">{craft.status}</StatusBadge>
          <div className="relative mt-auto overflow-hidden pt-6 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
            <ul className="marquee flex w-max gap-3" aria-label="Tech stack">
              {[...craft.stack, ...craft.stack].map((t, i) => (
                <li key={i} aria-hidden={i >= craft.stack.length}>
                  <Chip className="font-mono text-xs uppercase tracking-wider">{t}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        </div>
      </div>
    </Section>
  );
}
