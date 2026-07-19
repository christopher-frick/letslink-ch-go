"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ArtistPublic } from "@/lib/queries/artists";
import { artistPath } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export function ArtistCard({ artist, lang }: { artist: ArtistPublic; lang: Lang }) {
  const href = artistPath(lang, artist.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex h-full flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition hover:border-primary/50 hover:shadow-lg"
    >
      <Link href={href} className="relative block size-20 overflow-hidden rounded-full bg-muted">
        {artist.avatar_url ? (
          <Image src={artist.avatar_url} alt={artist.artist_name} fill className="object-cover" />
        ) : null}
      </Link>
      <Link href={href} className="font-semibold hover:underline">
        {artist.artist_name}
      </Link>
      {artist.genre ? <Badge variant="secondary">{artist.genre}</Badge> : null}
      {artist.city ? (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {artist.city}
        </p>
      ) : null}
      <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
        <Link href={href}>Voir le profil</Link>
      </Button>
    </motion.div>
  );
}
