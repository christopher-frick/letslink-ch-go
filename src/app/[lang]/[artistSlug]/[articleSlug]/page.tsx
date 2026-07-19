import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import {
  getArticleBySlug,
  getArticleUrlArtistSlug,
  getAllArticlesForStaticParams,
  getSiblingTranslations,
  type ArticlePublished,
} from "@/lib/queries/articles";
import { ArticleContent } from "@/components/articles/article-content";
import { SetLangAlternates, type LangAlternates } from "@/components/layout/lang-alternates";
import {
  absoluteUrl,
  articlePath,
  artistPath,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";

// Construit la map langue → chemin relatif à partir des traductions sœurs
// (même article_id) — chaque traduction a son propre slug, donc c'est la
// seule façon fiable de savoir vers quelle URL naviguer par langue.
async function resolveLangAlternates(article: ArticlePublished): Promise<LangAlternates> {
  const siblings = await getSiblingTranslations(article.article_id);
  return Object.fromEntries(siblings.map((sibling) => [sibling.language, articlePath(sibling)]));
}

export const revalidate = 86400; // fallback temporisé — voir /api/revalidate pour le on-demand

export async function generateStaticParams() {
  const articles = await getAllArticlesForStaticParams();
  return articles.map((article) => ({
    lang: article.language,
    artistSlug: getArticleUrlArtistSlug(article),
    articleSlug: article.slug,
  }));
}

interface ArticlePageProps {
  params: Promise<{ lang: string; artistSlug: string; articleSlug: string }>;
}

async function resolveArticle(lang: string, articleSlug: string) {
  if (!isLang(lang)) return null;
  return getArticleBySlug(articleSlug, lang as Lang);
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang, articleSlug } = await params;
  const article = await resolveArticle(lang, articleSlug);
  if (!article) return {};

  const url = absoluteUrl(articlePath(article));
  const title = article.seo_meta_title ?? article.title;
  const description = article.seo_meta_desc ?? undefined;
  const langAlternates = await resolveLangAlternates(article);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        Object.entries(langAlternates).map(([l, path]) => [l, absoluteUrl(path)])
      ),
    },
    openGraph: {
      url,
      type: "article",
      title,
      description,
      images: article.artwork_url ? [{ url: article.artwork_url, width: 1200, height: 1200 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.artwork_url ? [article.artwork_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { lang, artistSlug, articleSlug } = await params;
  const article = await resolveArticle(lang, articleSlug);
  if (!article) notFound();

  // Le slug encode déjà tout (langue + article) — le segment [artistSlug] de
  // l'URL n'est que cosmétique. On redirige vers l'URL canonique s'il ne
  // correspond pas (ex: artist_name a changé depuis, ou lien mal formé),
  // pour éviter le duplicate content côté SEO.
  const canonicalArtistSlug = getArticleUrlArtistSlug(article);
  if (canonicalArtistSlug !== artistSlug) {
    redirect(articlePath(article));
  }

  const jsonLd = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd([
      { name: "Accueil", path: `/${lang}` },
      { name: article.artist_name, path: artistPath(lang as Lang, canonicalArtistSlug) },
      { name: article.title, path: articlePath(article) },
    ]),
  ];

  const langAlternates = await resolveLangAlternates(article);

  return (
    <article className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SetLangAlternates alternates={langAlternates} />
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm text-muted-foreground">
          {article.profile_slug ? (
            <Link href={artistPath(lang as Lang, canonicalArtistSlug)} className="hover:underline">
              {article.artist_name}
            </Link>
          ) : (
            article.artist_name
          )}
          {" · "}
          {article.release_title}
        </p>
        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>

        {article.artwork_url ? (
          <div className="relative mb-8 aspect-square w-full overflow-hidden rounded-lg bg-muted sm:aspect-video">
            <Image
              src={article.artwork_url}
              alt={article.release_title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        {article.spotify_embed ? (
          <iframe
            title="Spotify"
            src={article.spotify_embed}
            className="mb-8 h-[152px] w-full rounded-lg"
            loading="lazy"
            allow="encrypted-media"
          />
        ) : null}

        {article.youtube_clip_id ? (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              title="YouTube"
              src={`https://www.youtube-nocookie.com/embed/${article.youtube_clip_id}`}
              className="absolute inset-0 size-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        <ArticleContent html={article.content} />

        {article.streaming_links && article.streaming_links.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
            {article.streaming_links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener"
                className="rounded-full border px-4 py-1.5 text-sm hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
