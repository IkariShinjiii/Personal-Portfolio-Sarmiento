import { motion, useReducedMotion } from "framer-motion";
import { Chip } from "@/components/ui/chip";

const NAME = "Kervin Sarmiento";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1040px] flex-col justify-center px-5 py-[72px] md:py-24">
      <h1 aria-label={NAME} className="text-[clamp(40px,7vw,72px)] font-bold leading-[1.05] tracking-tight">
        {NAME.split("").map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block whitespace-pre"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : i * 0.035, duration: 0.3, ease: "easeOut" }}
          >
            {ch}
          </motion.span>
        ))}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Your role line goes here, with a one-line summary.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["#projects", "Work"],
          ["#about", "About"],
          ["#contact", "Contact"],
        ].map(([href, label]) => (
          <a key={href} href={href}>
            <Chip className="hover:border-accent hover:text-accent">{label}</Chip>
          </a>
        ))}
      </div>
    </section>
  );
}
