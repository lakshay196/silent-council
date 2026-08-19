import { createClient } from "@supabase/supabase-js";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

function looksLikeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabaseUrl = looksLikeHttpUrl(rawUrl) ? rawUrl : PLACEHOLDER_URL;
const supabaseAnonKey =
  rawKey.length > 20 && !rawKey.includes("<") ? rawKey : PLACEHOLDER_KEY;

/**
 * True only when both env values look real. The demo fallback still renders
 * when this is false, so local builds work with placeholder secrets.
 */
export const supabaseConfigured =
  supabaseUrl !== PLACEHOLDER_URL && supabaseAnonKey !== PLACEHOLDER_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options) =>
      fetch(url, {
        ...options,
        // Fail fast so the UI falls back to demo data instead of hanging 10–15s.
        signal: AbortSignal.timeout(4000),
      }),
  },
});
