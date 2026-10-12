import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { supabase, type GuestEntry } from "@/lib/supabase";

const MAX = 280;

function GithubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function Guestbook() {
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: e } = await supabase
      .from("guestbook_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (e) setError("Could not load the guestbook right now.");
    else setEntries(data as GuestEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    void load();
    return () => sub.subscription.unsubscribe();
  }, [load]);

  if (!supabase) {
    return (
      <Section id="guestbook" label="Community" title="Guestbook">
        <p className="text-center text-muted">The guestbook is not configured yet.</p>
      </Section>
    );
  }

  const mine = session ? entries.find((e) => e.user_id === session.user.id) : undefined;

  async function signIn() {
    setError("");
    const { error: e } = await supabase!.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/#guestbook` },
    });
    if (e) setError("Could not start GitHub sign-in.");
  }

  async function save() {
    const message = text.trim();
    if (!message || !session) return;
    setBusy(true);
    setError("");
    const q = mine
      ? supabase!.from("guestbook_entries").update({ message }).eq("id", mine.id)
      : supabase!.from("guestbook_entries").insert({ message });
    const { error: e } = await q;
    setBusy(false);
    if (e) {
      setError("Could not save your message. Please try again.");
      return;
    }
    setText("");
    setEditing(false);
    await load();
  }

  async function remove() {
    if (!mine) return;
    setBusy(true);
    const { error: e } = await supabase!.from("guestbook_entries").delete().eq("id", mine.id);
    setBusy(false);
    if (e) setError("Could not delete your message.");
    else await load();
  }

  const showForm = session && (!mine || editing);

  return (
    <Section id="guestbook" label="Community" title="Leave Your Mark">
      <div className="mx-auto max-w-[680px]">
        <p className="mb-6 text-center text-muted">Share your thoughts, feedback, or just say hi.</p>

        <div className="rounded-card border border-border bg-surface/70 p-5 backdrop-blur">
          {!session && (
            <div className="text-center">
              <Button onClick={() => void signIn()}>
                <GithubMark /> Sign in with GitHub to sign the guestbook
              </Button>
              <p className="mt-3 text-xs text-muted">Only your GitHub name and avatar are shown. No email is stored on this site.</p>
            </div>
          )}

          {session && (
            <div className="flex items-center justify-between gap-3 text-sm text-muted">
              <span>
                Signed in as{" "}
                <span className="text-text">{session.user.user_metadata?.name ?? session.user.user_metadata?.user_name ?? "you"}</span>
              </span>
              <button type="button" onClick={() => void supabase!.auth.signOut()} className="hover:text-text">
                Sign out
              </button>
            </div>
          )}

          {showForm && (
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <label htmlFor="gb-message" className="sr-only">
                Your message
              </label>
              <textarea
                id="gb-message"
                value={text}
                maxLength={MAX}
                rows={3}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a short message..."
                className="w-full resize-none rounded-xl border border-border bg-bg/70 p-3 text-sm outline-none focus:border-accent"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {text.length}/{MAX}
                </span>
                <div className="flex gap-2">
                  {editing && (
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={busy || !text.trim()}>
                    {mine ? "Save changes" : "Post"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {session && mine && !editing && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">You have already signed the guestbook.</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="text-accent hover:underline"
                  onClick={() => {
                    setText(mine.message);
                    setEditing(true);
                  }}
                >
                  Edit
                </button>
                <button type="button" disabled={busy} className="text-muted hover:text-text" onClick={() => void remove()}>
                  Delete
                </button>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {loading && <li className="text-center text-sm text-muted">Loading...</li>}
          {!loading && entries.length === 0 && <li className="text-center text-sm text-muted">No messages yet. Be the first.</li>}
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3 rounded-card border border-border bg-surface/70 p-4 backdrop-blur">
              {e.avatar_url ? (
                <img src={e.avatar_url} alt="" width={36} height={36} loading="lazy" className="size-9 rounded-full" />
              ) : (
                <span aria-hidden className="grid size-9 place-items-center rounded-full bg-accent2/20 text-sm font-semibold">
                  {e.author_name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {e.author_name} <span className="font-normal text-muted">&middot; {when(e.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-muted">{e.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
