import { Section } from "@/components/Section";
import { GearCarousel } from "@/components/GearCarousel";
import { gear } from "@/content";

export function Gear() {
  return (
    <Section id="gear" label="Setup" title="My Gear">
      <GearCarousel items={gear} />
    </Section>
  );
}
