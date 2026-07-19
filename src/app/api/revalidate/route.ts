import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { LANGS } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getArticleUrlArtistSlug } from "@/lib/queries/articles";

// Contrat attendu côté letslink-promo (à implémenter dans ce repo séparé,
// dans le flux de publication /api/publish) :
//
//   POST https://go.letslink.ch/api/revalidate
//   Authorization: Bearer ${BLOG_REVALIDATE_SECRET}
//   Content-Type: application/json
//   { "articleSlug"?: string, "artistSlug"?: string }
//
// Au moins un des deux champs doit être fourni. Voir CLAUDE.md du blog.
export async function POST(request: NextRequest) {
  const secret = process.env.BLOG_REVALIDATE_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { articleSlug?: string; artistSlug?: string }
    | null;

  if (!body || (!body.articleSlug && !body.artistSlug)) {
    return NextResponse.json(
      { error: "articleSlug or artistSlug required" },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];

  // Les home pages listent les articles/artistes récents — toujours à jour.
  for (const lang of LANGS) {
    revalidatePath(`/${lang}`);
    revalidated.push(`/${lang}`);
  }

  if (body.artistSlug) {
    for (const lang of LANGS) {
      const path = `/${lang}/${body.artistSlug}`;
      revalidatePath(path);
      revalidated.push(path);
    }
  }

  if (body.articleSlug) {
    const { data: article } = await supabase
      .from("articles_published")
      .select("slug, language, profile_slug, artist_name")
      .eq("slug", body.articleSlug)
      .maybeSingle();

    if (article) {
      const artistSlug = getArticleUrlArtistSlug(article);
      const path = `/${article.language}/${artistSlug}/${article.slug}`;
      revalidatePath(path);
      revalidated.push(path);
    }
  }

  return NextResponse.json({ revalidated });
}
