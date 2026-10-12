import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ChatCard } from "@/components/ChatCard";
import { Chip } from "@/components/ui/chip";

const FIRST = "Kervin";
const NAME = "Kervin Sarmiento";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1040px] flex-col items-center px-5 pb-10 pt-10 text-center md:pt-14">
      <div
        aria-hidden
        className="grid size-24 place-items-center rounded-full border border-border bg-gradient-to-br from-accent/30 to-accent2/30 text-3xl font-bold"
      >
        KS
      </div>

      <h1 aria-label={`Hi, I'm ${NAME}`} className="mt-6 text-[clamp(32px,6vw,56px)] font-bold leading-[1.1] tracking-tight">
        <span aria-hidden>Hi, I'm </span>
        {NAME.split("").map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block whitespace-pre text-gradient"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.2 + i * 0.035, duration: 0.3, ease: "easeOut" }}
          >
            {ch}
          </motion.span>
        ))}
      </h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Your role line goes here, with a one-line summary.</p>

      <ChatCard name={FIRST} />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[
          ["#projects", "Work"],
          ["#about", "About me"],
          ["#skills", "Skills"],
          ["#contact", "Contact"],
        ].map(([href, label]) => (
          <a key={href} href={href}>
            <Chip className="hover:border-accent hover:text-accent">{label}</Chip>
          </a>
        ))}
      </div>

      <a href="#about" className="mt-8 flex flex-col items-center gap-1 text-sm text-muted hover:text-text">
        Scroll to explore
        <ArrowDown size={16} aria-hidden />
      </a>
    </section>
  );
}
