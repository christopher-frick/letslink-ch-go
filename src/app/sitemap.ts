import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { absoluteUrl, articlePath, artistPath } from "@/lib/seo";
import { getAllArticlesForStaticParams } from "@/lib/queries/articles";
import { getAllArtistSlugsForStaticParams } from "@/lib/queries/artists";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, artists] = await Promise.all([
    getAllArticlesForStaticParams(),
    getAllArtistSlugsForStaticParams(),
  ]);

  const homeEntries: MetadataRoute.Sitemap = LANGS.map((lang) => ({
    url: absoluteUrl(`/${lang}`),
    changeFrequency: "daily",
    priority: 1,
    alternates: {
      languages: Object.fromEntries(LANGS.map((l) => [l, absoluteUrl(`/${l}`)])),
    },
  }));

  const artistEntries: MetadataRoute.Sitemap = artists.flatMap((artist) =>
    LANGS.map((lang) => ({
      url: absoluteUrl(artistPath(lang, artist.slug)),
      lastModified: artist.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(LANGS.map((l) => [l, absoluteUrl(artistPath(l, artist.slug))])),
      },
    }))
  );

  // Regroupe les traductions d'un même article (article_id) pour construire
  // les alternates hreflang entre langues.
  const byArticleId = new Map<string, typeof articles>();
  for (const article of articles) {
    const group = byArticleId.get(article.article_id) ?? [];
    group.push(article);
    byArticleId.set(article.article_id, group);
  }

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => {
    const siblings = byArticleId.get(article.article_id) ?? [article];
    return {
      url: absoluteUrl(articlePath(article)),
      lastModified: article.updated_at,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          siblings.map((sibling) => [sibling.language, absoluteUrl(articlePath(sibling))])
        ),
      },
    };
  });

  return [...homeEntries, ...artistEntries, ...articleEntries];
}
