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

// Remplace le premier segment (/fr/...) par la langue choisie, en gardant
// le reste du chemin — utile car l'artiste/article ciblé peut ne pas exister
// dans la nouvelle langue, mais on laisse la page cible gérer le 404.
function swapLangInPath(pathname: string, nextLang: Lang): string {
  const segments = pathname.split("/");
  segments[1] = nextLang;
  return segments.join("/");
}

export function LangSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();

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
            onClick={() => router.push(swapLangInPath(pathname, option))}
          >
            {LANG_LABELS[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
