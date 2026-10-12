import { Nav } from "@/components/Nav";
import { Section } from "@/components/Section";
import { Hero } from "@/sections/Hero";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
      >
        Skip to content
      </a>
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero />
        <Section id="about" label="About" title="About me" />
        <Section id="projects" label="Work" title="Projects" />
        <Section id="skills" label="Stack" title="Skills" />
        <Section id="explore" label="More" title="More to explore" />
        <Section id="contact" label="Contact" title="Get in touch">
          <Button asChild>
            <a href="https://github.com/IkariShinjiii">GitHub</a>
          </Button>
        </Section>
      </main>
      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} Kervin Sarmiento
      </footer>
    </>
  );
}
