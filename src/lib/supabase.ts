import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Null when the env vars are missing, so the guestbook can show a friendly message. */
export const supabase = url && key ? createClient(url, key) : null;

export type GuestEntry = {
  id: string;
  user_id: string;
  author_name: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
  updated_at: string;
};
