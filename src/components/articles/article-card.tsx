"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ArticlePublished } from "@/lib/queries/articles";
import { articlePath } from "@/lib/seo";

export function ArticleCard({ article }: { article: ArticlePublished }) {
  const href = articlePath(article);
  const date = article.moderated_at ?? article.created_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition hover:border-primary/50 hover:shadow-lg"
    >
      <Link href={href} className="relative block aspect-square overflow-hidden bg-muted">
        {article.artwork_url ? (
          <Image
            src={article.artwork_url}
            alt={article.release_title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {article.genre ? <Badge variant="secondary">{article.genre}</Badge> : null}
        <Link href={href} className="line-clamp-2 font-semibold leading-snug hover:underline">
          {article.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.seo_meta_desc}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <time dateTime={date}>{new Date(date).toLocaleDateString(article.language)}</time>
          <span aria-hidden>·</span>
          <span>{article.artist_name}</span>
        </div>
        <Button variant="outline" className="group/btn mt-2 w-full" asChild>
          <Link href={href}>
            Lire l&apos;article
            <span className="ml-1 inline-block transition-transform group-hover/btn:translate-x-1">
              →
            </span>
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
