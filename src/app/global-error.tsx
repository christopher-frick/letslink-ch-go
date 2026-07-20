"use client";

// Dernier filet : ne se déclenche que si app/layout.tsx ou app/error.tsx
// lui-même plante (extrêmement rare — on n'a pas de root layout complexe
// ici). Remplace tout l'arbre, doit donc fournir son propre html/body.
//
// Volontairement minimal et SANS dépendance à quoi que ce soit
// d'applicatif (ThemeProvider, shadcn/ui, globals.css/Tailwind) : si le
// crash du root layout vient justement du pipeline CSS/Tailwind, importer
// globals.css ici ferait planter ce filet de secours aussi. Styles inline
// uniquement — c'est le seul fichier du projet qui déroge à la convention
// Tailwind, précisément parce qu'il doit rester debout quand tout le reste
// est cassé.
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1rem",
    fontFamily: "system-ui, sans-serif",
    textAlign: "center" as const,
  },
  title: { fontSize: "1.5rem", fontWeight: 700 },
  description: { marginTop: "0.5rem", color: "#71717a" },
  button: {
    marginTop: "1.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d4d4d8",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    background: "none",
  },
};

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={styles.wrapper}>
        <div>
          <h1 style={styles.title}>Une erreur critique est survenue</h1>
          <p style={styles.description}>Merci de réessayer dans quelques instants.</p>
          <button onClick={() => reset()} style={styles.button}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
