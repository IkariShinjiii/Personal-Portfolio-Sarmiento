import { cn } from "@/lib/utils";

export function StatusBadge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm", className)}
      {...props}
    >
      <span aria-hidden className="size-2 rounded-full bg-accent" />
      {children}
    </span>
  );
}
