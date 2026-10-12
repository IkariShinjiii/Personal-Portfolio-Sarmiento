import { useRef } from "react";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";

const dark = (hex: string) => parseInt(hex.slice(0, 2), 16) + parseInt(hex.slice(2, 4), 16) + parseInt(hex.slice(4, 6), 16) < 150;

function Group({ slugs, hidden }: { slugs: string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className={`flex shrink-0 gap-6 pr-6 ${hidden ? "motion-reduce:hidden" : ""}`}>
      {slugs.map((s) => {
        const ic = BRAND_ICONS[s];
        return (
          <li key={s} className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill={dark(ic.hex) ? "currentColor" : `#${ic.hex}`}>
              <path d={ic.path} />
            </svg>
            {ic.title}
          </li>
        );
      })}
    </ul>
  );
}

/** Slow, endless strip of tech logos with faded edges. Static wrap with reduced motion. */
export function TechStrip({ slugs, reverse = false }: { slugs: string[]; reverse?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        const el = track.current;
        if (!el) return;
        const half = () => el.scrollWidth / 2;
        const tween = gsap.fromTo(el, { x: () => (reverse ? -half() : 0) }, { x: () => (reverse ? 0 : -half()), duration: () => half() / 32, ease: "none", repeat: -1, invalidateOnRefresh: true });
        return () => {
          tween.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      role="group"
      aria-label="Technologies"
      className="overflow-hidden border-b border-border first:border-t bg-bg/40 py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
    >
      <div ref={track} className="flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-2 motion-reduce:px-4">
        <Group slugs={slugs} />
        <Group slugs={slugs} hidden />
      </div>
    </div>
  );
}
