import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Chip } from "@/components/ui/chip";

const NAME = "Kervin Sarmiento";

type Props = {
  onAsk: (question: string) => void;
  askRef: React.RefObject<HTMLInputElement | null>;
};

export function Hero({ onAsk, askRef }: Props) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");

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

      <form
        className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 focus-within:border-accent"
        onSubmit={(e) => {
          e.preventDefault();
          onAsk(q.trim());
          setQ("");
        }}
      >
        <Sparkles size={16} aria-hidden className="text-accent" />
        <input
          ref={askRef}
          value={q}
          maxLength={500}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Ask me anything"
          placeholder="Ask me anything"
          className="flex-1 bg-transparent py-1 text-base outline-none placeholder:text-muted"
        />
        <button type="submit" className="text-sm font-semibold text-accent">
          Ask
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
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
