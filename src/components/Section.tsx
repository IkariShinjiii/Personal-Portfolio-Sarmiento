import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { DUR, EASE, gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";

type Props = { id: string; label: string; title: string; accent?: string; children?: React.ReactNode };

/** Centered section header; the last word of the title gets the gradient. */
export function Section({ id, label, title, children }: Props) {
  const words = title.split(" ");
  const last = words.pop();
  const head = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        const tl = gsap.timeline({
          defaults: { ease: EASE.out },
          scrollTrigger: { trigger: head.current, start: "top 88%", once: true },
        });
        tl.from(".sec-label", { opacity: 0, y: 12, duration: DUR.reveal * 0.8 })
          .from(".sec-title", { opacity: 0, y: 22, duration: DUR.reveal }, 0.08)
          .from(".sec-rule", { scaleX: 0, duration: DUR.reveal }, 0.2);
      });
      return () => mm.revert();
    },
    { scope: head },
  );

  return (
    <section id={id} className="mx-auto max-w-[1760px] px-5 min-[1280px]:px-[clamp(1.25rem,3vw,3.5rem)] py-[72px] md:py-24">
      <div ref={head} className="text-center">
        <Label className="sec-label">{label}</Label>
        <h2 className="sec-title mt-2 text-[clamp(28px,4vw,48px)] font-bold tracking-tight">
          {words.join(" ")} <span className="text-gradient">{last}</span>
        </h2>
        <div aria-hidden className="sec-rule mx-auto mt-4 h-0.5 w-12 origin-center rounded-full bg-gradient-to-r from-accent to-accent2" />
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}
