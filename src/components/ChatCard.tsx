import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const MAX = 500;
const STARTERS = ["What do you build?", "How can I contact you?", "Which projects should I see?"];
const FALLBACK = "I could not reach the assistant right now. Try the Projects section or email me.";

/** The hero concierge: an inline chat card. Replies are rendered as text, never HTML. */
export function ChatCard({ name }: { name: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(raw: string) {
    const text = raw.trim().slice(0, MAX);
    if (!text || loading) return;
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = (await r.json()) as { reply?: string; error?: string };
      setMessages((m) => [...m, { role: "assistant", text: r.ok && data.reply ? data.reply : data.error || FALLBACK }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: FALLBACK }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-8 flex h-[340px] w-full max-w-[760px] flex-col rounded-[28px] border border-border bg-surface/70 p-4 backdrop-blur">
      <div ref={logRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-2" aria-live="polite">
        {messages.length === 0 && (
          <p className="m-auto text-lg text-muted">Ask me anything about {name}...</p>
        )}
        {messages.map((m, i) => (
          <p
            key={i}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-left text-[15px]",
              m.role === "user" ? "ml-auto bg-accent text-accent-contrast" : "bg-bg/80",
            )}
          >
            {m.text}
          </p>
        ))}
        {loading && <p className="text-left text-sm text-muted">Thinking...</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-2 py-3">
        {STARTERS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void send(q)}
            className="rounded-full border border-border bg-bg/60 px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-2 rounded-full border border-border bg-bg/70 py-1.5 pl-5 pr-1.5 focus-within:border-accent"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          maxLength={MAX}
          onChange={(e) => setInput(e.target.value)}
          aria-label={`Ask anything about ${name}`}
          placeholder={`Ask anything about ${name}...`}
          className="flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
        />
        {input.length > 400 && <span className="text-xs text-muted">{input.length}/{MAX}</span>}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="grid size-10 place-items-center rounded-full bg-accent text-accent-contrast transition-opacity disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
