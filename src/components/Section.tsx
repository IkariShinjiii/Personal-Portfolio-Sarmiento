import { Label } from "@/components/ui/label";

type Props = { id: string; label: string; title: string; accent?: string; children?: React.ReactNode };

/** Centered section header; the last word of the title gets the gradient. */
export function Section({ id, label, title, children }: Props) {
  const words = title.split(" ");
  const last = words.pop();
  return (
    <section id={id} className="mx-auto max-w-[1180px] px-5 py-[72px] md:py-24">
      <div className="text-center">
        <Label>{label}</Label>
        <h2 className="mt-2 text-[clamp(28px,4vw,48px)] font-bold tracking-tight">
          {words.join(" ")} <span className="text-gradient">{last}</span>
        </h2>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}
