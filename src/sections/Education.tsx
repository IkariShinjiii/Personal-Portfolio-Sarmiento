import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { education } from "@/content";

/** School mark: the real logo when there is one, otherwise the school's initials. */
function Mark({ logo, school }: { logo: string; school: string }) {
  if (logo) return <img src={logo} alt="" width={32} height={32} loading="lazy" className="size-8 shrink-0 rounded-md bg-white object-contain p-0.5" />;
  const initials = school
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join("");
  return (
    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-bg/60 font-mono text-[11px] font-bold text-muted">
      {initials}
    </span>
  );
}

export function Education() {
  return (
    <Section id="education" label="Education" title="Where I studied">
      <ol className="mx-auto flex max-w-[760px] flex-col gap-4">
        {education.map((e) => (
          <li key={e.title}>
            <Reveal className="rounded-card border border-border bg-surface/70 px-5 pt-5 md:px-7">
              <div className="flex items-start gap-3">
                <Mark logo={e.logo} school={e.school} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold leading-snug md:text-xl">{e.title}</h3>
                  {e.years && <p className="mt-1 text-right font-mono text-[11px] uppercase tracking-wider text-muted md:text-xs">{e.years}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-x-6 gap-y-1 border-t border-border py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[15px]">
                  {e.school}
                  {e.detail && ` · ${e.detail}`}
                </p>
                {e.place && <p className="font-mono text-xs text-muted">{e.place}</p>}
              </div>
              {e.focus && (
                <div className="border-t border-border py-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Focus</p>
                  <p className="mt-1.5 text-[15px] leading-snug">{e.focus}</p>
                </div>
              )}
              {!e.focus && <div className="pb-2" />}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
