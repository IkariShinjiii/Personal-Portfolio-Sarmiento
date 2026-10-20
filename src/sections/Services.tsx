import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { services } from "@/content";

/** What I can build for clients, with one clear next step. */
export function Services({ hireHref }: { hireHref: string }) {
  return (
    <Section id="services" label="Freelance" title="Work with me">
      <ul className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-3">
        {services.map((s) => (
          <li key={s.title}>
            <Reveal className="h-full">
              <div className="h-full rounded-card border border-border bg-surface/70 p-6">
                <p className="text-xl font-semibold">{s.title}</p>
                <p className="mt-2 text-muted">{s.text}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-10 max-w-xl text-center">
        <p className="text-muted">Tell me what you need and I will reply with a plan and a quote. I build in small steps and show you progress along the way.</p>
        <Button asChild className="mt-6">
          <a href={hireHref} target="_blank" rel="noreferrer">
            Start a project
          </a>
        </Button>
      </div>
    </Section>
  );
}
