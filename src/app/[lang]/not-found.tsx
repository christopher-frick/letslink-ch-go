import { ErrorPageShell } from "@/components/layout/error-page-shell";

// Rendu à l'intérieur de app/[lang]/layout.tsx (header/footer/thème déjà en
// place) — déclenché par les notFound() des pages artiste/article, ou toute
// route non reconnue sous /{lang}/*.
export default function LangNotFound() {
  return (
    <ErrorPageShell
      code="404"
      title="Cette page n'existe pas (encore)"
      description="L'article ou l'artiste que tu cherches est introuvable — il a peut-être été déplacé, ou n'a pas encore été publié."
    />
  );
}
