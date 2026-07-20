"use client";

import "@/app/globals.css";

// Dernier filet : ne se déclenche que si app/layout.tsx ou app/error.tsx
// lui-même plante (extrêmement rare — on n'a pas de root layout complexe
// ici). Remplace tout l'arbre, doit donc fournir son propre html/body.
// Volontairement minimal et sans dépendance à des composants applicatifs
// (ThemeProvider, shadcn/ui) qui pourraient être la cause du crash.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-foreground antialiased">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Une erreur critique est survenue</h1>
          <p className="mt-2 text-muted-foreground">Merci de réessayer dans quelques instants.</p>
          <button
            onClick={() => reset()}
            className="mt-6 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
