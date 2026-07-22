import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Crawlers IA autorisés explicitement (en plus du "*" générique ci-dessous, qui les
// couvre déjà) — le blog est la promesse produit "connu des IA", ça doit être
// vérifiable sans ambiguïté dans robots.txt plutôt que de compter sur la règle
// générique implicite. Vérifier aussi côté Cloudflare que "AI Scrapers and Crawlers"
// n'est pas actif — ce réglage bloquerait ces crawlers avant même qu'ils lisent ceci.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
