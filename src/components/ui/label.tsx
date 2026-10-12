import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted", className)} {...props} />;
}
