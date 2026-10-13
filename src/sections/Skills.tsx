import { Section } from "@/components/Section";
import { SkillMarquee } from "@/components/SkillMarquee";
import { SkillsSphere } from "@/components/SkillsSphere";
import { skillRowAbove, skillRowBelow, sphereIcons } from "@/content";

export function Skills() {
  return (
    <Section id="skills" label="Tech stack" title="My Skills">
      <div>
        <SkillMarquee items={skillRowAbove} direction={-1} speed={45} label="Front-end and tooling skills" />
        <div className="my-6">
          <SkillsSphere items={sphereIcons} />
          <p className="mt-2 text-center text-sm text-muted">Drag to spin</p>
        </div>
        <SkillMarquee items={skillRowBelow} direction={1} speed={38} label="Back-end, platforms and games skills" />
      </div>
    </Section>
  );
}
