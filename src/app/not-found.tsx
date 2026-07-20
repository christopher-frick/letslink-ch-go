import { ErrorPageShell } from "@/components/layout/error-page-shell";
import "@/app/globals.css";

// Filet de sécurité racine : ne se déclenche que pour un segment de langue
// invalide (ex: /xx) ou une route totalement hors structure — rendu hors du
// segment [lang], donc sans header/footer (voir CLAUDE.md, section routing).
// Le lien d'accueil pointe vers "/" : le middleware redirige vers la langue
// détectée, on n'a pas besoin de connaître lang ici.
export default function RootNotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorPageShell
          code="404"
          title="Page introuvable"
          description="Cette adresse ne correspond à aucune page du blog Let's Link."
        />
      </body>
    </html>
  );
}
