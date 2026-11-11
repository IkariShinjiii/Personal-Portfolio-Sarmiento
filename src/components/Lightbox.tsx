import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Frame = { src: string; alt: string };

/**
 * Full-size viewer for storyboard frames, built on the native <dialog>: focus is trapped, Esc closes it and the
 * page behind it is inert. Arrow keys (and the buttons) move between frames.
 */
export function Lightbox({ frames, index, onIndex, onClose }: { frames: Frame[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % frames.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + frames.length) % frames.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, frames.length, onIndex]);

  const frame = index === null ? null : frames[index];
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Storyboard viewer"
      className="m-auto max-h-[92svh] w-[min(1100px,94vw)] overflow-hidden rounded-card border border-border bg-surface p-0 text-text backdrop:bg-black/80"
    >
      {frame && (
        <div className="relative">
          <img src={frame.src} alt={frame.alt} className="max-h-[82svh] w-full object-contain" />
          <p className="px-4 py-3 text-center font-mono text-xs text-muted">
            Panel {index! + 1} of {frames.length}
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-bg/80 backdrop-blur">
            <X size={18} />
          </button>
          {frames.length > 1 && (
            <>
              <button type="button" onClick={() => onIndex((index! - 1 + frames.length) % frames.length)} aria-label="Previous panel" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/80 backdrop-blur">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => onIndex((index! + 1) % frames.length)} aria-label="Next panel" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/80 backdrop-blur">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
