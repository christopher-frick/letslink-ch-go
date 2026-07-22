import type { Article, MusicGroup, MusicRecording, MusicAlbum, Person, WithContext, BreadcrumbList } from "schema-dts";
import type { ArticlePublished } from "@/lib/queries/articles";
import type { ArtistPublic } from "@/lib/queries/artists";
import { getArticleUrlArtistSlug } from "@/lib/queries/articles";
import type { Lang } from "@/lib/i18n";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articlePath(article: Pick<ArticlePublished, "language" | "slug" | "profile_slug" | "artist_name">): string {
  const artistSlug = getArticleUrlArtistSlug(article);
  return `/${article.language}/${artistSlug}/${article.slug}`;
}

export function artistPath(lang: Lang, artistSlug: string): string {
  return `/${lang}/${artistSlug}`;
}

function socialLinks(entity: {
  website_url?: string | null;
  spotify_url?: string | null;
  apple_url?: string | null;
  youtube_url?: string | null;
  soundcloud_url?: string | null;
  tidal_url?: string | null;
  deezer_url?: string | null;
  amazon_url?: string | null;
  bandcamp_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  tiktok_url?: string | null;
  facebook_url?: string | null;
}): string[] {
  return [
    entity.website_url,
    entity.spotify_url,
    entity.apple_url,
    entity.youtube_url,
    entity.soundcloud_url,
    entity.tidal_url,
    entity.deezer_url,
    entity.amazon_url,
    entity.bandcamp_url,
    entity.instagram_url,
    entity.twitter_url,
    entity.tiktok_url,
    entity.facebook_url,
  ].filter((url): url is string => Boolean(url));
}

export function buildArticleJsonLd(article: ArticlePublished): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo_meta_desc ?? undefined,
    image: article.artwork_url ?? undefined,
    datePublished: article.moderated_at ?? article.created_at,
    dateModified: article.updated_at,
    inLanguage: article.language,
    url: absoluteUrl(articlePath(article)),
    author: {
      "@type": "Person",
      name: article.artist_name,
      sameAs: [article.artist_spotify_url, article.artist_youtube_url].filter(
        (url): url is string => Boolean(url)
      ),
    },
    publisher: {
      "@type": "Organization",
      name: "Let's Link",
      url: "https://letslink.ch",
    },
  };
}

// MusicAlbum pour EP/album/mixtape (plusieurs pistes), MusicRecording pour un single —
// même distinction que promo.orders.release_type côté letslink-promo.
export function buildReleaseJsonLd(article: ArticlePublished): WithContext<MusicRecording | MusicAlbum> {
  const isMultiTrack = ["ep", "album", "mixtape"].includes(article.release_type);
  const sameAs = (article.streaming_links ?? []).map((link) => link.url);

  return {
    "@context": "https://schema.org",
    "@type": isMultiTrack ? "MusicAlbum" : "MusicRecording",
    name: article.release_title,
    datePublished: article.release_date ?? undefined,
    genre: article.genre ?? undefined,
    byArtist: {
      "@type": "MusicGroup",
      name: article.artist_name,
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function buildArtistJsonLd(artist: ArtistPublic): WithContext<MusicGroup | Person> {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.artist_name,
    description: artist.bio ?? undefined,
    image: artist.avatar_url ?? undefined,
    genre: artist.genre ?? undefined,
    foundingLocation: artist.city ?? undefined,
    sameAs: socialLinks(artist),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
