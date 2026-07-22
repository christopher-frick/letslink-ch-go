import { isLang } from "@/lib/i18n";
import { listArticles } from "@/lib/queries/articles";
import { absoluteUrl, articlePath } from "@/lib/seo";

export const revalidate = 86400;

// Flux RSS 2.0 par langue — très utilisé par les crawlers/agrégateurs, en plus du
// sitemap. Pas de dépendance externe : le format est simple et stable, un générateur
// XML dédié serait disproportionné pour ce volume d'articles (SaaS de niche).
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    return new Response("Not found", { status: 404 });
  }

  const { items } = await listArticles({ lang, limit: 50 });

  const itemsXml = items
    .map((article) => {
      const url = absoluteUrl(articlePath(article));
      const pubDate = new Date(article.moderated_at ?? article.created_at).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.seo_meta_desc ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Let's Link Blog (${lang})</title>
    <link>${absoluteUrl(`/${lang}`)}</link>
    <description>Sorties musicales des artistes indépendants suisses accompagnés par Let's Link.</description>
    <language>${lang}</language>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
