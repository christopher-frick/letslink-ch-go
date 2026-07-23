import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { siSpotify, siApplemusic, siYoutube, siTidal, siDeezer, siSoundcloud } from "simple-icons";
import { Button } from "@/components/ui/button";

// Même mapping label → icône/couleur que chrizzy.letslink.ch (release-detail.tsx) —
// on garde les deux visuellement cohérents puisque ce sont les mêmes plateformes
// pour le même artiste. Amazon Music n'a pas d'icône dans simple-icons : repli sur
// une icône générique de lien externe.
const STREAMING_ICONS: Record<string, { path: string; hex: string } | undefined> = {
  Spotify: siSpotify,
  "Apple Music": siApplemusic,
  YouTube: siYoutube,
  Tidal: siTidal,
  Deezer: siDeezer,
  SoundCloud: siSoundcloud,
};

interface StreamingLinksProps {
  links: { label: string; url: string }[];
  title?: string;
}

export function StreamingLinks({ links, title }: StreamingLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <div className="flex flex-wrap gap-3">
        {links.map((link) => {
          const icon = STREAMING_ICONS[link.label];
          return (
            <Button key={link.url} asChild variant="outline" className="group">
              <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {icon ? (
                  <svg role="img" viewBox="0 0 24 24" width={18} height={18} fill={`#${icon.hex}`}>
                    <path d={icon.path} />
                  </svg>
                ) : (
                  <ExternalLink className="size-4" />
                )}
                <span>{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
