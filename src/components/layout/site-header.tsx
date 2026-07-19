import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LangSwitcher } from "@/components/layout/lang-switcher";
import type { Lang } from "@/lib/i18n";

export function SiteHeader({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} className="text-lg font-semibold tracking-tight">
          Let&apos;s Link <span className="text-muted-foreground">Blog</span>
        </Link>
        <div className="flex items-center gap-2">
          <LangSwitcher lang={lang} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
