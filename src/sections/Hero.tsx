import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { AvatarVideo } from "@/components/AvatarVideo";
import { Button } from "@/components/ui/button";
import { ChatCard } from "@/components/ChatCard";
import { EASE, gsap, NO_REDUCED_MOTION, pauseOffscreen, useGSAP } from "@/lib/gsap";
import { person } from "@/content";

const FIRST = "Kervin";
const NAME = "Kervin Sarmiento";

// index.html ships a static copy of the top of the hero; it is gone once React mounts, so read this once.
// While the intro screen is up it covers the shell, so the full hero intro runs (held until the screen leaves).
const PRELOADING = typeof document !== "undefined" && document.documentElement.classList.contains("preloading");
const SHELL_SHOWN = !PRELOADING && typeof document !== "undefined" && document.getElementById("root")?.hasAttribute("data-shell") === true;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const wiggleTl = useRef<gsap.core.Timeline | null>(null);

  // Click (or tap) the avatar: a quick squish and wobble.
  const wiggle = () => {
    wiggleTl.current?.restart();
  };

  // Measure each letter's offset within its line (and the widest line) so the gradient flows across the whole name.
  useLayoutEffect(() => {
    const wrap = nameRef.current;
    if (!wrap) return;
    const measure = () => {
      const letters = Array.from(wrap.querySelectorAll<HTMLElement>(".name-letter"));
      const lineStart = new Map<number, number>();
      for (const l of letters) lineStart.set(l.offsetTop, Math.min(lineStart.get(l.offsetTop) ?? Infinity, l.offsetLeft));
      let widest = 0;
      for (const l of letters) {
        const x = l.offsetLeft - (lineStart.get(l.offsetTop) ?? 0);
        l.style.setProperty("--x", `${x}px`);
        widest = Math.max(widest, x + l.offsetWidth);
      }
      wrap.style.setProperty("--w", `${Math.max(widest, 1)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap.parentElement ?? wrap);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Tell the intro screen (public/preloader.js) that the app is on screen and it may leave.
  useEffect(() => {
    (window as unknown as { __appReady?: boolean }).__appReady = true;
    window.dispatchEvent(new Event("app:ready"));
  }, []);

  // One timeline drives the whole intro, so the pieces arrive in a deliberate order.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        // Kept short (about 1.2s) so the largest content paints early; pieces overlap on purpose.
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        // Hold the entrance until the intro screen starts sliding away, then play it as the page is revealed.
        const onPreloaderLeave = () => tl.play(0);
        if (PRELOADING && !(window as unknown as { __preloaderLeaving?: boolean }).__preloaderLeaving) {
          tl.pause();
          window.addEventListener("preloader:leave", onPreloaderLeave, { once: true });
        }
        // When the static shell was on screen, the avatar, greeting, name and subtitle are already visible:
        // animating them in again would make them vanish and reappear, so only the rest of the hero arrives.
        if (!SHELL_SHOWN) {
          tl.from(".hero-avatar", { scale: 0.6, opacity: 0, duration: 0.7 })
            .from(".hero-hi", { opacity: 0, y: 12, duration: 0.3 }, 0.1)
            .from(".hero-letter", { opacity: 0, y: 18, rotateX: -50, duration: 0.4, stagger: 0.02 }, 0.15)
            .from(".hero-sub", { y: 14, duration: 0.5 }, 0.2)
            .from(".hero-cta", { opacity: 0, y: 12, duration: 0.4 }, 0.3);
        }
        tl.from(".hero-chat", { opacity: 0, y: 24, scale: 0.98, duration: 0.5 }, 0.3).from(".hero-cue", { opacity: 0, duration: 0.4 }, 0.8);
        const bob = gsap.to(".hero-cue-arrow", { y: 6, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" });

        // Avatar: it floats, its glow breathes, it turns to follow the pointer, and it wobbles when clicked.
        const float = gsap.to(".avatar-float", { y: -6, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        const breathe = gsap.to(".avatar-glow", { opacity: 0.35, scale: 1.12, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        wiggleTl.current = gsap
          .timeline({ paused: true })
          .to(".avatar-tilt", { scale: 0.9, rotate: -6, duration: 0.12, ease: "power2.out" })
          .to(".avatar-tilt", { scale: 1.08, rotate: 7, duration: 0.2, ease: "power2.inOut" })
          .to(".avatar-tilt", { scale: 1, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });

        const tiltEl = root.current?.querySelector<HTMLElement>(".avatar-tilt");
        const rotY = tiltEl ? gsap.quickTo(tiltEl, "rotationY", { duration: 0.7, ease: "power3.out" }) : null;
        const rotX = tiltEl ? gsap.quickTo(tiltEl, "rotationX", { duration: 0.7, ease: "power3.out" }) : null;
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const onMove = (e: PointerEvent) => {
          if (!tiltEl || !rotX || !rotY) return;
          const r = tiltEl.getBoundingClientRect();
          const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 420));
          const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 420));
          rotY(nx * 22);
          rotX(-ny * 22);
        };
        const onLeave = () => {
          rotX?.(0);
          rotY?.(0);
        };
        if (finePointer) {
          window.addEventListener("pointermove", onMove, { passive: true });
          document.documentElement.addEventListener("pointerleave", onLeave);
        }

        const stop = pauseOffscreen(root.current, [bob, float, breathe]);
        return () => {
          window.removeEventListener("preloader:leave", onPreloaderLeave);
          stop();
          wiggleTl.current?.kill();
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
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
      <div className="hero-avatar relative size-24 [perspective:520px]">
        <span aria-hidden className="avatar-glow absolute -inset-3 rounded-full bg-accent2/30 blur-xl" />
        <div className="avatar-float relative size-full">
          <AvatarVideo
            onClick={wiggle}
            className="avatar-tilt size-full cursor-pointer select-none rounded-full border border-border object-cover [transform-style:preserve-3d]"
          />
        </div>
      </div>

      <h1 aria-label={`Hi, I'm ${NAME}`} className="mt-6 text-[clamp(32px,6vw,56px)] font-bold leading-[1.1] tracking-tight [perspective:600px]">
        <span aria-hidden className="hero-hi mr-[0.28em] inline-block">
          Hi, I'm
        </span>
        <span ref={nameRef} className="name-grad">
          {/* Words stay whole (nowrap) so a narrow screen breaks between words, never inside one. */}
          {NAME.split(" ").map((word, w) => (
            <Fragment key={w}>
              {w > 0 && " "}
              <span aria-hidden className="inline-block whitespace-nowrap">
                {word.split("").map((ch, i) => (
                  <span key={i} className="hero-letter name-letter inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      </h1>
      <p className="hero-sub mt-3 max-w-xl text-lg text-muted">
        <span className="font-semibold text-text">{person.role}.</span> {person.summary}
      </p>
      <div className="hero-cta mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <a href="#contact">Hire me</a>
        </Button>
        <Button asChild variant="outline">
          <a href="#projects">See my work</a>
        </Button>
      </div>

      <div className="hero-chat w-full">
        <ChatCard name={FIRST} />
      </div>

      <a href="#about" className="hero-cue mt-8 flex flex-col items-center gap-1 text-sm text-muted hover:text-text">
        Scroll to explore
        <ArrowDown size={16} aria-hidden className="hero-cue-arrow" />
      </a>
    </section>
  );
}
