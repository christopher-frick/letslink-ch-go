import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, Instagram, Twitter, Youtube } from "lucide-react";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { getArtistBySlug, getAllArtistSlugsForStaticParams } from "@/lib/queries/artists";
import { listArticles } from "@/lib/queries/articles";
import { ArticleCard } from "@/components/articles/article-card";
import { absoluteUrl, artistPath, buildArtistJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400; // fallback temporisé — voir /api/revalidate pour le on-demand

const ARTICLES_PER_PAGE = 24;

export async function generateStaticParams() {
  const artists = await getAllArtistSlugsForStaticParams();
  return LANGS.flatMap((lang) => artists.map((artist) => ({ lang, artistSlug: artist.slug })));
}

interface ArtistPageProps {
  params: Promise<{ lang: string; artistSlug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { lang, artistSlug } = await params;
  if (!isLang(lang)) return {};

  const artist = await getArtistBySlug(artistSlug);
  if (!artist) return {};

  return {
    title: artist.artist_name,
    description: artist.bio ?? undefined,
    alternates: { canonical: absoluteUrl(artistPath(lang, artistSlug)) },
    openGraph: {
      url: absoluteUrl(artistPath(lang, artistSlug)),
      type: "profile",
      images: artist.avatar_url ? [{ url: artist.avatar_url }] : undefined,
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { lang, artistSlug } = await params;
  if (!isLang(lang)) notFound();

  const artist = await getArtistBySlug(artistSlug);
  if (!artist) notFound();

  const articles = await listArticles({
    lang: lang as Lang,
    artistSlug,
    limit: ARTICLES_PER_PAGE,
  });

  const jsonLd = [
    buildArtistJsonLd(artist),
    buildBreadcrumbJsonLd([
      { name: "Accueil", path: `/${lang}` },
      { name: artist.artist_name, path: artistPath(lang as Lang, artistSlug) },
    ]),
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <div className="relative size-28 overflow-hidden rounded-full bg-muted">
          {artist.avatar_url ? (
            <Image src={artist.avatar_url} alt={artist.artist_name} fill className="object-cover" />
          ) : null}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{artist.artist_name}</h1>
        {artist.genre || artist.city ? (
          <p className="text-muted-foreground">
            {[artist.genre, artist.city, artist.country].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {artist.bio ? <p className="max-w-2xl text-muted-foreground">{artist.bio}</p> : null}

        <div className="flex items-center gap-3 pt-2">
          {artist.website_url ? (
            <a href={artist.website_url} target="_blank" rel="noopener" aria-label="Site officiel">
              <Globe className="size-5 text-muted-foreground hover:text-foreground" />
            </a>
          ) : null}
          {artist.instagram_url ? (
            <a href={artist.instagram_url} target="_blank" rel="noopener" aria-label="Instagram">
              <Instagram className="size-5 text-muted-foreground hover:text-foreground" />
            </a>
          ) : null}
          {artist.twitter_url ? (
            <a href={artist.twitter_url} target="_blank" rel="noopener" aria-label="X / Twitter">
              <Twitter className="size-5 text-muted-foreground hover:text-foreground" />
            </a>
          ) : null}
          {artist.youtube_url ? (
            <a href={artist.youtube_url} target="_blank" rel="noopener" aria-label="YouTube">
              <Youtube className="size-5 text-muted-foreground hover:text-foreground" />
            </a>
          ) : null}
        </div>
      </div>

      <h2 className="mb-6 text-xl font-semibold">Articles</h2>
      {articles.items.length === 0 ? (
        <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
