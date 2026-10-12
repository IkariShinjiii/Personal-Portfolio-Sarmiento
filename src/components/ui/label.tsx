import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-muted", className)} {...props} />;
}
