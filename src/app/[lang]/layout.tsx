import type { Metadata } from "next";
import type { WebSite, WithContext } from "schema-dts";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LangAlternatesProvider } from "@/components/layout/lang-alternates";
import { LangHtmlAttribute } from "@/components/layout/lang-html-attribute";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";

// Layout imbriqué (pas de <html>/<body> ici — c'est app/layout.tsx, le vrai
// root, qui les porte ; voir CLAUDE.md pour pourquoi un seul endroit doit
// les déclarer).

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: {
      default: "Let's Link Blog — Musique indépendante suisse",
      template: "%s — Let's Link Blog",
    },
    description:
      "Articles, sorties et actualités des artistes indépendants suisses de l'écosystème Let's Link.",
    alternates: {
      canonical: absoluteUrl(`/${lang}`),
      languages: Object.fromEntries(LANGS.map((l) => [l, absoluteUrl(`/${l}`)])),
    },
  };
}

function buildWebsiteJsonLd(lang: Lang): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Let's Link Blog",
    url: absoluteUrl(`/${lang}`),
    inLanguage: lang,
  };
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      <LangHtmlAttribute lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd(lang)) }}
      />
      <LangAlternatesProvider>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader lang={lang} />
            <main className="flex-1">{children}</main>
            <SiteFooter lang={lang} />
          </div>
        </TooltipProvider>
      </LangAlternatesProvider>
    </>
  );
}
