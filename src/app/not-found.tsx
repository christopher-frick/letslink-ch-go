import { ErrorPageShell } from "@/components/layout/error-page-shell";

// Filet de sécurité racine : ne se déclenche que pour un segment de langue
// invalide (ex: /xx) ou une route totalement hors structure — rendu hors du
// segment [lang], donc sans header/footer (voir CLAUDE.md, section routing).
// <html>/<body> viennent de app/layout.tsx (root), pas d'ici.
// Le lien d'accueil pointe vers "/" : le middleware redirige vers la langue
// détectée, on n'a pas besoin de connaître lang ici.
export default function RootNotFound() {
  return (
    <ErrorPageShell
      code="404"
      title="Page introuvable"
      description="Cette adresse ne correspond à aucune page du blog Let's Link."
    />
  );
}
