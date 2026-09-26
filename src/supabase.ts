/// <reference types="vite/client" />

import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return Promise.resolve(null);
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey),
    );
  }

  return supabaseClientPromise;
}
