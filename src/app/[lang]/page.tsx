import type { Metadata } from "next";
import { isLang, type Lang } from "@/lib/i18n";
import { listArticles } from "@/lib/queries/articles";
import { listArtists } from "@/lib/queries/artists";
import { ArticleCard } from "@/components/articles/article-card";
import { ArtistCard } from "@/components/artists/artist-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";

// Pas d'ISR ici : la lecture de `searchParams` (pagination) rend cette page
// dynamique par nature côté Next.js. Les pages artiste/article, elles,
// utilisent generateStaticParams + revalidate (ISR) — voir leurs fichiers.

const ARTICLES_PER_PAGE = 12;
const ARTISTS_PER_PAGE = 8;

interface HomePageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  return {
    alternates: { canonical: absoluteUrl(`/${lang}`) },
    openGraph: { url: absoluteUrl(`/${lang}`), type: "website" },
  };
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [articles, artists] = await Promise.all([
    listArticles({ lang: lang as Lang, page, limit: ARTICLES_PER_PAGE }),
    listArtists({ page: 1, limit: ARTISTS_PER_PAGE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(articles.total / ARTICLES_PER_PAGE));

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Le blog des artistes indépendants suisses
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Sorties, interviews et actus des artistes accompagnés par Let&apos;s Link.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">Derniers articles</h2>
        {articles.items.length === 0 ? (
          <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={page > 1 ? `/${lang}?page=${page - 1}` : undefined}
                  aria-disabled={page <= 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href={`/${lang}?page=${p}`} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={page < totalPages ? `/${lang}?page=${page + 1}` : undefined}
                  aria-disabled={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">Artistes</h2>
        {artists.items.length === 0 ? (
          <p className="text-muted-foreground">Aucun artiste public pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {artists.items.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} lang={lang as Lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
