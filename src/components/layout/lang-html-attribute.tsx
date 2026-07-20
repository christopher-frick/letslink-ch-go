"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";

// app/layout.tsx (root) ne connaît pas la langue de la page (il est
// au-dessus du segment [lang], et lire headers() là-bas forcerait toute
// l'app en rendu dynamique — inacceptable vu l'ISR sur les pages
// artiste/article). Ce composant corrige <html lang> côté client une fois
// la vraie langue connue.
export function LangHtmlAttribute({ lang }: { lang: Lang }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
