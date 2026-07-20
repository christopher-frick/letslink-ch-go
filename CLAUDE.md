# letslink-ch-go — Instructions Claude Code
> Lire aussi le `CLAUDE.md` racine du monorepo pour les conventions globales.

---

## But

Blog public multilingue (`go.letslink.ch`) qui rend les articles de blog
générés par `letslink-promo` pour les artistes indépendants suisses. Site en
lecture seule : aucune écriture en DB, aucune authentification.

---

## Stack

| Attribut     | Valeur                                                        |
|--------------|----------------------------------------------------------------|
| Framework    | Next.js 15 App Router · TypeScript strict                     |
| Styling      | TailwindCSS v4 (CSS-first) · shadcn/ui (style "new-york", neutral) |
| Package mgr  | pnpm                                                           |
| Data         | `@supabase/supabase-js` — client **anon, lecture seule uniquement** |
| Thème        | `next-themes` (adaptatif light/dark, pas dark-only)            |
| Déploiement  | Vercel                                                         |

Commandes :
```bash
cd letslink-ch-go
pnpm dev
pnpm build
pnpm lint
```

---

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabasekong-xrdm99qdk0ya5oqyw45gb00k.letslink.ch
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # même valeur que letslink-promo/.env.local (même projet Supabase)
NEXT_PUBLIC_APP_URL=https://go.letslink.ch
BLOG_REVALIDATE_SECRET=              # secret partagé avec letslink-promo, voir contrat ci-dessous
```

Voir `.env.example`. Ce site ne lit que deux vues publiques Supabase :
`public.articles_published` et `public.profiles_public` (voir
`letslink-promo/DOMAIN.md` pour leur contrat complet — source de vérité).

---

## Architecture des routes

```
/{lang}                                  → accueil : articles + artistes récents (lang ∈ en/fr/de/it)
/{lang}/{artistSlug}                     → page profil artiste (depuis profiles_public)
/{lang}/{artistSlug}/{articleSlug}       → page article
/                                        → redirigé vers /{lang détectée} par middleware.ts
```

**Le `[articleSlug]` est la seule clé réellement utilisée pour résoudre un
article** (`getArticleBySlug(slug, lang)`). Le segment `[artistSlug]` dans
l'URL est cosmétique : la page article recalcule le slug canonique
(`getArticleUrlArtistSlug()`) et **redirige (301 via `redirect()`)** si le
segment de l'URL ne correspond pas. Ne jamais utiliser `[artistSlug]` pour
filtrer la requête de l'article — uniquement `[articleSlug]` + `lang`.

### Nuance importante : `profile_slug` peut être `null`

`promo.orders.profile_id` est nullable (commande sans compte) et
`profiles_public` n'expose un profil que si `is_profile_public=true`. Donc
`articles_published.profile_slug` peut être `null` même pour un artiste ayant
un profil (juste privé). Dans ce cas, `getArticleUrlArtistSlug()`
(`lib/queries/articles.ts`) dérive un slug de secours depuis `artist_name` via
`lib/slugify.ts` (même recette que la migration SQL
`20260626_add_profile_slug_and_visibility.sql` côté letslink-promo). **La
page artiste `/{lang}/{artistSlug}` n'existe (via `generateStaticParams`) que
pour les slugs présents dans `profiles_public`** — un artiste non opt-in n'a
donc pas de page profil, mais ses articles restent accessibles et affichent
son nom en texte simple (non cliquable) sur la page article.

---

## Data layer (`src/lib/queries/`)

`listArticles()` et `listArtists()` acceptent déjà `page`/`limit`/`genre`
(et `artistSlug` pour le premier) même si le MVP ne branche qu'une
pagination simple sur la home — pensé pour qu'une future page
recherche/filtres n'oblige pas à retoucher cette couche.

---

## Rendu & revalidation (ISR)

- Pages artiste/article : `generateStaticParams` + `export const revalidate = 86400`
  (fallback 24h).
- Home (`/{lang}`) : rendue dynamiquement (lecture de `searchParams` pour la
  pagination — Next.js sort cette page du SSG dès qu'elle lit `searchParams`).
- Revalidation on-demand : `POST /api/revalidate` (voir contrat ci-dessous),
  à appeler dès qu'un article est publié/modéré côté letslink-promo, en plus
  du fallback 24h.

### Contrat `/api/revalidate` (à implémenter côté letslink-promo)

```
POST https://go.letslink.ch/api/revalidate
Authorization: Bearer ${BLOG_REVALIDATE_SECRET}
Content-Type: application/json

{ "articleSlug"?: string, "artistSlug"?: string }
```

Au moins un des deux champs requis. Appelé côté `letslink-promo` dans
`api/publish/route.ts` à chaque traduction publiée (`articleSlug` +
`artistSlug` si le profil de la commande est public). **Pas encore appelé**
quand `is_profile_public`/`slug` change sur un profil sans nouvelle
publication d'article (`api/profile/[id]/route.ts` côté letslink-promo) —
dans ce cas la page artiste reste sur le fallback 24h.

---

## Sécurité — sanitisation HTML

`articles_published.content` est du HTML brut généré par un LLM
(OpenRouter, côté letslink-promo), relu par un admin mais jamais sanitisé
dans le pipeline promo. Le composant `components/articles/article-content.tsx`
sanitise avec `sanitize-html` juste avant `dangerouslySetInnerHTML` — ne
jamais injecter `article.content` ailleurs sans repasser par ce composant.

**Ne jamais utiliser `isomorphic-dompurify`/`jsdom` côté serveur ici** :
jsdom lit des fichiers CSS internes sur le disque à l'exécution, ce que le
file-tracing serverless de Vercel n'embarque pas dans le bundle d'une
route. Résultat : 500 silencieux sur toute page rendue à la demande (donc
tout article publié après le dernier build, via le fallback ISR) alors que
tout fonctionne en local et sur les pages déjà pré-générées au build. Déjà
rencontré une fois — voir historique du composant.

---

## SEO

- `robots.ts` / `sitemap.ts` — sitemap multilingue avec hreflang alternates
  (regroupe les traductions d'un même `article_id`)
- JSON-LD (`lib/seo.ts`) : `WebSite` (layout), `Article` + `BreadcrumbList`
  (page article), `MusicGroup` + `BreadcrumbList` (page artiste)
- `public/llms.txt` — découvrabilité par les agents/LLM

---

## Conventions

- Commentaires en français
- Next.js App Router uniquement
- TypeScript strict, pas de `any` implicite
- Aucune écriture Supabase depuis ce projet (client anon, lecture seule)
