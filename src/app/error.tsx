"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorPageShell } from "@/components/layout/error-page-shell";

// Filet de sécurité racine : capture les erreurs qui échapperaient à
// app/[lang]/error.tsx (ex: erreur dans app/[lang]/layout.tsx lui-même,
// avant que le header/footer ne soit monté) — voir CLAUDE.md, section routing.
// Rendu hors du segment [lang], donc sans header/footer.
// <html>/<body> viennent de app/layout.tsx (root), pas d'ici.
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
    <ErrorPageShell
      code="500"
      title="Quelque chose s'est mal passé"
      description="Une erreur inattendue est survenue. Réessaie, ou reviens plus tard."
      action={<Button onClick={() => reset()}>Réessayer</Button>}
    />
  );
}
