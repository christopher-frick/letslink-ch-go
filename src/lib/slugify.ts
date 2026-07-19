// Reproduit la recette utilisée côté letslink-promo pour générer
// promo.profiles.slug (migration 20260626_add_profile_slug_and_visibility.sql),
// afin qu'un slug dérivé côté blog corresponde à celui qui serait généré en DB.
const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "") // accents
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}
