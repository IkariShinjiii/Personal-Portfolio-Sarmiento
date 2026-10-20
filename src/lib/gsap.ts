import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
gsap.config({ force3D: true });
// Mobile browsers resize the viewport as the URL bar shows and hides; do not re-measure every trigger each time.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Animations only run when the visitor has not asked for reduced motion. */
export const NO_REDUCED_MOTION = "(prefers-reduced-motion: no-preference)";

/** One motion language for the whole site: confident arrivals decelerate hard, continuity eases both ways. */
export const EASE = {
  out: "expo.out", // arrivals and reveals
  inOut: "power3.inOut", // movement between two visible states
  linear: "none", // endless loops
};
export const DUR = { quick: 0.3, reveal: 0.75, slow: 1 };

/** Pause endless animations while their element is off screen, so they cost nothing when nobody sees them. */
export function pauseOffscreen(trigger: Element | null, anims: gsap.core.Animation[]) {
  if (!trigger) return () => {};
  const st = ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => anims.forEach((a) => a.paused(!self.isActive)),
  });
  return () => st.kill();
}

/**
 * Keep these animations paused and run them only while the pointer is over their card
 * (the nearest .anim-host ancestor, else the element itself).
 */
export function playOnHover(el: Element | null, anims: gsap.core.Animation[]) {
  if (!el) return () => {};
  const host = el.closest(".anim-host") ?? el;
  const enter = () => anims.forEach((a) => a.play());
  const leave = () => anims.forEach((a) => a.pause());
  anims.forEach((a) => a.pause());
  host.addEventListener("pointerenter", enter);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointerenter", enter);
    host.removeEventListener("pointerleave", leave);
  };
}

export { gsap, ScrollTrigger, useGSAP };
