import { useRef } from "react";
import { MapPin } from "lucide-react";
import { gsap, NO_REDUCED_MOTION, playOnHover, useGSAP } from "@/lib/gsap";

type Props = { city: string; country: string; coords: string; timezone?: string };

/** Dotted "map" card with a pin and a scan line that sweeps across it while hovered. */
export function LocationCard({ city, country, coords, timezone }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        const scan = gsap.fromTo(".scan", { x: 0 }, { x: () => root.current?.clientWidth ?? 300, duration: 5.5, ease: "sine.inOut", repeat: -1, yoyo: true, invalidateOnRefresh: true });
        const ring = gsap.to(".pin-ring", { scale: 2.4, opacity: 0, duration: 1.8, ease: "power2.out", repeat: -1, transformOrigin: "50% 50%" });
        return playOnHover(root.current, [scan, ring]);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-full min-h-[143px] overflow-hidden rounded-card border border-border bg-surface/70">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(color-mix(in_srgb,var(--text)_28%,transparent)_1.2px,transparent_1.4px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_70%_30%,#000,transparent_75%)]"
      />
      <div aria-hidden className="scan absolute inset-y-0 left-0 w-px bg-accent2 shadow-[0_0_18px_2px_var(--accent2)]" />
      <span aria-hidden className="absolute right-[22%] top-[28%] grid size-3 place-items-center">
        <span className="pin-ring absolute size-3 rounded-full bg-accent" />
        <span className="relative size-2 rounded-full bg-accent" />
      </span>
      <div className="relative flex h-full flex-col justify-end p-4">
        <MapPin size={14} aria-hidden className="mb-1 text-accent" />
        <p className="text-[20px] font-extrabold uppercase leading-tight tracking-tight">
          {city}, {country}
        </p>
        <p className="mt-1 font-mono text-[12px] text-muted">{coords}</p>
        {timezone && <p className="font-mono text-[12px] text-accent2">- {timezone}</p>}
      </div>
    </div>
  );
}
