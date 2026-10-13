import { Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type Props = { id: string; minHeight: number; children: React.ReactNode; rootMargin?: string };

/**
 * Mounts its children (a React.lazy section) only when it is near the viewport, so the code and the
 * work of building below-the-fold sections stay off the startup path. The placeholder keeps the id,
 * so in-page links still land in the right place, and scroll triggers are re-measured after the swap.
 */
export function Deferred({ id, minHeight, children, rootMargin = "1200px" }: Props) {
  const [load, setLoad] = useState(() => window.location.hash === `#${id}`);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (load || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [load, rootMargin]);

  useEffect(() => {
    if (!load) return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => window.clearTimeout(t);
  }, [load]);

  const hold = <div id={id} style={{ minHeight }} />;
  if (!load) return <div ref={ref} id={id} style={{ minHeight }} aria-hidden />;
  return <Suspense fallback={hold}>{children}</Suspense>;
}
