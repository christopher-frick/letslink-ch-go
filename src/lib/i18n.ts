// Langues supportées par le blog — doit rester synchronisé avec l'enum
// `language` de promo.article_translations (letslink-promo/DOMAIN.md).
export const LANGS = ["en", "fr", "de", "it"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "fr";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

// Choisit la langue supportée la plus proche de l'en-tête Accept-Language,
// avec repli sur DEFAULT_LANG.
export function detectLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0].slice(0, 2).toLowerCase());

  for (const candidate of preferred) {
    if (isLang(candidate)) return candidate;
  }

  return DEFAULT_LANG;
}

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};
