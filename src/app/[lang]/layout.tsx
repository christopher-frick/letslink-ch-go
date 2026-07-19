import type { Metadata } from "next";
import type { WebSite, WithContext } from "schema-dts";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LangAlternatesProvider } from "@/components/layout/lang-alternates";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import "@/app/globals.css";

// Ce layout est le layout racine de l'app : il définit <html>/<body> pour
// toutes les pages (le blog n'a pas de page hors du segment [lang]), ce qui
// est le pattern standard Next.js App Router pour l'i18n par préfixe de route.

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
    <html lang={lang} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd(lang)) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LangAlternatesProvider>
            <TooltipProvider>
              <div className="flex min-h-screen flex-col">
                <SiteHeader lang={lang} />
                <main className="flex-1">{children}</main>
                <SiteFooter lang={lang} />
              </div>
            </TooltipProvider>
          </LangAlternatesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
