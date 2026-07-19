"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGS, LANG_LABELS, type Lang } from "@/lib/i18n";
import { useLangAlternates } from "@/components/layout/lang-alternates";

// Résout l'URL vers laquelle naviguer pour une langue cible :
// 1. Si la page courante a déclaré une vraie alternate pour cette langue
//    (ex: page article → sibling translation avec son propre slug), on
//    l'utilise — c'est la seule source fiable puisque le slug d'un article
//    change par traduction.
// 2. Sinon, simple remplacement du segment /{lang}/ : correct pour la home
//    (/{lang}) et la page artiste (/{lang}/{artistSlug}, le slug artiste
//    est le même quelle que soit la langue).
// 3. Cas page article sans traduction connue dans la langue cible : plutôt
//    qu'un lien mort vers un slug inexistant, on retombe sur la page de
//    l'artiste dans cette langue.
function resolveHref(pathname: string, targetLang: Lang, alternates: Partial<Record<Lang, string>>): string {
  const known = alternates[targetLang];
  if (known) return known;

  const segments = pathname.split("/").filter(Boolean);
  segments[0] = targetLang;

  const isArticlePage = segments.length === 3;
  if (isArticlePage) {
    return `/${segments[0]}/${segments[1]}`; // repli sur la page artiste
  }

  return `/${segments.join("/")}`;
}

export function LangSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  const { alternates } = useLangAlternates();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Changer de langue">
          <Languages className="size-4.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((option) => (
          <DropdownMenuItem
            key={option}
            disabled={option === lang}
            onClick={() => router.push(resolveHref(pathname, option, alternates))}
          >
            {LANG_LABELS[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
