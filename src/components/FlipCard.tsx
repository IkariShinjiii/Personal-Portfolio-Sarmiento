import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = { title: string; front: string; back: string };

/** Hover on desktop, tap or Enter/Space on touch and keyboard. */
export function FlipCard({ title, front, back }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={open}
      onClick={() => setOpen((o) => !o)}
      className={cn(
        "group min-h-44 rounded-card border border-border bg-surface p-6 text-left transition-colors duration-200",
        "hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        open && "border-accent",
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</span>
      <span className="mt-3 block text-lg font-semibold">{front}</span>
      <span
        className={cn(
          "mt-3 block text-muted transition-all duration-300",
          open ? "max-h-40 opacity-100" : "max-h-0 overflow-hidden opacity-0 group-hover:max-h-40 group-hover:opacity-100",
        )}
      >
        {back}
      </span>
    </button>
  );
}
