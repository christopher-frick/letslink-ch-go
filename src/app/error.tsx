"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorPageShell } from "@/components/layout/error-page-shell";
import "@/app/globals.css";

// Filet de sécurité racine : capture les erreurs qui échapperaient à
// app/[lang]/error.tsx (ex: erreur dans app/[lang]/layout.tsx lui-même,
// avant que le header/footer ne soit monté) — voir CLAUDE.md, section routing.
// Rendu hors du segment [lang], donc sans header/footer ; garde son propre
// html/body comme app/not-found.tsx, pour la même raison.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root error boundary]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorPageShell
          code="500"
          title="Quelque chose s'est mal passé"
          description="Une erreur inattendue est survenue. Réessaie, ou reviens plus tard."
          action={<Button onClick={() => reset()}>Réessayer</Button>}
        />
      </body>
    </html>
  );
}
