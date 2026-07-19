import sanitizeHtml from "sanitize-html";

// article.content est du HTML brut généré par un LLM (OpenRouter, côté
// letslink-promo) puis relu/édité par un admin avant publication, mais
// jamais sanitisé nulle part dans le pipeline — voir CLAUDE.md du blog.
// On sanitise donc ici, juste avant l'injection via dangerouslySetInnerHTML,
// en défense en profondeur contre un éventuel XSS stocké.
//
// sanitize-html plutôt qu'isomorphic-dompurify : ce dernier s'appuie sur
// jsdom, qui lit des fichiers CSS internes sur le disque à l'exécution —
// ça casse sur Vercel pour toute page rendue à la demande (ISR fallback,
// donc tout nouvel article pas encore dans le build statique), car le
// file-tracing serverless n'embarque pas ces assets jsdom. sanitize-html
// est pur JS, sans accès disque, donc fiable en serverless.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "em", "b", "i", "u",
    "ul", "ol", "li", "blockquote", "a", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

export function ArticleContent({ html }: { html: string }) {
  const clean = sanitizeHtml(html, SANITIZE_OPTIONS);

  return (
    <div
      className="prose prose-neutral max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
