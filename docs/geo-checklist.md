# Checklist de vérification GEO/SEO — chantier F

## Déjà en place avant ce chantier (vérifié, rien à changer)
- [x] Sitemap multilingue avec hreflang alternates (`src/app/sitemap.ts`)
- [x] `llms.txt` à la racine (`public/llms.txt`, mis à jour dans ce chantier)
- [x] Canonical + hreflang par article/page artiste (`generateMetadata`, `alternates`)
- [x] JSON-LD `Article` + `MusicGroup` + `BreadcrumbList`
- [x] Slugs stables, immutables après publication ; redirection si segment `[artistSlug]` obsolète
- [x] Contenu HTML servi statiquement (ISR, `generateStaticParams`)
- [x] Sanitisation HTML (`sanitize-html`) avant tout rendu de contenu généré par IA

## Fait dans ce chantier
- [x] `robots.txt` : crawlers IA listés explicitement (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider...)
- [x] JSON-LD `MusicRecording`/`MusicAlbum` pour la sortie (en plus de `MusicGroup` pour l'artiste)
- [x] Chapeau factuel (qui/quoi/quand/genre/où écouter) en tête de chaque article, avec `<time datetime>`
- [x] Liens internes systématiques : article → autres articles du même artiste
- [x] Flux RSS par langue (`/{lang}/feed.xml`), référencé en `<link rel="alternate">` et dans `llms.txt`
- [x] `docs/llm-friendly-authoring.md` — contraintes à répercuter côté génération (chantier E)

## Pas fait — décision assumée
- [ ] `llms-full.txt` : évalué, pas construit. Nécessiterait une génération dynamique de
      tout le contenu texte des articles ; pas justifié au volume actuel (blog quasiment
      vide, cf. section validation ci-dessous). À reconsidérer si le volume d'articles
      et l'intérêt GEO grandissent.

## Reste à vérifier — pas faisable depuis cette session
- [ ] **Cloudflare "AI Scrapers and Crawlers"** : à vérifier manuellement dans le dashboard
      Cloudflare — ce réglage, souvent actif par défaut, bloquerait tous les crawlers IA
      avant même qu'ils lisent `robots.txt`. Annulerait tout ce chantier si actif.
- [ ] Validation Rich Results Test / schema validator sur une vraie page article publiée
      (voir limitation ci-dessous)
- [ ] Core Web Vitals (Lighthouse) sur une vraie page article publiée

## Limitation de validation — blog actuellement sans article publié

**Le `sitemap.xml` de prod ne contient aujourd'hui aucune URL d'article** — seulement
les 4 pages artiste (`chrizzy`, un profil sans article publié). Je n'ai donc pas pu
vérifier par `curl` le rendu réel du chapeau factuel, du JSON-LD `MusicRecording`, ou
des liens internes sur une vraie page article : ce code n'a jamais été exercé contre du
contenu réel. `tsc`/`build` passent, mais **la validation fonctionnelle de la page
article attend qu'un premier article soit réellement publié** (dépend du chantier C/E
côté `letslink-promo`). À refaire dès qu'un article existe :

```bash
curl -s https://go.letslink.ch/fr/<artiste>/<article-slug> | grep -E '<time datetime|application/ld\+json'
```
