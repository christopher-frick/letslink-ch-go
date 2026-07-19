import { supabase } from "@/lib/supabase";

// Miroir de la vue public.profiles_public (letslink-promo/DOMAIN.md).
// Seuls les profils avec is_profile_public=true et un slug non-null y
// apparaissent — l'opt-in est déjà appliqué par la vue, pas besoin de
// re-filtrer côté blog.
export interface ArtistPublic {
  id: string;
  artist_name: string;
  slug: string;
  bio: string | null;
  genre: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;
  website_url: string | null;
  spotify_url: string | null;
  apple_url: string | null;
  youtube_url: string | null;
  soundcloud_url: string | null;
  tidal_url: string | null;
  deezer_url: string | null;
  amazon_url: string | null;
  bandcamp_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  created_at: string;
}

const ARTIST_COLUMNS = "*";

export interface ListArtistsParams {
  page?: number;
  limit?: number;
  genre?: string;
}

export interface ListArtistsResult {
  items: ArtistPublic[];
  total: number;
  page: number;
  limit: number;
}

// page/limit/genre déjà supportés pour anticiper une future page
// recherche/filtres — voir lib/queries/articles.ts pour le même choix.
export async function listArtists({
  page = 1,
  limit = 24,
  genre,
}: ListArtistsParams = {}): Promise<ListArtistsResult> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("profiles_public")
    .select(ARTIST_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (genre) query = query.eq("genre", genre);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    items: (data ?? []) as unknown as ArtistPublic[],
    total: count ?? 0,
    page,
    limit,
  };
}

export async function getArtistBySlug(slug: string): Promise<ArtistPublic | null> {
  const { data, error } = await supabase
    .from("profiles_public")
    .select(ARTIST_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ArtistPublic | null;
}

// Utilisé par sitemap.ts et generateStaticParams de la page artiste.
export async function getAllArtistSlugsForStaticParams(): Promise<
  Pick<ArtistPublic, "slug" | "created_at">[]
> {
  const { data, error } = await supabase.from("profiles_public").select("slug, created_at");
  if (error) throw error;
  return data ?? [];
}
