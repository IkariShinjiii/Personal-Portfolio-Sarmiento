import { createClient } from "@supabase/supabase-js";

// The project URL and publishable key are public by design (row-level security protects the data),
// so they ship as defaults. Env vars override them, e.g. to point at another project.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://vqmbfxcfppyssnaninzn.supabase.co";
const key =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || "sb_publishable_Ve1j7_ZCuEGH-njKV4yRiQ_jqH_LVvd";

export const supabase = createClient(url, key, { auth: { flowType: "pkce" } });

export type GuestEntry = {
  id: string;
  user_id: string;
  author_name: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
  updated_at: string;
};
