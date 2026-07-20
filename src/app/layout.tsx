import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";

// Root layout unique : seul endroit qui déclare <html>/<body> dans toute
// l'app (app/[lang]/layout.tsx, app/not-found.tsx et app/error.tsx s'y
// imbriquent normalement). Avoir plusieurs fichiers déclarant chacun leur
// propre <html> à différents niveaux de l'arbre entrait en conflit sur le
// rendu à la demande (fallback ISR) — voir CLAUDE.md.
//
// lang="fr" par défaut : ce layout est au-dessus du segment [lang], donc il
// n'a pas la langue via params. On pourrait la lire via headers() (middleware
// la propagerait), mais next/headers force TOUTE l'app en rendu dynamique —
// inacceptable ici vu que les pages artiste/article reposent sur l'ISR
// statique. app/[lang]/layout.tsx corrige donc <html lang> côté client une
// fois la langue connue (voir LangHtmlAttribute) — coût minime, page déjà
// hydratée en quelques centaines de ms.
export const metadata: Metadata = {
  title: "Let's Link Blog — Musique indépendante suisse",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
