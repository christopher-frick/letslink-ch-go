# Contraintes d'écriture LLM-friendly — chantier F

> Ce que le template de génération côté `letslink-promo` (chantier E,
> `docs/generation-prompt.md` et `buildPrompt()` dans `src/app/api/jobs/worker/route.ts`)
> doit respecter pour qu'un article sorte déjà optimisé pour le blog. Document produit
> côté blog (celui qui consomme et sert le contenu), à répercuter côté génération.

## 1. Chapeau factuel en tête, storytelling après

La page article place maintenant un chapeau factuel juste après le `<h1>` : artiste,
type de sortie, genre, date (`<time datetime>`), lien d'écoute — avant tout paragraphe
narratif. Ce chapeau est construit côté blog depuis les colonnes structurées
(`artist_name`, `release_type`, `genre`, `release_date`, `streaming_links`), **pas**
depuis le texte généré par le LLM — donc rien à changer côté prompt pour cette partie.
Ce qui compte côté génération : que le **premier paragraphe du contenu** ne re-répète
pas bêtement le chapeau, mais enchaîne directement sur l'angle narratif (scène/anecdote),
cf. `docs/editorial-analysis.md` côté `letslink-promo`.

## 2. Mentions explicites du nom d'artiste et du titre

Ne pas laisser le texte généré retomber sur des pronoms ("il", "elle", "l'artiste") au-delà
du premier paragraphe — répéter le nom de l'artiste et le titre de la sortie à quelques
reprises dans le corps de l'article. C'est ce qu'un LLM tiers (ChatGPT, Perplexity...) et
un moteur de recherche associent le plus fiablement à une entité nommée. Actuellement,
`buildPrompt()` ne contient pas de consigne explicite là-dessus — à ajouter dans une
prochaine itération du prompt (chantier E) : *"mention the artist's name and release
title by name at least 2-3 times beyond the opening paragraph, not only pronouns"*.

## 3. Dates absolues, jamais relatives

Le contenu généré ne doit jamais écrire "cette année", "récemment", "le mois dernier" —
un article lu par un LLM des mois après publication perd cette information (contrairement
à `<time datetime>` dans le HTML, qui reste correct). `release_date` est disponible dans
les données envoyées au LLM (chantier E) — à ajouter comme consigne explicite : *"use the
absolute release date provided, never relative time expressions"*.

## 4. Sous-titres descriptifs (h2)

Le contrat JSON de génération n'inclut actuellement que des balises `<p>`, `<strong>`,
`<em>`, `<ul>`, `<li>` — pas de `<h2>` dans le contenu généré (seul le `<h1>` de la page
vient du `title`). Pour un article de 450-650 mots, ce n'est pas forcément un manque
(un seul bloc narratif reste lisible), mais si un format plus long est introduit
(ex. `angle=tracklist_breakdown` pour les albums, déjà prévu dans `promo.articles.angle`),
des `<h2>` descriptifs par section seraient à ajouter à la liste de balises autorisées
et à la consigne du prompt.

## État actuel (vérifié dans ce chantier)

Déjà conforme, rien à changer côté génération :
- HTML sémantique servi statiquement (ISR), contenu dans le HTML brut — vérifiable via
  `curl` une fois un article réel publié.
- `sanitize-html` neutralise tout risque XSS quel que soit le contenu produit
  (`components/articles/article-content.tsx`).
- Slugs stables, immutables après publication, canonical + hreflang corrects par langue.
