import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { FanCards } from "@/components/FanCards";
import { PhotoStack } from "@/components/PhotoStack";
import { LocationCard } from "@/components/LocationCard";
import { TechStrip } from "@/components/TechStrip";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { about, craft, location, mindset, person } from "@/content";

const card = "rounded-card border border-border bg-surface/70 backdrop-blur";
// Fixed card widths (369px, and 755px for the wide one); extra page width becomes the gap between cards.
const COL = "md:w-[min(369px,calc((100%_-_2rem)/3))] md:shrink-0";
const SPAN = "md:w-[min(755px,calc((100%_-_2rem)/3*2_+_1rem))] md:shrink-0";

function Heading({ children }: { children: string }) {
  return (
    <>
      <h3 className="text-3xl font-extrabold tracking-tight">{children}</h3>
      <div className="mt-2 h-0.5 w-8 bg-accent2" />
    </>
  );
}

export function About() {
  return (
    <Section id="about" label="About" title="About me">
      <div className="flex flex-col gap-4">
        {/* Row 1: name + fan of cards */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <Reveal className={cn(card, COL, "grid min-h-[200px] place-items-center p-6 text-center")}>
            <div>
              <p className="bg-gradient-to-b from-text to-muted bg-clip-text text-[40px] font-extrabold uppercase leading-[1.05] tracking-tight text-transparent [filter:drop-shadow(0_0_18px_color-mix(in_srgb,var(--text)_25%,transparent))]">
                {person.name}
              </p>
              <div aria-hidden className="mx-auto my-3 h-px w-14 bg-border" />
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">{person.role}</p>
            </div>
          </Reveal>
          <Reveal className={cn(card, SPAN, "overflow-hidden")}>
            <FanCards items={about} />
          </Reveal>
        </div>

        {/* Row 2: mindset | portrait + location | craft */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <Reveal className={cn(card, COL, "flex flex-col p-6")}>
            <Heading>{mindset.heading}</Heading>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">
              <span className="font-semibold text-text">{mindset.text.split(",")[0]},</span>
              {mindset.text.slice(mindset.text.indexOf(",") + 1)}
            </p>
            <PhotoStack items={mindset.stack} />
            <p className="mt-auto pt-5 text-[17px] leading-relaxed text-muted">{mindset.closing}</p>
          </Reveal>

          <div className={cn(COL, "flex flex-col gap-4")}>
            <Reveal className={cn(card, "aspect-square overflow-hidden p-0")}>
              <img
                src="/profile.jpg"
                alt="Portrait of Kervin Sarmiento"
                width={480}
                height={480}
                loading="lazy"
                className="size-full object-cover"
              />
            </Reveal>
            <Reveal className="flex-1">
              <LocationCard {...location} />
            </Reveal>
          </div>

          <Reveal className={cn(card, COL, "flex flex-col overflow-hidden pt-6")}>
            <div className="px-6">
              <Heading>{craft.heading}</Heading>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">
                <span className="font-semibold text-text">{craft.text}</span>
              </p>
              <StatusBadge className="mt-4">{craft.status}</StatusBadge>
            </div>
            <div className="mt-6">
              {craft.strips.map((slugs, i) => (
                <TechStrip key={i} slugs={slugs} reverse={i % 2 === 1} />
              ))}
            </div>
            <p className="mt-auto px-6 pb-6 pt-5 text-[17px] leading-relaxed text-muted">{craft.closing}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
