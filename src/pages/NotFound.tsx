import { useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Page not found - Kervin Sarmiento";
    return () => {
      document.title = prev;
    };
  }, []);
  return (
    <main className="mx-auto grid min-h-[70svh] max-w-[640px] place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">That page does not exist</h1>
        <p className="mt-3 text-muted">The link may be old or mistyped.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
