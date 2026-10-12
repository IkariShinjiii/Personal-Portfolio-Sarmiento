import { useEffect, useRef, useState } from "react";

type Props = { className?: string; onClick?: () => void };

/**
 * The hero avatar: a short looping clip of the owner's Memoji. It stays a still image when the visitor
 * prefers reduced motion or has data saver on, and the still is also the poster while the clip loads.
 * The clip only plays while it is on screen.
 */
export function AvatarVideo({ className, onClick }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still] = useState(() => {
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    return saver || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // The still avatar is what loads with the page; the clip only starts once everything else has finished.
  const [loaded, setLoaded] = useState(() => document.readyState === "complete");
  useEffect(() => {
    if (loaded || still) return;
    const go = () => window.setTimeout(() => setLoaded(true), 300);
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, [loaded, still]);

  useEffect(() => {
    const v = ref.current;
    if (!v || still || !loaded) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [still, loaded]);

  if (still || !loaded) {
    return (
      <img
        src="/avatar.png"
        alt="Kervin's avatar"
        width={96}
        height={96}
        fetchPriority="high"
        draggable={false}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <video
      ref={ref}
      role="img"
      aria-label="Kervin's animated avatar"
      poster="/avatar.png"
      width={96}
      height={96}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      onClick={onClick}
      className={className}
    >
      <source src="/avatar.webm" type='video/webm; codecs="vp9"' />
      <source src="/avatar.mp4" type="video/mp4" />
    </video>
  );
}
