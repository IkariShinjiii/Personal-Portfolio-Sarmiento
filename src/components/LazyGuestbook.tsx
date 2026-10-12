import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const Guestbook = lazy(() => import("@/sections/Guestbook").then((m) => ({ default: m.Guestbook })));

function needsNow() {
  try {
    const q = new URLSearchParams(window.location.search);
    return (
      window.location.hash === "#guestbook" ||
      q.has("code") ||
      q.has("error") ||
      sessionStorage.getItem("gb-return") === "1"
    );
  } catch {
    return false;
  }
}

/** Loads the guestbook (and the Supabase client) only when it is near the viewport or an OAuth return needs it. */
export function LazyGuestbook() {
  const [load, setLoad] = useState(needsNow);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (load || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setLoad(true);
      },
      { rootMargin: "1800px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [load]);

  // The real section replaces a placeholder of a different height: re-measure the triggers after it mounts.
  useEffect(() => {
    if (!load) return;
    const refresh = () => ScrollTrigger.refresh();
    // Idle time when the browser offers it, so the re-measure never lands in the middle of a scroll.
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
    if (ric && cic) {
      const id = ric.call(window, refresh, { timeout: 1500 });
      return () => cic.call(window, id);
    }
    const id = setTimeout(refresh, 600);
    return () => clearTimeout(id);
  }, [load]);

  if (load) {
    return (
      <Suspense fallback={<div id="guestbook" className="min-h-[480px]" />}>
        <Guestbook />
      </Suspense>
    );
  }
  return <div ref={ref} id="guestbook" className="min-h-[480px]" aria-hidden />;
}
