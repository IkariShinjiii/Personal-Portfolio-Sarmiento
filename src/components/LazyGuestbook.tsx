import { lazy, Suspense, useEffect, useRef, useState } from "react";

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
      { rootMargin: "600px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
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
