import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Link2, Share2 } from "lucide-react";
import { Lightbox } from "@/components/Lightbox";
import { Label } from "@/components/ui/label";
import { TypeTag } from "@/sections/Multimedia";
import { NotFound } from "@/pages/NotFound";
import { course, findWork, hasMedia, works, type Media, type Work } from "@/multimedia";
import { person } from "@/content";

const SITE = "https://personal-portfolio-sarmiento.vercel.app";

function useDocumentMeta(w: Work | undefined) {
  useEffect(() => {
    if (!w) return;
    const prev = document.title;
    document.title = `${w.title} - ${course.name} - ${person.name}`;
    const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = desc?.content;
    if (desc) desc.content = w.summary;
    return () => {
      document.title = prev;
      if (desc && prevDesc !== undefined) desc.content = prevDesc;
    };
  }, [w]);
}

function ShareButton({ w }: { w: Work }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/multimedia/${w.slug}`;
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: w.title, text: w.summary, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share sheet dismissed or clipboard unavailable: the address is in the bar */
    }
  };
  const Icon = copied ? Check : typeof navigator !== "undefined" && "share" in navigator ? Share2 : Link2;
  return (
    <button type="button" onClick={share} aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-semibold hover:border-accent">
      <Icon size={15} aria-hidden />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

function MediaBlock({ m, title }: { m: Media; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (m.kind === "video") {
    return (
      <video controls preload="metadata" poster={m.poster} className="aspect-video w-full rounded-card border border-border bg-black" aria-label={title}>
        <source src={m.src} type="video/mp4" />
        Your browser can't play this video. <a href={m.src}>Download it</a>.
      </video>
    );
  }
  if (m.kind === "image") {
    return <img src={m.src} alt={m.alt} loading="lazy" className="w-full rounded-card border border-border" />;
  }
  if (m.kind === "frames") {
    return (
      <>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {m.frames.map((f, i) => (
            <li key={f.src}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`Open panel ${i + 1} full size`} className="group relative block w-full overflow-hidden rounded-xl border border-border">
                <img src={f.src} alt={f.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                <span className="absolute bottom-1.5 left-1.5 rounded bg-bg/80 px-1.5 font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              </button>
            </li>
          ))}
        </ul>
        <Lightbox frames={m.frames} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      </>
    );
  }
  return (
    <a href={m.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-accent underline underline-offset-4">
      <ExternalLink size={14} aria-hidden />
      {m.label ?? "Open PDF"}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function WorkPage() {
  const { slug } = useParams();
  const w = findWork(slug);
  useDocumentMeta(w);
  if (!w) return <NotFound />;

  const i = works.findIndex((x) => x.slug === w.slug);
  const prev = works[(i - 1 + works.length) % works.length];
  const next = works[(i + 1) % works.length];

  return (
    <main className="mx-auto max-w-[860px] px-5 pb-24 pt-10 md:pt-16">
      <Link to={{ pathname: "/", hash: "#multimedia" }} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted hover:text-text">
        <ArrowLeft size={14} aria-hidden /> All multimedia work
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <TypeTag type={w.type} />
          <span className="font-mono text-xs text-muted">
            {course.code} {course.name} · {w.module}
          </span>
        </div>
        <h1 className="mt-3 text-[clamp(30px,5vw,48px)] font-bold leading-tight tracking-tight">{w.title}</h1>
        <p className="mt-3 text-lg text-muted">{w.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ShareButton w={w} />
          {w.tools.map((t) => (
            <span key={t} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {t}
            </span>
          ))}
        </div>
      </header>

      <section aria-label="Work" className="mt-10 space-y-6">
        {hasMedia(w) ? (
          w.media.map((m, k) => <MediaBlock key={k} m={m} title={w.title} />)
        ) : (
          <div className="grid aspect-video place-items-center rounded-card border border-dashed border-border bg-surface/50 p-6 text-center">
            <div>
              <p className="font-semibold">The files for this work are coming soon.</p>
              <p className="mt-1 text-sm text-muted">Check back shortly, or read about it below.</p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <Label>About this work</Label>
        <div className="mt-3 space-y-3 text-text/90">
          {w.details.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <nav aria-label="More work" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        <Link to={`/multimedia/${prev.slug}`} className="rounded-card border border-border bg-surface/70 p-4 hover:border-accent2">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <ArrowLeft size={12} aria-hidden /> Previous
          </p>
          <p className="mt-1 font-semibold">{prev.title}</p>
        </Link>
        <Link to={`/multimedia/${next.slug}`} className="rounded-card border border-border bg-surface/70 p-4 text-right hover:border-accent2">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Next <ArrowRight size={12} aria-hidden />
          </p>
          <p className="mt-1 font-semibold">{next.title}</p>
        </Link>
      </nav>
    </main>
  );
}
