import Link from "next/link";
import type { Lang } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>
          Un projet{" "}
          <a
            href="https://letslink.ch"
            className="font-medium text-foreground hover:underline"
            target="_blank"
            rel="noopener"
          >
            Let&apos;s Link
          </a>{" "}
          — la plateforme des artistes indépendants suisses.
        </p>
        <Link href={`/${lang}`} className="hover:text-foreground hover:underline">
          Voir tous les articles
        </Link>
        <a
          href="https://letslink.ch/privacy"
          className="hover:text-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Politique de confidentialité
        </a>
      </div>
    </footer>
  );
}
