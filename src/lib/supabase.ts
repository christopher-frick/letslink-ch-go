import { createClient } from "@supabase/supabase-js";

// Client anon, lecture seule — n'accède qu'aux vues public.articles_published
// et public.profiles_public (RLS/GRANT déjà restreints côté Supabase).
// Voir letslink-promo/DOMAIN.md pour le contrat de ces vues.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
