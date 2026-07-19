import DOMPurify from "isomorphic-dompurify";

// article.content est du HTML brut généré par un LLM (OpenRouter, côté
// letslink-promo) puis relu/édité par un admin avant publication, mais
// jamais sanitisé nulle part dans le pipeline — voir CLAUDE.md du blog.
// On sanitise donc ici, juste avant l'injection via dangerouslySetInnerHTML,
// en défense en profondeur contre un éventuel XSS stocké.
export function ArticleContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className="prose prose-neutral max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
