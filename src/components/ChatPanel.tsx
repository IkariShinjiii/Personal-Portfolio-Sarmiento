import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const MAX = 500;
const STARTERS = ["What do you build?", "How can I contact you?", "Which projects should I look at?"];
const FALLBACK = "I could not reach the assistant right now. Try the Projects section or email me.";

type Props = {
  open: boolean;
  initialQuestion: string;
  onClose: () => void;
  returnFocus: React.RefObject<HTMLElement | null>;
};

export function ChatPanel({ open, initialQuestion, onClose, returnFocus }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  async function send(raw: string) {
    const text = raw.trim().slice(0, MAX);
    if (!text || loading) return;
    const history = messagesRef.current.slice(-6);
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

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (initialQuestion) void send(initialQuestion);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Ask me anything"
      className="fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col rounded-card border border-border bg-surface shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[400px]"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-semibold">Ask me anything</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="grid size-8 place-items-center rounded-full hover:bg-bg"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void send(q)}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <p
            key={i}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
              m.role === "user" ? "ml-auto bg-accent text-accent-contrast" : "bg-bg",
            )}
          >
            {m.text}
          </p>
        ))}
        {loading && <p className="text-sm text-muted">Thinking...</p>}
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            maxLength={MAX}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            aria-label="Your question"
            placeholder="Ask about my work..."
            className="flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="size-10 p-0">
            <Send size={16} />
          </Button>
        </div>
        <p className="mt-1 text-right text-xs text-muted">
          {input.length}/{MAX}
        </p>
      </form>
    </div>
  );
}
