import { Link } from "react-router";
import { ArrowRight, Clapperboard, Film, Image as ImageIcon, LayoutGrid, type LucideIcon } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Label } from "@/components/ui/label";
import { course, hasMedia, works, type Work, type WorkType } from "@/multimedia";

const TYPE_ICON: Record<WorkType, LucideIcon> = {
  Infographic: ImageIcon,
  Storyboard: LayoutGrid,
  Video: Film,
  Animation: Clapperboard,
  Project: Film,
  Activity: Film,
};

/** The first real image a work has, if any (video poster, first storyboard frame or the poster itself). */
export function workCover(w: Work): { src: string; alt: string } | null {
  for (const m of w.media) {
    if (m.kind === "video" && m.poster) return { src: m.poster, alt: "" };
    if (m.kind === "frames" && m.frames[0]) return m.frames[0];
    if (m.kind === "image") return m;
  }
  return null;
}

export function TypeTag({ type }: { type: WorkType }) {
  return <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{type}</span>;
}

function WorkCard({ w }: { w: Work }) {
  const cover = workCover(w);
  const Icon = TYPE_ICON[w.type];
  return (
    <Link
      to={`/multimedia/${w.slug}`}
      className="group block h-full overflow-hidden rounded-card border border-border bg-surface/70 transition-colors duration-200 hover:border-accent2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden border-b border-border bg-gradient-to-br from-accent/10 via-surface to-accent2/15">
        {cover ? (
          <img src={cover.src} alt={cover.alt} loading="lazy" width={640} height={400} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <Icon aria-hidden size={36} strokeWidth={1.5} className="text-accent2/70" />
        )}
        {!hasMedia(w) && <span className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted backdrop-blur">Files coming soon</span>}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <TypeTag type={w.type} />
          <span className="font-mono text-[11px] text-muted">{w.module}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold">{w.title}</h3>
        <p className="mt-1 text-sm text-muted">{w.summary}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          View work <ArrowRight size={14} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

export function Multimedia() {
  return (
    <Section id="multimedia" label={`${course.code} · ${course.school}`} title="Multimedia Systems">
      <div className="mx-auto max-w-[1040px]">
        <Reveal>
          <p className="mx-auto max-w-3xl text-center text-lg text-muted">{course.intro}</p>
        </Reveal>

        <Reveal className="mt-12">
          <Label>What I learned</Label>
          <p className="mt-3 max-w-3xl text-text/90">{course.learned}</p>
        </Reveal>

        <Reveal className="mt-12">
          <Label>Concepts practiced</Label>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {course.concepts.map((c) => (
              <li key={c.title} className="grid gap-1 py-4 md:grid-cols-[240px_1fr] md:gap-6">
                <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em]">{c.title}</p>
                <p className="text-muted">{c.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-14">
          <Label>Works &amp; activities</Label>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {works.map((w) => (
              <li key={w.slug}>
                <Reveal className="h-full">
                  <WorkCard w={w} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
