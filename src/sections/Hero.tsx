import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { ChatCard } from "@/components/ChatCard";
import { Chip } from "@/components/ui/chip";
import { EASE, gsap, NO_REDUCED_MOTION, pauseOffscreen, useGSAP } from "@/lib/gsap";
import { person } from "@/content";

const FIRST = "Kervin";
const NAME = "Kervin Sarmiento";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  // One timeline drives the whole intro, so the pieces arrive in a deliberate order.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        // Kept short (about 1.2s) so the largest content paints early; pieces overlap on purpose.
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.from(".hero-avatar", { scale: 0.6, opacity: 0, duration: 0.7 })
          .from(".hero-hi", { opacity: 0, y: 12, duration: 0.3 }, 0.1)
          .from(".hero-letter", { opacity: 0, y: 18, rotateX: -50, duration: 0.4, stagger: 0.02 }, 0.15)
          .from(".hero-sub", { y: 14, duration: 0.5 }, 0.2)
          .from(".hero-chat", { opacity: 0, y: 24, scale: 0.98, duration: 0.5 }, 0.3)
          .from(".hero-chip", { opacity: 0, y: 10, duration: 0.3, stagger: 0.04 }, 0.6)
          .from(".hero-cue", { opacity: 0, duration: 0.4 }, 0.8);
        const bob = gsap.to(".hero-cue-arrow", { y: 6, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
        const stop = pauseOffscreen(root.current, [bob]);
        return () => stop();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1040px] flex-col items-center px-5 pb-10 pt-10 text-center md:pt-14"
    >
      <img
        src="/profile.jpg"
        alt="Portrait of Kervin Sarmiento"
        width={96}
        height={96}
        className="hero-avatar size-24 rounded-full border border-border object-cover"
      />

      <h1 aria-label={`Hi, I'm ${NAME}`} className="mt-6 text-[clamp(32px,6vw,56px)] font-bold leading-[1.1] tracking-tight [perspective:600px]">
        <span aria-hidden className="hero-hi mr-[0.28em] inline-block">
          Hi, I'm
        </span>
        {NAME.split("").map((ch, i) => (
          <span key={i} aria-hidden className="hero-letter inline-block whitespace-pre text-gradient">
            {ch}
          </span>
        ))}
      </h1>
      <p className="hero-sub mt-3 max-w-xl text-lg text-muted">
        <span className="font-semibold text-text">{person.role}.</span> {person.summary}
      </p>

      <div className="hero-chat w-full">
        <ChatCard name={FIRST} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[
          ["#projects", "Work"],
          ["#about", "About me"],
          ["#skills", "Skills"],
          ["#contact", "Contact"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="hero-chip">
            <Chip className="hover:border-accent hover:text-accent">{label}</Chip>
          </a>
        ))}
      </div>

      <a href="#about" className="hero-cue mt-8 flex flex-col items-center gap-1 text-sm text-muted hover:text-text">
        Scroll to explore
        <ArrowDown size={16} aria-hidden className="hero-cue-arrow" />
      </a>
    </section>
  );
}
