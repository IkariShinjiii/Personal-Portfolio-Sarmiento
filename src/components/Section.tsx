import { Label } from "@/components/ui/label";

export function Section({ id, label, title, children }: { id: string; label: string; title: string; children?: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-[1040px] px-5 py-[72px] md:py-24">
      <Label>{label}</Label>
      <h2 className="mt-2 text-[clamp(28px,4vw,40px)] font-bold tracking-tight">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
