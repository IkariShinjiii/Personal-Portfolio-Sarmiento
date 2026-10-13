import { useSyncExternalStore } from "react";
import { ExternalLink } from "lucide-react";
import { OrbitProjects } from "@/components/OrbitProjects";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { projects } from "@/content";

// The scroll-driven orbit needs room and motion; tablets, phones and reduced-motion visitors get the plain grid.
const ORBIT_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(ORBIT_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function Projects() {
  const orbit = useSyncExternalStore(subscribe, () => window.matchMedia(ORBIT_QUERY).matches, () => false);
  return orbit ? <OrbitProjects items={projects} /> : <ProjectsGrid />;
}

function ProjectsGrid() {
  return (
    <Section id="projects" label="Work" title="Featured Projects">
      <ol className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <li key={p.n} className="flex">
            <Reveal className="flex w-full flex-col">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
                <span>{p.n}</span>
                <span aria-hidden className="h-px w-8 bg-border" />
                <Label>{p.category}</Label>
              </div>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">{p.title}</h3>
              <div className={cn("mt-4 flex flex-1 flex-col rounded-[28px] border border-border bg-gradient-to-br p-6 text-white", p.tone)}>
                <p className="mb-6 text-lg font-medium">{p.summary}</p>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    width={1568}
                    height={688}
                    loading="lazy"
                    style={{ objectPosition: p.imagePosition }}
                    className="mt-auto aspect-[2.3/1] w-full rounded-xl border border-white/25 object-cover"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`${p.title} screenshot placeholder`}
                    className="mt-auto overflow-hidden rounded-xl border border-white/25 bg-black/30"
                  >
                    <div className="flex gap-1.5 px-3 py-2" aria-hidden>
                      <span className="size-2.5 rounded-full bg-white/50" />
                      <span className="size-2.5 rounded-full bg-white/50" />
                      <span className="size-2.5 rounded-full bg-white/50" />
                    </div>
                    <div className="grid aspect-[2.3/1] place-items-center text-sm text-white/90">Screenshot coming soon</div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                    {t}
                  </span>
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
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
