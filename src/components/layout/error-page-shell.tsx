import Link from "next/link";
import { Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageShellProps {
  code?: string;
  title: string;
  description: string;
  // "/" plutôt qu'un chemin /{lang} explicite : le middleware redirige déjà
  // "/" vers la langue détectée, et lang n'est pas fiable à obtenir ici
  // (voir not-found.tsx racine, rendu hors du segment [lang]).
  homeHref?: string;
  action?: React.ReactNode;
}

// Shell partagé par app/not-found.tsx, app/[lang]/not-found.tsx,
// app/error.tsx et app/[lang]/error.tsx — même vocabulaire visuel que le
// reste du site (icône dans cercle muted, échelle typographique de la home,
// Button outline).
export function ErrorPageShell({
  code,
  title,
  description,
  homeHref = "/",
  action,
}: ErrorPageShellProps) {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
        <Music2 className="size-9 text-muted-foreground" />
      </div>
      {code ? (
        <p className="mb-2 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Erreur {code}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {action}
        <Button variant="outline" asChild>
          <Link href={homeHref}>Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
