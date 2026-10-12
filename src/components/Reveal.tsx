import { useRef } from "react";
import { gsap, NO_REDUCED_MOTION, useGSAP } from "@/lib/gsap";

type Props = { children: React.ReactNode; className?: string; delay?: number };

/** Fades and lifts its content in once, when it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        gsap.from(ref.current, {
          opacity: 0,
          y: 36,
          scale: 0.98,
          duration: 0.8,
          delay,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
