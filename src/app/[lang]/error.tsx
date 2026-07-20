"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorPageShell } from "@/components/layout/error-page-shell";

// Boundary d'erreur pour tout le segment [lang] : couvre la home (aucun cache,
// requête Supabase live à chaque visite) et, en dernier recours, toute page
// article/artiste qui échouerait lors d'une régénération ISR à froid.
// Le layout au-dessus (header/footer) reste monté — seul ce contenu est
// remplacé, donc le site reste navigable même si Supabase/letslink-promo
// sont indisponibles.
export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[lang error boundary]", error);
  }, [error]);

  return (
    <ErrorPageShell
      code="500"
      title="Service temporairement indisponible"
      description="Impossible de charger cette page pour le moment. Les articles déjà publiés restent accessibles normalement — réessaie dans quelques instants."
      action={<Button onClick={() => reset()}>Réessayer</Button>}
    />
  );
}
