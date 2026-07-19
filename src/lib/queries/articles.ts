import { cache } from "react";
import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/i18n";
import { slugify } from "@/lib/slugify";

export interface StreamingLink {
  label: string;
  url: string;
}

// Miroir de la vue public.articles_published (letslink-promo/DOMAIN.md).
// profile_slug est nullable : un order peut exister sans profil, ou avec un
// profil qui n'a pas opté in (is_profile_public=false) — voir CLAUDE.md.
export interface ArticlePublished {
  id: string;
  article_id: string;
  language: Lang;
  title: string;
  content: string;
  seo_meta_title: string | null;
  seo_meta_desc: string | null;
  tags: string[] | null;
  slug: string;
  pdf_url: string | null;
  published_url: string | null;
  moderated_at: string | null;
  angle: string;
  artwork_url: string | null;
  spotify_embed: string | null;
  youtube_clip_id: string | null;
  streaming_links: StreamingLink[] | null;
  order_id: string;
  artist_name: string;
  release_title: string;
  release_type: string;
  release_date: string | null;
  genre: string | null;
  bio: string | null;
  tracklist: string | null;
  profile_id: string | null;
  profile_slug: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  website_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  artist_spotify_url: string | null;
  artist_youtube_url: string | null;
  created_at: string;
  updated_at: string;
}

const ARTICLE_COLUMNS = "*";

export interface ListArticlesParams {
  lang: Lang;
  page?: number;
  limit?: number;
  genre?: string;
  artistSlug?: string;
}

export interface ListArticlesResult {
  items: ArticlePublished[];
  total: number;
  page: number;
  limit: number;
}

// Couche de requêtage : page/limit/genre sont déjà supportés même si le MVP
// ne branche qu'une pagination simple, pour ne pas restructurer la data
// layer le jour où une page recherche/filtres est ajoutée.
export async function listArticles({
  lang,
  page = 1,
  limit = 12,
  genre,
  artistSlug,
}: ListArticlesParams): Promise<ListArticlesResult> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("articles_published")
    .select(ARTICLE_COLUMNS, { count: "exact" })
    .eq("language", lang)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (genre) query = query.eq("genre", genre);
  if (artistSlug) query = query.eq("profile_slug", artistSlug);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    items: (data ?? []) as unknown as ArticlePublished[],
    total: count ?? 0,
    page,
    limit,
  };
}

// cache() dédupe l'appel entre generateMetadata et le composant de page
// (tous deux appelés pour la même requête App Router).
export const getArticleBySlug = cache(async function getArticleBySlug(
  slug: string,
  lang: Lang
): Promise<ArticlePublished | null> {
  const { data, error } = await supabase
    .from("articles_published")
    .select(ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("language", lang)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ArticlePublished | null;
});

// Traductions sœurs d'un article (même article_id, une ligne par langue
// publiée) — utilisé pour construire les vraies URLs alternates par langue
// (le slug change par traduction, donc un simple remplacement du segment
// /{lang}/ dans l'URL pointe vers un slug inexistant dans l'autre langue).
export const getSiblingTranslations = cache(async function getSiblingTranslations(
  articleId: string
): Promise<Pick<ArticlePublished, "language" | "slug" | "profile_slug" | "artist_name">[]> {
  const { data, error } = await supabase
    .from("articles_published")
    .select("language, slug, profile_slug, artist_name")
    .eq("article_id", articleId);

  if (error) throw error;
  return data ?? [];
});

// Segment [artistSlug] de l'URL d'un article : le profile_slug quand
// l'artiste a un profil public, sinon un slug dérivé du nom d'artiste
// snapshotté sur la commande (même recette que la migration SQL
// 20260626_add_profile_slug_and_visibility.sql côté letslink-promo).
// Cette valeur n'est qu'un segment d'URL cosmétique : la page article se
// résout uniquement via (slug, language), jamais via ce segment — voir
// app/[lang]/[artistSlug]/[articleSlug]/page.tsx.
export function getArticleUrlArtistSlug(
  article: Pick<ArticlePublished, "profile_slug" | "artist_name">
): string {
  return article.profile_slug ?? slugify(article.artist_name);
}

// Utilisé par sitemap.ts et generateStaticParams — pas de pagination ici,
// le volume d'articles reste modeste (SaaS de niche).
export async function getAllArticlesForStaticParams(): Promise<
  Pick<
    ArticlePublished,
    "article_id" | "slug" | "language" | "profile_slug" | "artist_name" | "updated_at"
  >[]
> {
  const { data, error } = await supabase
    .from("articles_published")
    .select("article_id, slug, language, profile_slug, artist_name, updated_at");

  if (error) throw error;
  return data ?? [];
}
